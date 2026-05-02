"""
Rutas Admin: dashboard, listado de usuarios, restablecer contraseña.

Auth: separado del usuario final. JWT/sesión de admin se valida contra
una cookie `admin_session` que solo se emite si email ∈ ADMIN_EMAILS y
password coincide con ADMIN_PASSWORD.
"""
import os
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, EmailStr

from utils.auth import generate_session_token, hash_password
from services.email_service import send_email, password_reset_email_html

admin_router = APIRouter()


# ---------- Helpers ---------- #

def _admin_emails() -> set:
    raw = os.environ.get("ADMIN_EMAILS", "")
    return {e.strip().lower() for e in raw.split(",") if e.strip()}


def _admin_password() -> str:
    return os.environ.get("ADMIN_PASSWORD", "")


def _generate_password(length: int = 12) -> str:
    """Genera una contraseña temporal legible (sin caracteres confusos)."""
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def get_db(request: Request) -> AsyncIOMotorDatabase:
    return request.app.state.db


async def require_admin(
    request: Request,
    admin_session: Optional[str] = Cookie(None, alias="admin_session"),
):
    """Dependency: valida que la request lleve un token de sesión admin válido."""
    db = request.app.state.db
    token = admin_session
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="No autorizado")

    session = await db.admin_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Sesión admin inválida")

    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        await db.admin_sessions.delete_one({"session_token": token})
        raise HTTPException(status_code=401, detail="Sesión admin expirada")

    return {"email": session["email"]}


# ---------- Schemas ---------- #

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserSummary(BaseModel):
    user_id: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    auth_provider: Optional[str] = None
    created_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    total_searches: int = 0
    total_clicks: int = 0


# ---------- Endpoints ---------- #

@admin_router.post("/login")
async def admin_login(payload: AdminLoginRequest, response: Response, req: Request):
    db = req.app.state.db
    email_norm = payload.email.strip().lower()
    if email_norm not in _admin_emails():
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    if not _admin_password() or payload.password != _admin_password():
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    session_token = generate_session_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=12)
    await db.admin_sessions.insert_one({
        "session_token": session_token,
        "email": email_norm,
        "created_at": datetime.now(timezone.utc),
        "expires_at": expires_at,
    })
    # Cookie de admin (12h)
    response.set_cookie(
        key="admin_session",
        value=session_token,
        max_age=12 * 3600,
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return {"ok": True, "email": email_norm, "token": session_token, "expires_at": expires_at}


@admin_router.post("/logout")
async def admin_logout(
    response: Response,
    req: Request,
    admin: dict = Depends(require_admin),
    admin_session: Optional[str] = Cookie(None, alias="admin_session"),
):
    db = req.app.state.db
    if admin_session:
        await db.admin_sessions.delete_one({"session_token": admin_session})
    response.delete_cookie("admin_session")
    return {"ok": True}


@admin_router.get("/me")
async def admin_me(admin: dict = Depends(require_admin)):
    return {"email": admin["email"]}


@admin_router.get("/users")
async def list_users(
    req: Request,
    admin: dict = Depends(require_admin),
    q: Optional[str] = None,
    limit: int = 200,
):
    """Lista usuarios con stats agregados. Acepta `q` para filtrar por email/nombre."""
    db = req.app.state.db
    query = {}
    if q:
        query = {
            "$or": [
                {"email": {"$regex": q, "$options": "i"}},
                {"name": {"$regex": q, "$options": "i"}},
            ]
        }
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).limit(limit).to_list(limit)

    # Calcular stats por usuario en paralelo (búsquedas + clics)
    if users:
        ids = [u["user_id"] for u in users]
        searches_pipeline = [
            {"$match": {"user_id": {"$in": ids}}},
            {"$group": {"_id": "$user_id", "n": {"$sum": 1}}},
        ]
        clicks_pipeline = [
            {"$match": {"user_id": {"$in": ids}}},
            {"$group": {"_id": "$user_id", "n": {"$sum": 1}}},
        ]
        searches = {d["_id"]: d["n"] async for d in db.search_history.aggregate(searches_pipeline)}
        clicks = {d["_id"]: d["n"] async for d in db.affiliate_clicks.aggregate(clicks_pipeline)}
        for u in users:
            u["total_searches"] = searches.get(u["user_id"], 0)
            u["total_clicks"] = clicks.get(u["user_id"], 0)

    # Sanitizar fechas → siempre string ISO (por simplicidad en el frontend)
    for u in users:
        for key in ("created_at", "last_login_at", "subscription_expires_at"):
            v = u.get(key)
            if isinstance(v, datetime):
                u[key] = v.isoformat()

    return {"users": users, "count": len(users)}


@admin_router.get("/users/{user_id}")
async def user_detail(
    user_id: str,
    req: Request,
    admin: dict = Depends(require_admin),
):
    db = req.app.state.db
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    searches = await (
        db.search_history.find({"user_id": user_id}, {"_id": 0})
        .sort("created_at", -1)
        .limit(200)
        .to_list(200)
    )
    clicks = await (
        db.affiliate_clicks.find({"user_id": user_id}, {"_id": 0})
        .sort("created_at", -1)
        .limit(200)
        .to_list(200)
    )

    # Normalizar fechas a ISO
    def _iso(doc):
        for k, v in list(doc.items()):
            if isinstance(v, datetime):
                doc[k] = v.isoformat()
        return doc

    return {
        "user": _iso(user),
        "searches": [_iso(s) for s in searches],
        "clicks": [_iso(c) for c in clicks],
    }


class ResetPasswordResponse(BaseModel):
    ok: bool
    new_password: str
    email_sent: bool
    email_id: Optional[str] = None


@admin_router.post("/users/{user_id}/reset-password", response_model=ResetPasswordResponse)
async def reset_user_password(
    user_id: str,
    req: Request,
    admin: dict = Depends(require_admin),
):
    """Genera una contraseña temporal, la guarda hasheada y la envía por email.

    Si el usuario es de Google sin password_hash previo, también lo activa
    como cuenta híbrida (puede entrar con Google o con la nueva contraseña).
    """
    db = req.app.state.db
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    new_password = _generate_password(12)
    new_hash = hash_password(new_password)

    # Persistimos hash + invalidamos sesiones existentes
    await db.users.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "password_hash": new_hash,
                "password_reset_at": datetime.now(timezone.utc),
                "password_reset_by": admin.get("email"),
            }
        },
    )
    await db.user_sessions.delete_many({"user_id": user_id})

    # Email
    email_id = None
    email_sent = False
    try:
        email_id = await send_email(
            to=user["email"],
            subject="Tu nueva contraseña en Visitalo.es",
            html=password_reset_email_html(user.get("name") or "", new_password),
        )
        email_sent = email_id is not None
    except Exception as e:  # noqa: BLE001
        # Devolvemos la nueva password aunque falle el email para que el
        # admin pueda comunicarla manualmente.
        email_sent = False
        email_id = f"error: {e}"

    return ResetPasswordResponse(
        ok=True,
        new_password=new_password,
        email_sent=email_sent,
        email_id=email_id if isinstance(email_id, str) else None,
    )
