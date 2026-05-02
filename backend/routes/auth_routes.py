"""
Rutas de Autenticación
"""
from fastapi import APIRouter, HTTPException, Response, Depends, Request
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
import httpx
from datetime import datetime, timedelta, timezone
from uuid import uuid4
import os

from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from models.user import (
    User, UserPublic, LoginRequest, RegisterRequest, 
    SessionExchangeRequest, UserSession
)
from utils.auth import (
    hash_password, verify_password, generate_session_token,
    get_current_user, get_current_user_optional
)
from services.user_service import build_user_public, consume_plus_search

auth_router = APIRouter()


class GoogleTokenRequest(BaseModel):
    credential: str


def get_db(request: Request) -> AsyncIOMotorDatabase:
    """Dependency para obtener DB"""
    return request.app.state.db


async def _create_session_for_user(db, user_doc, days: int = 7):
    """Crea una nueva sesión y devuelve (session_token, expires_at).

    `days` controla la duración (7 por defecto, 30 con "Recordar sesión").
    """
    session_token = generate_session_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=days)
    await db.user_sessions.insert_one({
        "session_token": session_token,
        "user_id": user_doc["user_id"],
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    return session_token, expires_at


@auth_router.post("/google")
async def auth_google(request: GoogleTokenRequest, req: Request):
    """Verifica el ID token de Google Identity Services y crea/actualiza usuario."""
    db = req.app.state.db
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    if not client_id:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID no configurado")

    try:
        idinfo = id_token.verify_oauth2_token(
            request.credential,
            google_requests.Request(),
            client_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Token de Google inválido: {e}")

    email = idinfo.get("email")
    if not email or not idinfo.get("email_verified", False):
        raise HTTPException(status_code=400, detail="Email de Google no verificado")

    name = idinfo.get("name") or email.split("@")[0]
    picture = idinfo.get("picture")

    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    now = datetime.now(timezone.utc)
    if not user_doc:
        user_id = f"user_{uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "auth_provider": "google",
            "password_hash": None,
            "email_verified": True,
            "user_plan": "plus",
            "plus_searches_remaining": 5,
            "subscription_expires_at": None,
            "created_at": now,
            "last_login_at": now,
        }
        await db.users.insert_one(user_doc)
    else:
        await db.users.update_one(
            {"user_id": user_doc["user_id"]},
            {"$set": {"name": name, "picture": picture, "last_login_at": now, "email_verified": True}},
        )
        user_doc["name"] = name
        user_doc["picture"] = picture
        user_doc["last_login_at"] = now
        user_doc["email_verified"] = True

    session_token, _ = await _create_session_for_user(db, user_doc)

    return {
        "user": build_user_public(user_doc),
        "session_token": session_token,
    }


@auth_router.post("/session")
async def exchange_session_id(
    request: SessionExchangeRequest,
    req: Request
):
    """
    Intercambiar session_id de Google OAuth por session_token
    REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    """
    db = req.app.state.db
    try:
        # Llamar a Emergent Auth API para obtener datos del usuario
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": request.session_id},
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail="Session ID inválido o expirado"
                )
            
            data = response.json()
        
        # Extraer datos del usuario
        email = data.get("email")
        name = data.get("name")
        picture = data.get("picture")
        emergent_session_token = data.get("session_token")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email no encontrado en session_id")
        
        # Buscar o crear usuario
        user_doc = await db.users.find_one({"email": email}, {"_id": 0})
        
        if not user_doc:
            # Crear nuevo usuario
            user_id = f"user_{uuid4().hex[:12]}"
            new_user = {
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "auth_provider": "google",
                "password_hash": None,
                "user_plan": "plus",
                "plus_searches_remaining": 5,
                "subscription_expires_at": None,
                "created_at": datetime.now(timezone.utc)
            }
            await db.users.insert_one(new_user)
            user_doc = new_user
        else:
            # Actualizar datos del usuario existente (por si cambió nombre/foto)
            await db.users.update_one(
                {"user_id": user_doc["user_id"]},
                {"$set": {
                    "name": name,
                    "picture": picture
                }}
            )
            user_doc["name"] = name
            user_doc["picture"] = picture
        
        # Crear nueva sesión
        session_token = generate_session_token()
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session = {
            "session_token": session_token,
            "user_id": user_doc["user_id"],
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc)
        }
        await db.user_sessions.insert_one(session)
        
        return {
            "user": build_user_public(user_doc),
            "session_token": session_token
        }
        
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al conectar con servicio de autenticación: {str(e)}"
        )


