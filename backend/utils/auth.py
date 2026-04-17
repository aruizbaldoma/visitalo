"""
Utilidades de Autenticación
"""
import bcrypt
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException, Request, Cookie
from motor.motor_asyncio import AsyncIOMotorDatabase


def hash_password(password: str) -> str:
    """Hash de password con bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verificar password con hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def generate_session_token() -> str:
    """Generar session token seguro"""
    return secrets.token_urlsafe(32)


async def get_current_user(
    request: Request,
    session_token: Optional[str] = Cookie(None, alias="session_token")
):
    """
    Dependency para obtener usuario actual desde session_token
    Busca primero en cookies, luego en Authorization header
    """
    db = request.app.state.db
    token = session_token
    
    # Fallback: Authorization header
    if not token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '')
    
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    # Buscar sesión en DB
    session_doc = await db.user_sessions.find_one(
        {"session_token": token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    # Verificar expiración
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        # Sesión expirada, eliminarla
        await db.user_sessions.delete_one({"session_token": token})
        raise HTTPException(status_code=401, detail="Sesión expirada")
    
    # Buscar usuario
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0, "password_hash": 0}  # Excluir campos sensibles
    )
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return user_doc


async def get_current_user_optional(
    request: Request,
    session_token: Optional[str] = Cookie(None, alias="session_token")
) -> Optional[dict]:
    """
    Dependency opcional - retorna usuario si está autenticado, None si no
    """
    try:
        return await get_current_user(request, session_token)
    except HTTPException:
        return None
