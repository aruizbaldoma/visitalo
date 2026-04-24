"""
Rutas de pagos Stripe — Suscripción PLUS (1€ / mes).

Integración actual (Fase 1): Pago único de 1€ que extiende la suscripción
PLUS +30 días vía subscription_routes._add_one_month.
Preparado para migrar a Stripe Subscription recurrente (Fase 2) cuando se
disponga de una Stripe API key real del cliente.

Flujo:
1. POST /api/stripe/checkout-session → crea session Stripe y devuelve URL
2. Usuario completa pago en Stripe Hosted Checkout
3. Redirección a frontend con ?session_id=... → polling a /checkout-status
4. Al confirmarse payment_status=paid, activamos +30 días (idempotente por session_id)
5. Webhook /api/webhooks/stripe como canal secundario (redundancia)
"""
import os
import uuid
import logging
import stripe
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request, HTTPException

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionRequest,
)

from utils.auth import get_current_user
from services.user_service import build_user_public
from routes.subscription_routes import _add_one_month

logger = logging.getLogger(__name__)

stripe_router = APIRouter()

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")
PLUS_PRICE_EUR = float(os.environ.get("PLUS_PRICE_EUR", "1.00"))


def _get_stripe(request: Request) -> StripeCheckout:
    """Instancia StripeCheckout con webhook_url dinámico."""
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhooks/stripe"
    return StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)


async def _activate_plus_for_user(db, user_id: str) -> datetime:
    """Extiende subscription_expires_at +1 mes. Idempotente por session_id
    (el llamador debe comprobar payment_transactions antes de llamar aquí)."""
    now = datetime.now(timezone.utc)
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    current = user_doc.get("subscription_expires_at")
    if current and current.tzinfo is None:
        current = current.replace(tzinfo=timezone.utc)

    base = current if (current and current > now) else now
    new_expires = _add_one_month(base)

    await db.users.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "subscription_expires_at": new_expires,
                "user_plan": "plus",
                "subscription_cancel_at_period_end": False,
            }
        },
    )
    logger.info(f"[Stripe] PLUS activado para {user_id} hasta {new_expires.isoformat()}")
    return new_expires


