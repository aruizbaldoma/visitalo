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

    # Persistimos hash + invalidamos sesiones existentes + activamos cuenta
    await db.users.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "password_hash": new_hash,
                "password_reset_at": datetime.now(timezone.utc),
                "password_reset_by": admin.get("email"),
                "email_verified": True,
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


# ---------- Analytics ---------- #

_RANGE_TO_HOURS = {
    "1h": 1,
    "24h": 24,
    "7d": 24 * 7,
    "30d": 24 * 30,
    "90d": 24 * 90,
}


def _range_start(range_key: str) -> datetime:
    hours = _RANGE_TO_HOURS.get(range_key, 24 * 7)
    return datetime.now(timezone.utc) - timedelta(hours=hours)


@admin_router.get("/analytics/live")
async def analytics_live(
    req: Request,
    admin: dict = Depends(require_admin),
    seconds: int = 90,
):
    """Lista de visitantes activos en los últimos `seconds` segundos.

    Une `analytics_presence` con `users` para mostrar el email si el
    visitante está autenticado.
    """
    db = req.app.state.db
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=max(10, min(seconds, 600)))
    docs = await (
        db.analytics_presence.find({"last_seen_at": {"$gte": cutoff}}, {"_id": 0})
        .sort("last_seen_at", -1)
        .limit(500)
        .to_list(500)
    )

    user_ids = [d["user_id"] for d in docs if d.get("user_id")]
    users_map = {}
    if user_ids:
        async for u in db.users.find(
            {"user_id": {"$in": user_ids}},
            {"_id": 0, "user_id": 1, "email": 1, "name": 1, "picture": 1},
        ):
            users_map[u["user_id"]] = u

    now = datetime.now(timezone.utc)
    items = []
    for d in docs:
        first = d.get("first_seen_at") or d.get("last_seen_at")
        last = d.get("last_seen_at")
        if isinstance(first, datetime) and first.tzinfo is None:
            first = first.replace(tzinfo=timezone.utc)
        if isinstance(last, datetime) and last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
        seconds_in_session = int((last - first).total_seconds()) if first and last else 0
        seconds_ago = int((now - last).total_seconds()) if last else 0
        u = users_map.get(d.get("user_id")) if d.get("user_id") else None
        items.append({
            "visitor_id": d.get("visitor_id"),
            "path": d.get("path"),
            "country": d.get("country") or "—",
            "device": d.get("device") or "desktop",
            "browser": d.get("browser") or "Otros",
            "lang": d.get("lang") or "",
            "seconds_in_session": seconds_in_session,
            "seconds_ago": seconds_ago,
            "is_authenticated": bool(u),
            "user_email": u.get("email") if u else None,
            "user_name": u.get("name") if u else None,
            "user_picture": u.get("picture") if u else None,
        })

    return {
        "online": len(items),
        "items": items,
        "now": now.isoformat(),
    }


