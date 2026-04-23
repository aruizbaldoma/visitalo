"""
Rutas de Suscripción PLUS
Estructura preparada para integración futura con Stripe.
Por ahora expone un endpoint que extiende la suscripción 1 mes (mock / admin).
"""
from fastapi import APIRouter, Depends, Request
from datetime import datetime, timezone, timedelta

from utils.auth import get_current_user
from services.user_service import build_user_public


subscription_router = APIRouter()


def _add_one_month(dt: datetime) -> datetime:
    """Suma 1 mes al timestamp dado (mismo día del mes siguiente).
    Si el día no existe en el siguiente mes (p.ej. 31), usa el último día disponible.
    """
    year = dt.year + (1 if dt.month == 12 else 0)
    month = 1 if dt.month == 12 else dt.month + 1
    day = dt.day
    # Probar reducir día hasta que sea válido
    for d in range(day, 27, -1):
        try:
            return dt.replace(year=year, month=month, day=d)
        except ValueError:
            continue
    return dt.replace(year=year, month=month, day=28)


@subscription_router.post("/activate")
async def activate_subscription(
    req: Request,
    user: dict = Depends(get_current_user),
):
    """Activa/renueva la suscripción PLUS por 1 mes.

    NOTA: este endpoint es el stub previo a la integración de Stripe.
    Cuando Stripe esté conectado, se llamará desde el webhook
    `invoice.payment_succeeded` para extender la fecha de expiración.
    """
    db = req.app.state.db
    now = datetime.now(timezone.utc)

    user_doc = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    current = user_doc.get("subscription_expires_at")
    if current and current.tzinfo is None:
        current = current.replace(tzinfo=timezone.utc)

    base = current if (current and current > now) else now
    new_expires = _add_one_month(base)

    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"subscription_expires_at": new_expires, "user_plan": "plus"}},
    )

    user_doc["subscription_expires_at"] = new_expires
    user_doc["user_plan"] = "plus"
    return {
        "message": "Suscripción PLUS activada",
        "user": build_user_public(user_doc),
    }


@subscription_router.post("/cancel")
async def cancel_subscription(
    req: Request,
    user: dict = Depends(get_current_user),
):
    """Cancela la suscripción (deja expirar el mes ya pagado).

    Al pasar `subscription_expires_at`, el plan efectivo se recalcula
    automáticamente en `build_user_public` y cae a basic si no hay búsquedas gratis.
    """
    db = req.app.state.db
    # No forzamos el downgrade inmediato; solo marcamos que no renovará.
    # (Cuando integremos Stripe, cancelamos la suscripción allí.)
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"subscription_cancel_at_period_end": True}},
    )
    user_doc = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return {
        "message": "Suscripción marcada para no renovar",
        "user": build_user_public(user_doc),
    }
