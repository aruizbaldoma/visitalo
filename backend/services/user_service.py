"""
Servicios de Usuario — lógica de plan PLUS, contador y suscripción
"""
from datetime import datetime, timezone
from typing import Dict


def build_user_public(user_doc: Dict) -> Dict:
    """Construye el payload público del usuario calculando el plan efectivo.

    Reglas:
    - Si `subscription_expires_at` existe y es futura → user_plan = 'plus' (suscripción activa).
    - Si no, y `plus_searches_remaining > 0` → user_plan = 'plus' (modo gratis de prueba).
    - En cualquier otro caso → user_plan = 'basic'.
    """
    now = datetime.now(timezone.utc)
    expires = user_doc.get("subscription_expires_at")
    remaining = int(user_doc.get("plus_searches_remaining", 0) or 0)

    sub_active = False
    if expires:
        # Asegurar timezone aware
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        sub_active = expires > now

    if sub_active:
        plan = "plus"
    elif remaining > 0:
        plan = "plus"
    else:
        plan = "basic"

    return {
        "user_id": user_doc["user_id"],
        "email": user_doc["email"],
        "name": user_doc["name"],
        "picture": user_doc.get("picture"),
        "user_plan": plan,
        "plus_searches_remaining": remaining,
        "subscription_active": sub_active,
        "subscription_expires_at": expires,
    }


async def consume_plus_search(db, user_id: str) -> Dict:
    """Decrementa el contador de búsquedas PLUS gratis.

    - Si la suscripción de pago está activa: no decrementa, plan efectivo = plus.
    - Si hay búsquedas gratis (>0): decrementa 1, plan efectivo para esta búsqueda = plus.
    - Si no queda ninguna: plan efectivo = basic (no decrementa).
    """
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user_doc:
        return {"effective_plan": "basic", "plus_searches_remaining": 0, "subscription_active": False}

    public = build_user_public(user_doc)

    if public["subscription_active"]:
        return {
            "effective_plan": "plus",
            "plus_searches_remaining": public["plus_searches_remaining"],
            "subscription_active": True,
        }

    remaining = public["plus_searches_remaining"]
    if remaining > 0:
        new_remaining = remaining - 1
        new_plan = "plus" if new_remaining > 0 else "basic"
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"plus_searches_remaining": new_remaining, "user_plan": new_plan}},
        )
        return {
            "effective_plan": "plus",
            "plus_searches_remaining": new_remaining,
            "subscription_active": False,
        }

    return {
        "effective_plan": "basic",
        "plus_searches_remaining": 0,
        "subscription_active": False,
    }
