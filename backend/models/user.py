"""
Modelos de Usuario para Sistema de Autenticación
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class User(BaseModel):
    """Modelo de Usuario en MongoDB"""
    user_id: str
    email: EmailStr
    name: str
    picture: Optional[str] = None
    auth_provider: str  # 'google' or 'email'
    password_hash: Optional[str] = None  # Solo para auth_provider='email'
    user_plan: str = 'basic'  # 'basic' or 'plus'
    first_trip_used: bool = False  # Para otorgar Plus gratis en primer viaje
    subscription_expires_at: Optional[datetime] = None  # Para suscripción Plus (1€/mes)
    referred_by: Optional[str] = None  # user_id del referidor (para Plus gratis)
    created_at: datetime


class UserSession(BaseModel):
    """Modelo de Sesión de Usuario"""
    session_token: str
    user_id: str
    expires_at: datetime
    created_at: datetime


class UserPublic(BaseModel):
    """Modelo público de usuario (sin datos sensibles)"""
    user_id: str
    email: EmailStr
    name: str
    picture: Optional[str] = None
    user_plan: str
    first_trip_used: bool


class LoginRequest(BaseModel):
    """Request de login con email/password"""
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """Request de registro con email/password"""
    email: EmailStr
    password: str
    name: str


class SessionExchangeRequest(BaseModel):
    """Request para intercambiar session_id por session_token (Google OAuth)"""
    session_id: str
