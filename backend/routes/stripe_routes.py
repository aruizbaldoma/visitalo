"""
Rutas de pagos Stripe — Suscripción PLUS recurrente (1€ / mes).

Flujo:
1. POST /api/stripe/checkout-session → crea Stripe Checkout en mode=subscription
2. Usuario completa pago en Stripe Hosted Checkout
3. Redirección a frontend con ?session_id=... → polling a /checkout-status
4. Webhook /api/webhooks/stripe maneja eventos (canal principal de sincronización):
   - checkout.session.completed → activa PLUS por primera vez
   - invoice.payment_succeeded → extiende expires_at en cada renovación
   - customer.subscription.updated → sincroniza estado
   - customer.subscription.deleted → desactiva al fin del periodo
"""
import os
import uuid
import logging
from datetime import datetime, timezone
import stripe
from fastapi import APIRouter, Depends, Request, HTTPException

from utils.auth import get_current_user
from services.user_service import build_user_public
from routes.subscription_routes import _add_one_month

logger = logging.getLogger(__name__)
stripe_router = APIRouter()


def _get_stripe_config():
    """Lee env vars de forma lazy y configura stripe.api_key on-the-fly."""
    api_key = os.environ.get("STRIPE_API_KEY")
    price_id = os.environ.get("STRIPE_PRICE_ID")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    if api_key:
        stripe.api_key = api_key
    return api_key, price_id, webhook_secret


# ---------- Helpers ----------
def _iso_or_now(ts):
    """Convierte un timestamp unix (int) a datetime UTC. None si inválido."""
    if not ts:
        return None
    try:
        return datetime.fromtimestamp(int(ts), tz=timezone.utc)
    except Exception:
        return None


async def _set_user_subscription(
    db,
    user_id: str,
    *,
    subscription_expires_at=None,
    subscription_active=None,
    stripe_customer_id=None,
    stripe_subscription_id=None,
    cancel_at_period_end=None,
):
    """Actualiza el estado de suscripción PLUS de un usuario con los campos dados."""
    update = {"user_plan": "plus"}
    if subscription_expires_at is not None:
        update["subscription_expires_at"] = subscription_expires_at
    if stripe_customer_id is not None:
        update["stripe_customer_id"] = stripe_customer_id
    if stripe_subscription_id is not None:
        update["stripe_subscription_id"] = stripe_subscription_id
    if cancel_at_period_end is not None:
        update["subscription_cancel_at_period_end"] = bool(cancel_at_period_end)

    await db.users.update_one({"user_id": user_id}, {"$set": update})


