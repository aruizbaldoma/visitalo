"""
Endpoint público para el formulario de contacto del Home (#contacto).

POST /api/contact
    body: {
        first_name, last_name, phone, email, comment?, recaptcha_token
    }

- Valida reCAPTCHA v3 (score >= 0.5).
- Persiste el mensaje en `contact_messages`.
- Envía email a CONTACT_EMAIL_TO vía Resend.
- Rate-limit blando por IP+email (5 mensajes/hora) para evitar spam.
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field

contact_router = APIRouter()

RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"
RECAPTCHA_MIN_SCORE = 0.5


class ContactRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=80)
    last_name: str = Field(..., min_length=1, max_length=80)
    phone: str = Field(..., min_length=4, max_length=40)
    email: EmailStr
    comment: Optional[str] = Field(default="", max_length=2000)
    recaptcha_token: str = Field(..., min_length=10)


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for") or ""
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else ""


async def _verify_recaptcha(token: str, ip: str) -> tuple[bool, float, str]:
    """Devuelve (ok, score, reason)."""
    secret = os.environ.get("RECAPTCHA_SECRET_KEY", "").strip()
    if not secret:
        # En dev sin clave dejamos pasar para no bloquear pruebas locales.
        return True, 1.0, "no-secret-configured"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                RECAPTCHA_VERIFY_URL,
                data={"secret": secret, "response": token, "remoteip": ip},
            )
            data = resp.json()
    except Exception as e:  # noqa: BLE001
        return False, 0.0, f"recaptcha-network-error: {e}"

    success = bool(data.get("success"))
    score = float(data.get("score", 0.0))
    if not success:
        errs = ",".join(data.get("error-codes") or []) or "unknown"
        return False, score, f"recaptcha-failed: {errs}"
    if score < RECAPTCHA_MIN_SCORE:
        return False, score, "recaptcha-low-score"
    return True, score, "ok"


def _contact_email_html(payload: ContactRequest) -> str:
    safe_comment = (payload.comment or "—").replace("<", "&lt;").replace(">", "&gt;")
    return f"""
<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background:#f7faf9;font-family:Inter,-apple-system,Segoe UI,Roboto,sans-serif;color:#031834;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7faf9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(3,24,52,0.06);">
            <tr>
              <td style="background:#031834;padding:20px 28px;color:#ffffff;font-size:16px;font-weight:700;letter-spacing:-0.01em;">
                Visitalo.es · Nuevo mensaje de contacto
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;color:#334155;">
                  <tr><td style="padding:6px 0;width:140px;color:#64748b;">Nombre</td><td style="padding:6px 0;font-weight:600;">{payload.first_name} {payload.last_name}</td></tr>
                  <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;font-weight:600;"><a href="mailto:{payload.email}" style="color:#031834;text-decoration:underline;">{payload.email}</a></td></tr>
                  <tr><td style="padding:6px 0;color:#64748b;">Teléfono</td><td style="padding:6px 0;font-weight:600;"><a href="tel:{payload.phone}" style="color:#031834;text-decoration:underline;">{payload.phone}</a></td></tr>
                </table>
                <hr style="border:0;border-top:1px solid #e5e7eb;margin:20px 0;" />
                <p style="margin:0 0 8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;">Comentario</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;white-space:pre-wrap;">{safe_comment}</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f1f5f9;padding:14px 28px;font-size:11px;color:#64748b;">
                Enviado desde el formulario de contacto · {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""


@contact_router.post("")
async def submit_contact(payload: ContactRequest, request: Request):
    db = request.app.state.db
    ip = _client_ip(request)

    # Rate limit blando: max 5 mensajes/hora por IP+email.
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    recent = await db.contact_messages.count_documents({
        "$or": [{"ip": ip}, {"email": payload.email.lower()}],
        "created_at": {"$gte": one_hour_ago},
    })
    if recent >= 5:
        raise HTTPException(
            status_code=429,
            detail="Has enviado demasiados mensajes. Espera un rato e inténtalo de nuevo.",
        )

    # reCAPTCHA v3.
    ok, score, reason = await _verify_recaptcha(payload.recaptcha_token, ip)
    if not ok:
        raise HTTPException(
            status_code=400,
            detail="No hemos podido verificar que no eres un robot. Recarga e inténtalo de nuevo.",
        )

    doc = {
        "first_name": payload.first_name.strip(),
        "last_name": payload.last_name.strip(),
        "phone": payload.phone.strip(),
        "email": payload.email.lower().strip(),
        "comment": (payload.comment or "").strip(),
        "ip": ip,
        "ua": (request.headers.get("user-agent") or "")[:300],
        "recaptcha_score": score,
        "recaptcha_reason": reason,
        "created_at": datetime.now(timezone.utc),
    }
    await db.contact_messages.insert_one(doc)

    # Email al admin.
    to = os.environ.get("CONTACT_EMAIL_TO", "info@visitalo.es")
    from services.email_service import send_email
    try:
        await send_email(
            to=to,
            subject=f"[Visitalo.es] Contacto · {payload.first_name} {payload.last_name}",
            html=_contact_email_html(payload),
        )
    except Exception as e:  # noqa: BLE001
        # No reventamos el flujo si Resend falla — el mensaje queda en DB.
        print(f"⚠️ contact email send failed: {e}")

    return {"ok": True}