@auth_router.post("/register")
async def register_with_email(
    request: RegisterRequest,
    req: Request
):
    """Registro con email/password.

    Crea la cuenta en estado `email_verified=False`, genera un token de
    verificación y envía email con el link. NO inicia sesión hasta que el
    usuario active la cuenta.
    """
    import os
    import secrets

    db = req.app.state.db
    email_norm = request.email.lower().strip()
    existing_user = await db.users.find_one({"email": email_norm})
    if existing_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    user_id = f"user_{uuid4().hex[:12]}"
    password_hashed = hash_password(request.password)
    verification_token = secrets.token_urlsafe(32)

    new_user = {
        "user_id": user_id,
        "email": email_norm,
        "name": request.name,
        "picture": None,
        "auth_provider": "email",
        "password_hash": password_hashed,
        "email_verified": False,
        "verification_token": verification_token,
        "verification_sent_at": datetime.now(timezone.utc),
        "user_plan": "plus",
        "plus_searches_remaining": 5,
        "subscription_expires_at": None,
        "created_at": datetime.now(timezone.utc),
    }
    await db.users.insert_one(new_user)

    # Construimos el link absoluto al frontend usando FRONTEND_URL si existe;
    # en su defecto, deducimos el dominio desde la request.
    base_url = os.environ.get("FRONTEND_URL")
    if not base_url:
        origin = req.headers.get("origin") or ""
        base_url = origin.rstrip("/") if origin else ""
    if not base_url:
        base_url = "https://visitalo.es"
    verify_link = f"{base_url}/verificar?token={verification_token}"

    # Email de bienvenida con verificación
    from services.email_service import send_email, verification_email_html
    try:
        await send_email(
            to=email_norm,
            subject="Confirma tu cuenta de Visitalo.es",
            html=verification_email_html(request.name, verify_link),
        )
    except Exception as e:  # noqa: BLE001
        # No reventamos el flujo si Resend falla — el admin puede reenviar.
        print(f"⚠️ verification email send failed: {e}")

    return {
        "ok": True,
        "verification_required": True,
        "email": email_norm,
    }


@auth_router.post("/login")
async def login_with_email(
    request: LoginRequest,
    req: Request
):
    """Login con email/password.

    Permite tanto cuentas nativas (auth_provider="email") como cuentas
    Google a las que un admin haya establecido un password_hash mediante
    el restablecimiento del dashboard.
    """
    db = req.app.state.db
    user_doc = await db.users.find_one({"email": request.email.lower().strip()}, {"_id": 0})

    if not user_doc:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    password_hash = user_doc.get("password_hash")
    if not password_hash:
        raise HTTPException(
            status_code=400,
            detail="Esta cuenta usa Google Sign-In. Inicia sesión con Google.",
        )

    if not verify_password(request.password, password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    # Bloqueamos login si la cuenta está pendiente de verificación.
    # (Cuentas Google y cuentas restablecidas por admin entran sin esta gate
    # porque establecemos email_verified=True en esos flujos.)
    if user_doc.get("auth_provider") == "email" and user_doc.get("email_verified") is False:
        raise HTTPException(
            status_code=403,
            detail="Tu cuenta está pendiente de verificación. Revisa tu email.",
        )

    # Actualizamos last_login_at y creamos sesión
    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"user_id": user_doc["user_id"]},
        {"$set": {"last_login_at": now}},
    )
    session_days = 30 if request.remember_me else 7
    session_token, expires_at = await _create_session_for_user(
        db, user_doc, days=session_days
    )
    user_doc["last_login_at"] = now
    return {
        "user": build_user_public(user_doc),
        "session_token": session_token,
    }


@auth_router.get("/me")
async def get_current_user_info(
    req: Request,
    user: dict = Depends(get_current_user)
):
    """Obtener información del usuario actual — calcula plan efectivo."""
    return build_user_public(user)


@auth_router.post("/consume-plus-search")
async def consume_plus_search_endpoint(
    req: Request,
    user: dict = Depends(get_current_user)
):
    """Consume 1 búsqueda PLUS gratis (o devuelve plus si la suscripción está activa).

    Respuesta: { effective_plan, plus_searches_remaining, subscription_active }
    """
    db = req.app.state.db
    return await consume_plus_search(db, user["user_id"])


@auth_router.post("/verify-email")
async def verify_email(payload: dict, req: Request):
    """Activa la cuenta cuando el usuario hace clic en el link del email.

    Recibe `{ "token": "..." }` y, si el token coincide, marca la cuenta
    como verificada y crea una sesión para iniciar sesión automáticamente.
    """
    token = (payload or {}).get("token", "").strip()
    if not token:
        raise HTTPException(status_code=400, detail="Token requerido")

    db = req.app.state.db
    user_doc = await db.users.find_one({"verification_token": token}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=400, detail="Token inválido o ya utilizado")

    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"user_id": user_doc["user_id"]},
        {
            "$set": {
                "email_verified": True,
                "verified_at": now,
                "last_login_at": now,
            },
            "$unset": {"verification_token": ""},
        },
    )
    user_doc["email_verified"] = True

    # Auto-login al verificar
    session_token = generate_session_token()
    await db.user_sessions.insert_one({
        "session_token": session_token,
        "user_id": user_doc["user_id"],
        "expires_at": now + timedelta(days=7),
        "created_at": now,
    })

    return {
        "ok": True,
        "user": build_user_public(user_doc),
        "session_token": session_token,
    }