@admin_router.get("/analytics/stats")
async def analytics_stats(
    req: Request,
    admin: dict = Depends(require_admin),
    range: str = "7d",
):
    """KPIs y rankings agregados sobre el rango pedido (24h, 7d, 30d, 90d)."""
    db = req.app.state.db
    if range not in _RANGE_TO_HOURS:
        range = "7d"
    start = _range_start(range)

    # ---- KPIs ---- #
    page_views = await db.analytics_events.count_documents({"created_at": {"$gte": start}})

    unique_visitors_pipeline = [
        {"$match": {"created_at": {"$gte": start}}},
        {"$group": {"_id": "$visitor_id"}},
        {"$count": "n"},
    ]
    uv = [d async for d in db.analytics_events.aggregate(unique_visitors_pipeline)]
    unique_visitors = uv[0]["n"] if uv else 0

    new_signups = await db.users.count_documents({"created_at": {"$gte": start}})
    searches = await db.search_history.count_documents({"created_at": {"$gte": start}})
    affiliate_clicks = await db.affiliate_clicks.count_documents({"created_at": {"$gte": start}})

    # ---- Top destinos ---- #
    top_dest_pipe = [
        {"$match": {"created_at": {"$gte": start}}},
        {"$group": {"_id": "$destination", "n": {"$sum": 1}}},
        {"$sort": {"n": -1}},
        {"$limit": 10},
    ]
    top_destinations = [
        {"label": d.get("_id") or "—", "value": d["n"]}
        async for d in db.search_history.aggregate(top_dest_pipe)
    ]

    # ---- Top páginas ---- #
    top_pages_pipe = [
        {"$match": {"created_at": {"$gte": start}}},
        {"$group": {"_id": "$path", "n": {"$sum": 1}}},
        {"$sort": {"n": -1}},
        {"$limit": 10},
    ]
    top_pages = [
        {"label": d.get("_id") or "/", "value": d["n"]}
        async for d in db.analytics_events.aggregate(top_pages_pipe)
    ]

    # ---- Top afiliados ---- #
    top_aff_pipe = [
        {"$match": {"created_at": {"$gte": start}}},
        {"$group": {"_id": "$kind", "n": {"$sum": 1}}},
        {"$sort": {"n": -1}},
        {"$limit": 10},
    ]
    top_affiliates = [
        {"label": d.get("_id") or "unknown", "value": d["n"]}
        async for d in db.affiliate_clicks.aggregate(top_aff_pipe)
    ]

    # ---- Origen tráfico ---- #
    referrer_pipe = [
        {"$match": {"created_at": {"$gte": start}}},
        {"$group": {"_id": "$referrer_source", "n": {"$sum": 1}}},
        {"$sort": {"n": -1}},
    ]
    referrers = [
        {"label": d.get("_id") or "Directo", "value": d["n"]}
        async for d in db.analytics_events.aggregate(referrer_pipe)
    ]

    # ---- Reparto dispositivo ---- #
    device_pipe = [
        {"$match": {"created_at": {"$gte": start}}},
        {"$group": {"_id": "$device", "n": {"$sum": 1}}},
        {"$sort": {"n": -1}},
    ]
    devices = [
        {"label": d.get("_id") or "desktop", "value": d["n"]}
        async for d in db.analytics_events.aggregate(device_pipe)
    ]

    # ---- Top países ---- #
    country_pipe = [
        {"$match": {"created_at": {"$gte": start}}},
        {"$group": {"_id": "$country", "n": {"$sum": 1}}},
        {"$sort": {"n": -1}},
        {"$limit": 10},
    ]
    countries = [
        {"label": d.get("_id") or "—", "value": d["n"]}
        async for d in db.analytics_events.aggregate(country_pipe)
    ]

    # ---- Serie temporal: visitas únicas por día (siempre 30d para gráfico) ---- #
    chart_start = datetime.now(timezone.utc) - timedelta(days=30)
    daily_pipe = [
        {"$match": {"created_at": {"$gte": chart_start}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                },
                "visitors": {"$addToSet": "$visitor_id"},
                "views": {"$sum": 1},
            }
        },
        {
            "$project": {
                "_id": 0,
                "date": "$_id",
                "views": 1,
                "unique_visitors": {"$size": "$visitors"},
            }
        },
        {"$sort": {"date": 1}},
    ]
    daily_series = [d async for d in db.analytics_events.aggregate(daily_pipe)]

    # Conversion funnel (estimado). Definimos:
    # visit → search → signup → click afiliado dentro del rango
    funnel = {
        "visitors": unique_visitors,
        "searches": searches,
        "signups": new_signups,
        "affiliate_clicks": affiliate_clicks,
    }

    return {
        "range": range,
        "since": start.isoformat(),
        "kpis": {
            "unique_visitors": unique_visitors,
            "page_views": page_views,
            "new_signups": new_signups,
            "searches": searches,
            "affiliate_clicks": affiliate_clicks,
        },
        "funnel": funnel,
        "top_destinations": top_destinations,
        "top_pages": top_pages,
        "top_affiliates": top_affiliates,
        "referrers": referrers,
        "devices": devices,
        "countries": countries,
        "daily_series": daily_series,
    }