# ---------- Endpoints ----------
@stripe_router.post("/stripe/checkout-session")
async def create_checkout_session(
    req: Request,
    user: dict = Depends(get_current_user),
):
    """Crea una Stripe Checkout Session en modo subscription para el plan PLUS.
    Reutiliza el stripe_customer_id si el usuario ya tiene uno."""
    STRIPE_API_KEY, STRIPE_PRICE_ID, _ = _get_stripe_config()
    if not STRIPE_API_KEY or not STRIPE_PRICE_ID:
        raise HTTPException(status_code=503, detail="Stripe no configurado (faltan keys)")

    body = await req.json() if req.headers.get("content-length") else {}
    origin_url = (body.get("origin_url") or req.headers.get("origin") or "").rstrip("/")
    if not origin_url:
        raise HTTPException(status_code=400, detail="origin_url requerido")

    success_url = f"{origin_url}/misviajes?checkout=success&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/?checkout=cancelled"

    db = req.app.state.db
    user_doc = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    stripe_customer_id = user_doc.get("stripe_customer_id") if user_doc else None

    session_kwargs = dict(
        mode="subscription",
        payment_method_types=["card"],
        line_items=[{"price": STRIPE_PRICE_ID, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
        allow_promotion_codes=True,
        metadata={
            "user_id": user["user_id"],
            "email": user.get("email", ""),
            "product": "visitalo_plus",
        },
        subscription_data={
            "metadata": {
                "user_id": user["user_id"],
                "email": user.get("email", ""),
            },
        },
    )

    if stripe_customer_id:
        session_kwargs["customer"] = stripe_customer_id
    else:
        # Pre-rellena email para acelerar checkout
        if user.get("email"):
            session_kwargs["customer_email"] = user["email"]

    try:
        session = stripe.checkout.Session.create(**session_kwargs)
    except Exception as e:
        logger.exception(f"[Stripe] Error creando checkout session: {e}")
        raise HTTPException(status_code=502, detail=f"No se pudo iniciar el pago: {e}")

    # Registrar transaction PENDING
    await db.payment_transactions.insert_one(
        {
            "transaction_id": str(uuid.uuid4()),
            "session_id": session.id,
            "user_id": user["user_id"],
            "email": user.get("email", ""),
            "amount": 1.0,
            "currency": "eur",
            "payment_status": "initiated",
            "status": "open",
            "mode": "subscription",
            "metadata": session_kwargs["metadata"],
            "activated": False,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
    )

    return {"url": session.url, "session_id": session.id}


@stripe_router.get("/stripe/checkout-status/{session_id}")
async def get_checkout_status(
    session_id: str,
    req: Request,
    user: dict = Depends(get_current_user),
):
    """Consulta el estado de la sesión Stripe. Si está pagada y aún no se activó,
    activa PLUS localmente (canal secundario al webhook)."""
    STRIPE_API_KEY, _, _ = _get_stripe_config()
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=503, detail="Stripe no configurado")

    db = req.app.state.db
    txn = await db.payment_transactions.find_one(
        {"session_id": session_id, "user_id": user["user_id"]}, {"_id": 0}
    )
    if not txn:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")

    try:
        session = stripe.checkout.Session.retrieve(
            session_id, expand=["subscription", "subscription.items.data.price"]
        )
    except Exception as e:
        logger.exception(f"[Stripe] Error consultando status: {e}")
        raise HTTPException(status_code=502, detail="Error consultando pago")

    status_status = session.get("status") if isinstance(session, dict) else session.status
    payment_status = session.get("payment_status") if isinstance(session, dict) else session.payment_status

    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "status": status_status,
                "payment_status": payment_status,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    if payment_status == "paid" and not txn.get("activated"):
        # Activar PLUS con los datos de la suscripción
        sub = session.get("subscription") if isinstance(session, dict) else session.subscription
        customer_id = session.get("customer") if isinstance(session, dict) else session.customer

        sub_id = None
        expires_at = _add_one_month(datetime.now(timezone.utc))
        cancel_at_period_end = False

        if sub:
            if isinstance(sub, str):
                try:
                    sub = stripe.Subscription.retrieve(sub)
                except Exception:
                    sub = None
            if sub:
                sub_id = sub.get("id") if isinstance(sub, dict) else sub.id
                period_end = (
                    sub.get("current_period_end")
                    if isinstance(sub, dict)
                    else getattr(sub, "current_period_end", None)
                )
                if period_end:
                    expires_at = _iso_or_now(period_end) or expires_at
                cancel_flag = (
                    sub.get("cancel_at_period_end")
                    if isinstance(sub, dict)
                    else getattr(sub, "cancel_at_period_end", False)
                )
                cancel_at_period_end = bool(cancel_flag)

        await _set_user_subscription(
            db,
            user["user_id"],
            subscription_expires_at=expires_at,
            stripe_customer_id=customer_id,
            stripe_subscription_id=sub_id,
            cancel_at_period_end=cancel_at_period_end,
        )
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "activated": True,
                    "activated_at": datetime.now(timezone.utc),
                    "stripe_subscription_id": sub_id,
                    "stripe_customer_id": customer_id,
                }
            },
        )
        user_doc = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
        return {
            "status": status_status,
            "payment_status": payment_status,
            "activated": True,
            "subscription_expires_at": expires_at.isoformat() if expires_at else None,
            "user": build_user_public(user_doc),
        }

    return {
        "status": status_status,
        "payment_status": payment_status,
        "activated": bool(txn.get("activated")),
    }


@stripe_router.post("/stripe/portal")
async def create_billing_portal_session(
    req: Request,
    user: dict = Depends(get_current_user),
):
    """Abre el Stripe Billing Portal para que el usuario gestione/cancele su suscripción."""
    STRIPE_API_KEY, _, _ = _get_stripe_config()
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=503, detail="Stripe no configurado")

    db = req.app.state.db
    user_doc = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not user_doc or not user_doc.get("stripe_customer_id"):
        raise HTTPException(status_code=400, detail="No tienes suscripción activa")

    body = await req.json() if req.headers.get("content-length") else {}
    origin_url = (body.get("origin_url") or req.headers.get("origin") or "").rstrip("/")
    return_url = f"{origin_url}/misviajes" if origin_url else "https://visitalo.es/misviajes"

    try:
        portal = stripe.billing_portal.Session.create(
            customer=user_doc["stripe_customer_id"],
            return_url=return_url,
        )
    except Exception as e:
        logger.exception(f"[Stripe] Error abriendo billing portal: {e}")
        raise HTTPException(status_code=502, detail=f"Error abriendo portal: {e}")

    return {"url": portal.url}


