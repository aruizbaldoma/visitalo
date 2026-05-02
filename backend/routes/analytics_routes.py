"""
Tracking de analítica anónima (públicos).

Dos endpoints públicos:
    POST /api/analytics/track       → registra page-view
    POST /api/analytics/heartbeat   → upsert de presencia (online ahora)

Datos agregados luego por los endpoints admin en `admin_routes.py`.

Privacidad/GDPR:
- NO guardamos IP, solo país derivado de cabeceras del proxy
  (`cf-ipcountry`, `x-vercel-ip-country`, `x-country-code`).
- `visitor_id` lo genera el cliente y se persiste en localStorage; es
  anónimo y desechable.
- Solo se llama si el usuario aceptó cookies analíticas (gate en frontend).
"""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Cookie, Request
from pydantic import BaseModel

analytics_router = APIRouter()


class TrackEventRequest(BaseModel):
    visitor_id: str
    path: str
    referrer: Optional[str] = ""
    lang: Optional[str] = ""


class HeartbeatRequest(BaseModel):
    visitor_id: str
    path: str
    lang: Optional[str] = ""


def _country(request: Request) -> str:
    for h in ("cf-ipcountry", "x-vercel-ip-country", "x-country-code"):
        v = request.headers.get(h)
        if v and v.upper() not in ("XX", "T1"):
            return v.upper()[:2]
    return "—"


def _device(ua: str) -> str:
    ua_l = (ua or "").lower()
    if any(k in ua_l for k in ("iphone", "ipod", "android", "mobile")):
        return "mobile"
    if "ipad" in ua_l or "tablet" in ua_l:
        return "tablet"
    return "desktop"


def _browser(ua: str) -> str:
    ua_l = (ua or "").lower()
    if "edg/" in ua_l:
        return "Edge"
    if "chrome/" in ua_l and "safari" in ua_l:
        return "Chrome"
    if "firefox/" in ua_l:
        return "Firefox"
    if "safari/" in ua_l:
        return "Safari"
    return "Otros"


def _referrer_source(ref: str) -> str:
    """Clasifica el origen del tráfico a partir del referrer."""
    r = (ref or "").lower()
    if not r:
        return "Directo"
    if "google." in r:
        return "Google"
    if any(k in r for k in ("facebook.", "instagram.", "twitter.", "x.com", "linkedin.", "tiktok.", "t.co", "pinterest.")):
        return "Redes sociales"
    if any(k in r for k in ("bing.", "duckduckgo.", "yahoo.", "ecosia.")):
        return "Otros buscadores"
    if "visitalo.es" in r or "preview.emergentagent.com" in r:
        return "Interno"
    return "Otros"


async def _resolve_user_id(db, session_token: Optional[str]) -> Optional[str]:
    if not session_token:
        return None
    sess = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    return sess.get("user_id") if sess else None


@analytics_router.post("/track")
async def track_event(
    payload: TrackEventRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None, alias="session_token"),
):
    """Registra un page-view. Idempotente — múltiples llamadas crean docs."""
    db = request.app.state.db
    user_id = await _resolve_user_id(db, session_token)
    ua = request.headers.get("user-agent") or ""

    await db.analytics_events.insert_one({
        "visitor_id": (payload.visitor_id or "")[:64],
        "user_id": user_id,
        "path": (payload.path or "/")[:200],
        "referrer": (payload.referrer or "")[:300],
        "referrer_source": _referrer_source(payload.referrer or ""),
        "lang": (payload.lang or "")[:8],
        "country": _country(request),
        "device": _device(ua),
        "browser": _browser(ua),
        "ua": ua[:300],
        "created_at": datetime.now(timezone.utc),
    })
    return {"ok": True}


@analytics_router.post("/heartbeat")
async def heartbeat(
    payload: HeartbeatRequest,
    request: Request,
    session_token: Optional[str] = Cookie(None, alias="session_token"),
):
    """Marca al visitante como online: upsert por `visitor_id`.

    El admin considera "online" todo doc con `last_seen_at` > now-90s.
    """
    db = request.app.state.db
    user_id = await _resolve_user_id(db, session_token)
    ua = request.headers.get("user-agent") or ""
    now = datetime.now(timezone.utc)

    await db.analytics_presence.update_one(
        {"visitor_id": (payload.visitor_id or "")[:64]},
        {
            "$set": {
                "user_id": user_id,
                "path": (payload.path or "/")[:200],
                "lang": (payload.lang or "")[:8],
                "country": _country(request),
                "device": _device(ua),
                "browser": _browser(ua),
                "last_seen_at": now,
            },
            "$setOnInsert": {
                "visitor_id": (payload.visitor_id or "")[:64],
                "first_seen_at": now,
            },
        },
        upsert=True,
    )
    return {"ok": True}