@auth_router.post("/resend-verification")
async def resend_verification(payload: dict, req: Request):
    """Reenvía el email de verificación si el usuario lo perdió."""
    import os
    import secrets

    email = (payload or {}).get("email", "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email requerido")

    db = req.app.state.db
    user_doc = await db.users.find_one({"email": email})
    # Respuesta neutra para no revelar existencia de cuentas.
    if not user_doc or user_doc.get("email_verified") is True:
        return {"ok": True}

    new_token = secrets.token_urlsafe(32)
    await db.users.update_one(
        {"user_id": user_doc["user_id"]},
        {
            "$set": {
                "verification_token": new_token,
                "verification_sent_at": datetime.now(timezone.utc),
            }
        },
    )

    base_url = os.environ.get("FRONTEND_URL")
    if not base_url:
        origin = req.headers.get("origin") or ""
        base_url = origin.rstrip("/") if origin else "https://visitalo.es"
    verify_link = f"{base_url}/verificar?token={new_token}"

    from services.email_service import send_email, verification_email_html
    try:
        await send_email(
            to=email,
            subject="Confirma tu cuenta de Visitalo.es",
            html=verification_email_html(user_doc.get("name") or "", verify_link),
        )
    except Exception as e:  # noqa: BLE001
        print(f"⚠️ resend verification failed: {e}")

    return {"ok": True}


@auth_router.post("/forgot-password")
async def forgot_password(payload: dict, req: Request):
    """Solicita un email de recuperación de contraseña.

    Recibe `{ "email": "..." }`, genera un token de 1 hora y envía email
    con link a `/recuperar?token=...`. Siempre devuelve `{ ok: true }`
    para no revelar qué emails están registrados.
    """
    import os
    import secrets

    email = (payload or {}).get("email", "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email requerido")

    db = req.app.state.db
    user_doc = await db.users.find_one({"email": email})

    # Respuesta neutra para evitar enumeración de cuentas.
    if not user_doc:
        return {"ok": True}

    # Solo cuentas con password (email/password o cuentas Google con
    # password establecido por admin). Las cuentas Google puras no tienen
    # password que resetear → respuesta neutra.
    if not user_doc.get("password_hash"):
        return {"ok": True}

    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    await db.users.update_one(
        {"user_id": user_doc["user_id"]},
        {
            "$set": {
                "password_reset_token": reset_token,
                "password_reset_expires_at": expires_at,
            }
        },
    )

    base_url = os.environ.get("FRONTEND_URL")
    if not base_url:
        origin = req.headers.get("origin") or ""
        base_url = origin.rstrip("/") if origin else "https://visitalo.es"
    reset_link = f"{base_url}/recuperar?token={reset_token}"

    from services.email_service import send_email, forgot_password_email_html
    try:
        await send_email(
            to=email,
            subject="Restablece tu contraseña de Visitalo.es",
            html=forgot_password_email_html(user_doc.get("name") or "", reset_link),
        )
    except Exception as e:  # noqa: BLE001
        print(f"⚠️ forgot password email send failed: {e}")

    return {"ok": True}


@auth_router.post("/reset-password")
async def reset_password(payload: dict, req: Request):
    """Establece una nueva contraseña usando el token recibido por email.

    Recibe `{ "token": "...", "password": "..." }`. Si el token es válido y
    no ha expirado, actualiza el `password_hash`, marca el email como
    verificado e inicia sesión automáticamente.
    """
    token = (payload or {}).get("token", "").strip()
    new_password = (payload or {}).get("password", "")
    if not token:
        raise HTTPException(status_code=400, detail="Token requerido")
    if not new_password or len(new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="La contraseña debe tener al menos 6 caracteres",
        )

    db = req.app.state.db
    user_doc = await db.users.find_one(
        {"password_reset_token": token}, {"_id": 0}
    )
    if not user_doc:
        raise HTTPException(status_code=400, detail="Token inválido o ya utilizado")

    expires_at = user_doc.get("password_reset_expires_at")
    if expires_at:
        # Mongo guarda datetimes naive en UTC; normalizamos a aware.
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="El enlace ha expirado. Solicita uno nuevo.")

    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"user_id": user_doc["user_id"]},
        {
            "$set": {
                "password_hash": hash_password(new_password),
                "email_verified": True,
                "last_login_at": now,
            },
            "$unset": {
                "password_reset_token": "",
                "password_reset_expires_at": "",
            },
        },
    )
    user_doc["email_verified"] = True

    # Auto-login tras reset.
    session_token, _ = await _create_session_for_user(db, user_doc)

    return {
        "ok": True,
        "user": build_user_public(user_doc),
        "session_token": session_token,
    }


@auth_router.post("/logout")
async def logout(
    response: Response,
    req: Request,
    user: dict = Depends(get_current_user),
    session_token: str = None
):
    """Cerrar sesión del usuario"""
    db = req.app.state.db
    # El session_token viene del dependency get_current_user
    # Eliminar sesión de la DB
    await db.user_sessions.delete_many({"user_id": user["user_id"]})
    
    # Limpiar cookie
    response.delete_cookie(
        key="session_token",
        path="/",
        domain=None
    )
    
    return {"message": "Sesión cerrada exitosamente"}