@stripe_router.post("/webhooks/stripe", include_in_schema=False)
async def stripe_webhook(req: Request):
    """Recibe eventos de Stripe firmados. Verifica firma con STRIPE_WEBHOOK_SECRET."""
    _, _, STRIPE_WEBHOOK_SECRET = _get_stripe_config()
    payload = await req.body()
    signature = req.headers.get("Stripe-Signature", "")

    # Verificación de firma (obligatoria si WEBHOOK_SECRET está configurado)
    if STRIPE_WEBHOOK_SECRET:
        try:
            event = stripe.Webhook.construct_event(
                payload=payload, sig_header=signature, secret=STRIPE_WEBHOOK_SECRET
            )
        except stripe.error.SignatureVerificationError as e:
            logger.warning(f"[Stripe Webhook] Firma inválida: {e}")
            raise HTTPException(status_code=400, detail="Firma inválida")
        except Exception as e:
            logger.exception(f"[Stripe Webhook] Error parseando evento: {e}")
            raise HTTPException(status_code=400, detail="Evento inválido")
    else:
        # Fallback sin verificación (solo dev sin webhook secret configurado)
        import json
        try:
            event = json.loads(payload)
        except Exception:
            raise HTTPException(status_code=400, detail="Payload inválido")

    event_type = event["type"] if isinstance(event, dict) else event.type
    data_object = (
        event["data"]["object"]
        if isinstance(event, dict)
        else event.data.object
    )

    db = req.app.state.db
    logger.info(f"[Stripe Webhook] Recibido evento: {event_type}")

    # ---------- checkout.session.completed ----------
    if event_type == "checkout.session.completed":
        session = data_object
        meta = session.get("metadata") or {}
        user_id = meta.get("user_id")
        session_id = session.get("id")
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")

        if not user_id:
            logger.warning("[Stripe Webhook] checkout.session.completed sin user_id")
            return {"received": True}

        # Obtener el periodo de la suscripción
        expires_at = _add_one_month(datetime.now(timezone.utc))
        cancel_flag = False
        if subscription_id:
            try:
                sub = stripe.Subscription.retrieve(subscription_id)
                expires_at = _iso_or_now(sub.current_period_end) or expires_at
                cancel_flag = bool(getattr(sub, "cancel_at_period_end", False))
            except Exception as e:
                logger.warning(f"[Stripe Webhook] No se pudo recuperar sub {subscription_id}: {e}")

        await _set_user_subscription(
            db,
            user_id,
            subscription_expires_at=expires_at,
            stripe_customer_id=customer_id,
            stripe_subscription_id=subscription_id,
            cancel_at_period_end=cancel_flag,
        )
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "activated": True,
                    "activated_at": datetime.now(timezone.utc),
                    "stripe_subscription_id": subscription_id,
                    "stripe_customer_id": customer_id,
                    "payment_status": "paid",
                    "status": "complete",
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )
        logger.info(f"[Stripe Webhook] PLUS activado para {user_id}")

    # ---------- invoice.payment_succeeded (renovación) ----------
    elif event_type == "invoice.payment_succeeded":
        invoice = data_object
        customer_id = invoice.get("customer")
        sub_id = invoice.get("subscription")
        if not sub_id:
            return {"received": True}
        try:
            sub = stripe.Subscription.retrieve(sub_id)
            expires_at = _iso_or_now(sub.current_period_end)
        except Exception:
            expires_at = None

        user_doc = await db.users.find_one(
            {"stripe_customer_id": customer_id}, {"_id": 0, "user_id": 1}
        )
        if user_doc and expires_at:
            await _set_user_subscription(
                db,
                user_doc["user_id"],
                subscription_expires_at=expires_at,
            )
            logger.info(f"[Stripe Webhook] Renovación OK: user={user_doc['user_id']} hasta {expires_at.isoformat()}")

    # ---------- customer.subscription.updated ----------
    elif event_type == "customer.subscription.updated":
        sub = data_object
        customer_id = sub.get("customer")
        expires_at = _iso_or_now(sub.get("current_period_end"))
        cancel_flag = bool(sub.get("cancel_at_period_end"))

        user_doc = await db.users.find_one(
            {"stripe_customer_id": customer_id}, {"_id": 0, "user_id": 1}
        )
        if user_doc:
            await _set_user_subscription(
                db,
                user_doc["user_id"],
                subscription_expires_at=expires_at,
                cancel_at_period_end=cancel_flag,
            )
            logger.info(f"[Stripe Webhook] Suscripción actualizada: user={user_doc['user_id']} cancel_at_period_end={cancel_flag}")

    # ---------- customer.subscription.deleted ----------
    elif event_type == "customer.subscription.deleted":
        sub = data_object
        customer_id = sub.get("customer")
        # Dejamos subscription_expires_at en el pasado para que subscription_active→false
        user_doc = await db.users.find_one(
            {"stripe_customer_id": customer_id}, {"_id": 0, "user_id": 1}
        )
        if user_doc:
            await db.users.update_one(
                {"user_id": user_doc["user_id"]},
                {
                    "$set": {
                        "subscription_expires_at": datetime.now(timezone.utc),
                        "subscription_cancel_at_period_end": False,
                        "user_plan": "basic",
                    }
                },
            )
            logger.info(f"[Stripe Webhook] Suscripción cancelada: user={user_doc['user_id']}")

    return {"received": True}
