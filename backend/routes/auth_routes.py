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

from models.user import (
    User, UserPublic, LoginRequest, RegisterRequest, 
    SessionExchangeRequest, UserSession
)
from utils.auth import (
    hash_password, verify_password, generate_session_token,
    get_current_user, get_current_user_optional
)

auth_router = APIRouter()


def get_db(request: Request) -> AsyncIOMotorDatabase:
    """Dependency para obtener DB"""
    return request.app.state.db


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
                "user_plan": "basic",
                "first_trip_used": False,
                "subscription_expires_at": None,
                "referred_by": None,
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
        
        # Retornar usuario y session_token
        user_public = UserPublic(
            user_id=user_doc["user_id"],
            email=user_doc["email"],
            name=user_doc["name"],
            picture=user_doc.get("picture"),
            user_plan=user_doc["user_plan"],
            first_trip_used=user_doc["first_trip_used"]
        )
        
        return {
            "user": user_public.dict(),
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
        "user_plan": "basic",
        "first_trip_used": False,
        "subscription_expires_at": None,
        "referred_by": None,
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
    
    # Retornar usuario y session_token
    user_public = UserPublic(
        user_id=user_id,
        email=request.email,
        name=request.name,
        picture=None,
        user_plan="basic",
        first_trip_used=False
    )
    
    return {
        "user": user_public.dict(),
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
    
    # Retornar usuario y session_token
    user_public = UserPublic(
        user_id=user_doc["user_id"],
        email=user_doc["email"],
        name=user_doc["name"],
        picture=user_doc.get("picture"),
        user_plan=user_doc["user_plan"],
        first_trip_used=user_doc["first_trip_used"]
    )
    
    return {
        "user": user_public.dict(),
        "session_token": session_token
    }


@auth_router.get("/me")
async def get_current_user_info(
    req: Request,
    user: dict = Depends(get_current_user)
):
    """
    Obtener información del usuario actual
    Endpoint para verificar sesión
    """
    return UserPublic(**user).dict()


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
