"""
Tracking de clics en enlaces de afiliados.

Endpoint público:
    GET /api/r?u=<destination_url>&k=<kind>

Registra el clic en `affiliate_clicks` y redirige 302 a la URL destino.
Funciona aunque el usuario no esté autenticado.
"""
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlparse

from fastapi import APIRouter, Cookie, Request
from fastapi.responses import RedirectResponse

track_router = APIRouter()


# Lista corta de hosts permitidos como destino para evitar open-redirect abuse.
ALLOWED_HOSTS = (
    "getyourguide.com",
    "iatiseguros.com",
    "esim.holafly.com",
    "holafly.com",
    "booking.com",
    "google.com",
    "tiqets.com",
    "civitatis.com",
    "viator.com",
)


def _is_allowed(url: str) -> bool:
    try:
        host = (urlparse(url).hostname or "").lower()
    except Exception:  # noqa: BLE001
        return False
    return any(host == h or host.endswith("." + h) for h in ALLOWED_HOSTS)


@track_router.get("/r")
async def track_redirect(
    request: Request,
    u: str,
    k: Optional[str] = None,
    session_token: Optional[str] = Cookie(None, alias="session_token"),
):
    db = request.app.state.db

    # Fallback "casa" si la URL no es válida: mandamos al frontend público
    # (`FRONTEND_URL`) en lugar de a `/` — en Railway, `/` del backend no
    # sirve nada y mostraría `{"detail":"Not Found"}`.
    import os
    fallback_home = os.environ.get("FRONTEND_URL", "/").rstrip("/") or "/"

    if not _is_allowed(u):
        return RedirectResponse(url=fallback_home, status_code=302)

    user_id = None
    if session_token:
        sess = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if sess:
            user_id = sess.get("user_id")

    await db.affiliate_clicks.insert_one({
        "user_id": user_id,
        "kind": (k or "unknown")[:32],
        "url": u[:500],
        "referer": (request.headers.get("referer") or "")[:300],
        "ua": (request.headers.get("user-agent") or "")[:300],
        "created_at": datetime.now(timezone.utc),
    })

    return RedirectResponse(url=u, status_code=302)
