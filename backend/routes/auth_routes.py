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


async def _create_session_for_user(db, user_doc):
    """Crea una nueva sesión de 7 días y devuelve (session_token, expires_at)."""
    session_token = generate_session_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
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
    if not user_doc:
        user_id = f"user_{uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "auth_provider": "google",
            "password_hash": None,
            "user_plan": "plus",
            "plus_searches_remaining": 5,
            "subscription_expires_at": None,
            "created_at": datetime.now(timezone.utc),
        }
        await db.users.insert_one(user_doc)
    else:
        await db.users.update_one(
            {"user_id": user_doc["user_id"]},
            {"$set": {"name": name, "picture": picture}},
        )
        user_doc["name"] = name
        user_doc["picture"] = picture

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
    """Registro con email/password"""
    db = req.app.state.db
    # Verificar si el email ya existe
    existing_user = await db.users.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Crear nuevo usuario
    user_id = f"user_{uuid4().hex[:12]}"
    password_hashed = hash_password(request.password)
    
    new_user = {
        "user_id": user_id,
        "email": request.email,
        "name": request.name,
        "picture": None,
        "auth_provider": "email",
        "password_hash": password_hashed,
        "user_plan": "plus",
        "plus_searches_remaining": 5,
        "subscription_expires_at": None,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(new_user)
    
    # Crear sesión automáticamente
    session_token = generate_session_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session = {
        "session_token": session_token,
        "user_id": user_id,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session)
    
    return {
        "user": build_user_public(new_user),
        "session_token": session_token
    }


@auth_router.post("/login")
async def login_with_email(
    request: LoginRequest,
    req: Request
):
    """Login con email/password"""
    db = req.app.state.db
    # Buscar usuario
    user_doc = await db.users.find_one({"email": request.email}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    # Verificar que sea usuario de email (no Google)
    if user_doc["auth_provider"] != "email":
        raise HTTPException(
            status_code=400,
            detail="Esta cuenta usa Google Sign-In. Por favor, inicia sesión con Google."
        )
    
    # Verificar password
    if not verify_password(request.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
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
