"""
Servicio de email transaccional vía Resend.

Uso:
    await send_email(to="user@x.com", subject="...", html="...")

Si RESEND_API_KEY no está configurado, registra el email en log y devuelve
False (modo desarrollo, no rompe el flujo).
"""
import asyncio
import logging
import os
from typing import Optional

import resend

logger = logging.getLogger(__name__)


def _from_email() -> str:
    # Por defecto usamos el sender de testing de Resend para no requerir
    # verificación de dominio durante el desarrollo. En producción el
    # operador debe configurar RESEND_FROM_EMAIL=info@visitalo.es y verificar
    # el dominio en Resend (DNS: SPF + DKIM + DMARC).
    return os.environ.get("RESEND_FROM_EMAIL", "Visitalo <onboarding@resend.dev>")


async def send_email(to: str, subject: str, html: str) -> Optional[str]:
    """Envía un email vía Resend de forma no-bloqueante.

    Devuelve el `id` del email si se envió correctamente, None si la API
    key no está configurada, y lanza Exception si la llamada falla.
    """
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        logger.warning(
            "RESEND_API_KEY no configurado — email a %s no enviado. "
            "Asunto: %s",
            to,
            subject,
        )
        return None

    resend.api_key = api_key
    params = {
        "from": _from_email(),
        "to": [to],
        "subject": subject,
        "html": html,
    }

    result = await asyncio.to_thread(resend.Emails.send, params)
    return result.get("id") if isinstance(result, dict) else None


def password_reset_email_html(name: str, new_password: str) -> str:
    """Plantilla HTML responsive y minimalista para restablecimiento de password."""
    safe_name = (name or "").strip() or "viajero"
    return f"""
<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background:#f7faf9;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#031834;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7faf9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(3,24,52,0.06);">
            <tr>
              <td style="background:#031834;padding:24px 32px;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.01em;">
                Visitalo.es
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#031834;letter-spacing:-0.02em;">
                  Hola, {safe_name}.
                </h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
                  Hemos restablecido tu contraseña en Visitalo.es. Puedes acceder a tu cuenta con esta nueva clave temporal:
                </p>
                <div style="margin:24px 0;padding:16px 20px;background:#f1f5f9;border-radius:10px;text-align:center;">
                  <p style="margin:0;font-family:Menlo,Monaco,Consolas,monospace;font-size:18px;font-weight:700;color:#031834;letter-spacing:0.04em;">
                    {new_password}
                  </p>
                </div>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
                  Por seguridad, te recomendamos cambiarla por una propia desde tu perfil después de iniciar sesión.
                </p>
                <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b;">
                  Si no solicitaste este cambio, escríbenos a <a href="mailto:info@visitalo.es" style="color:#3ccca4;text-decoration:none;">info@visitalo.es</a> y lo revisamos al instante.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#f1f5f9;padding:16px 32px;font-size:12px;color:#64748b;text-align:center;">
                Visitalo.es · Tu próximo viaje, montado en segundos.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""
