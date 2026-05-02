"""
Servicios de Usuario — lógica de plan PLUS, contador y suscripción
"""
import os
from datetime import datetime, timezone
from typing import Dict


def _unlimited_plus_emails() -> set:
    """Lee de env var `UNLIMITED_PLUS_EMAILS` (separada por comas) la lista
    de correos que tienen PLUS ilimitado gratuito (founders, team, etc.)."""
    raw = os.environ.get("UNLIMITED_PLUS_EMAILS", "")
    return {e.strip().lower() for e in raw.split(",") if e.strip()}


def _is_unlimited(email: str) -> bool:
    """True si el email está en la whitelist o si la whitelist contiene `*`
    (modo "PLUS gratis para todo el mundo")."""
    if not email:
        return False
    whitelist = _unlimited_plus_emails()
    if "*" in whitelist:
        return True
    return email.strip().lower() in whitelist


def build_user_public(user_doc: Dict) -> Dict:
    """Construye el payload público del usuario calculando el plan efectivo.

    Reglas:
    - Si el email está en `UNLIMITED_PLUS_EMAILS` → PLUS ilimitado gratuito.
    - Si `subscription_expires_at` existe y es futura → user_plan = 'plus' (suscripción activa).
    - Si no, y `plus_searches_remaining > 0` → user_plan = 'plus' (modo gratis de prueba).
    - Usuarios legacy (sin `plus_searches_remaining` en DB) → se tratan como recién creados (5 búsquedas PLUS).
    - En cualquier otro caso → user_plan = 'basic'.
    """
    now = datetime.now(timezone.utc)
    email = (user_doc.get("email") or "").strip().lower()
    is_unlimited = _is_unlimited(email)

    expires = user_doc.get("subscription_expires_at")
    raw_remaining = user_doc.get("plus_searches_remaining")
    if raw_remaining is None:
        # Usuario legacy (antes de la migración): le damos 5 búsquedas por defecto.
        remaining = 5
    else:
        try:
            remaining = int(raw_remaining)
        except (TypeError, ValueError):
            remaining = 0

    sub_active = False
    if expires:
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        sub_active = expires > now

    if is_unlimited:
        # Whitelist: PLUS ilimitado, contador simbólico alto, suscripción marcada
        # como activa para que el frontend no muestre upsells ni paywalls.
        plan = "plus"
        sub_active = True
        remaining = 9999
    elif sub_active:
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


async def ensure_migrated(db, user_doc: Dict) -> Dict:
    """Si el usuario no tiene `plus_searches_remaining` en DB, lo escribe (5) y lo normaliza a plus."""
    if user_doc.get("plus_searches_remaining") is None:
        await db.users.update_one(
            {"user_id": user_doc["user_id"]},
            {"$set": {"plus_searches_remaining": 5, "user_plan": "plus"}},
        )
        user_doc["plus_searches_remaining"] = 5
        user_doc["user_plan"] = "plus"
    return user_doc


async def consume_plus_search(db, user_id: str) -> Dict:
    """Decrementa el contador de búsquedas PLUS gratis.

    - Si el email está en `UNLIMITED_PLUS_EMAILS`: nunca decrementa.
    - Si la suscripción de pago está activa: no decrementa, plan efectivo = plus.
    - Si hay búsquedas gratis (>0): decrementa 1, plan efectivo para esta búsqueda = plus.
    - Si no queda ninguna: plan efectivo = basic (no decrementa).
    """
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user_doc:
        return {"effective_plan": "basic", "plus_searches_remaining": 0, "subscription_active": False}

    # Whitelist de emails con PLUS ilimitado gratuito → no descuenta nunca.
    email = (user_doc.get("email") or "").strip().lower()
    if _is_unlimited(email):
        return {
            "effective_plan": "plus",
            "plus_searches_remaining": 9999,
            "subscription_active": True,
        }

    # Auto-migración de usuarios legacy (antes de introducir el contador).
    user_doc = await ensure_migrated(db, user_doc)
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