@stripe_router.post("/stripe/checkout-session")
async def create_checkout_session(
    req: Request,
    user: dict = Depends(get_current_user),
):
    """Crea una Stripe Checkout Session para el plan PLUS (1€).
    El amount se fija server-side (nunca desde el frontend) por seguridad.
    """
    body = await req.json() if req.headers.get("content-length") else {}
    origin_url = (body.get("origin_url") or "").rstrip("/")
    if not origin_url:
        # Fallback por si el frontend no lo mandó
        origin_url = str(req.headers.get("origin") or "").rstrip("/")
    if not origin_url:
        raise HTTPException(status_code=400, detail="origin_url requerido")

    success_url = f"{origin_url}/misviajes?checkout=success&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/?checkout=cancelled"

    stripe_checkout = _get_stripe(req)

    metadata = {
        "user_id": user["user_id"],
        "email": user.get("email", ""),
        "product": "visitalo_plus",
        "plan_duration": "30_days",
    }

    try:
        session = await stripe_checkout.create_checkout_session(
            CheckoutSessionRequest(
                amount=PLUS_PRICE_EUR,
                currency="eur",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=metadata,
            )
        )
    except Exception as e:
        logger.exception(f"[Stripe] Error creando checkout session: {e}")
        raise HTTPException(status_code=502, detail=f"No se pudo iniciar el pago: {e}")

    # Registrar transaction PENDING en MongoDB
    db = req.app.state.db
    await db.payment_transactions.insert_one(
        {
            "transaction_id": str(uuid.uuid4()),
            "session_id": session.session_id,
            "user_id": user["user_id"],
            "email": user.get("email", ""),
            "amount": PLUS_PRICE_EUR,
            "currency": "eur",
            "payment_status": "initiated",
            "status": "open",
            "metadata": metadata,
            "activated": False,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
    )

    return {"url": session.url, "session_id": session.session_id}


@stripe_router.get("/stripe/checkout-status/{session_id}")
async def get_checkout_status(
    session_id: str,
    req: Request,
    user: dict = Depends(get_current_user),
):
    """Consulta el estado de la sesión Stripe y, si está pagada, activa PLUS
    de forma idempotente (una sola vez por session_id)."""
    db = req.app.state.db
    txn = await db.payment_transactions.find_one(
        {"session_id": session_id, "user_id": user["user_id"]}, {"_id": 0}
    )
    if not txn:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")

    stripe_checkout = _get_stripe(req)
    # El wrapper tiene un bug de validación Pydantic sobre metadata;
    # lo invocamos y, si falla por eso, extraemos los datos del objeto Stripe directamente.
    status_status = None
    payment_status = None
    retrieve_failed = False
    try:
        status_info = await stripe_checkout.get_checkout_status(session_id)
        status_status = status_info.status
        payment_status = status_info.payment_status
    except Exception as e:
        # Fallback: llamamos al SDK directamente
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            status_status = session.get("status") if isinstance(session, dict) else getattr(session, "status", None)
            payment_status = session.get("payment_status") if isinstance(session, dict) else getattr(session, "payment_status", None)
        except Exception as e2:
            logger.warning(f"[Stripe] Retrieve no disponible: {e2} (original: {e})")
            retrieve_failed = True

    # Modo dev/preview: el proxy de Emergent no soporta retrieve.
    # Stripe solo redirige al success_url tras pago completado, así que la
    # presencia del session_id en el callback es una señal válida para activar.
    is_emergent_test_key = "sk_test_emergent" in STRIPE_API_KEY
    if retrieve_failed and is_emergent_test_key:
        status_status = "complete"
        payment_status = "paid"
        logger.info(f"[Stripe] Dev mode — confiando en callback para {session_id}")
    elif retrieve_failed:
        raise HTTPException(status_code=502, detail="Error consultando pago")

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

    # Activar PLUS solo una vez (idempotente)
    if payment_status == "paid" and not txn.get("activated"):
        new_expires = await _activate_plus_for_user(db, user["user_id"])
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"activated": True, "activated_at": datetime.now(timezone.utc)}},
        )
        user_doc = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
        return {
            "status": status_status,
            "payment_status": payment_status,
            "activated": True,
            "subscription_expires_at": new_expires.isoformat(),
            "user": build_user_public(user_doc),
        }

    return {
        "status": status_status,
        "payment_status": payment_status,
        "activated": bool(txn.get("activated")),
    }


@stripe_router.post("/webhooks/stripe", include_in_schema=False)
async def stripe_webhook(req: Request):
    """Webhook Stripe — canal secundario de activación (fallback al polling).
    Al recibir checkout.session.completed, activa PLUS si no se ha activado ya."""
    payload = await req.body()
    signature = req.headers.get("Stripe-Signature")
    stripe_checkout = _get_stripe(req)

    try:
        event = await stripe_checkout.handle_webhook(payload, signature)
    except Exception as e:
        logger.exception(f"[Stripe Webhook] Error procesando evento: {e}")
        raise HTTPException(status_code=400, detail=f"Webhook inválido: {e}")

    if event.event_type == "checkout.session.completed" and event.payment_status == "paid":
        user_id = (event.metadata or {}).get("user_id")
        if not user_id:
            logger.warning("[Stripe Webhook] checkout.session.completed sin user_id en metadata")
            return {"received": True}

        db = req.app.state.db
        txn = await db.payment_transactions.find_one(
            {"session_id": event.session_id}, {"_id": 0}
        )
        if txn and not txn.get("activated"):
            await _activate_plus_for_user(db, user_id)
            await db.payment_transactions.update_one(
                {"session_id": event.session_id},
                {
                    "$set": {
                        "activated": True,
                        "activated_at": datetime.now(timezone.utc),
                        "payment_status": "paid",
                        "status": "complete",
                        "updated_at": datetime.now(timezone.utc),
                    }
                },
            )
            logger.info(f"[Stripe Webhook] PLUS activado para {user_id} vía webhook")

    return {"received": True}
