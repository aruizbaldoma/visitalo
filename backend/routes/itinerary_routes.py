"""
Endpoint para Gestión Profesional de Itinerarios
API limpia sin precios ni ofertas
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime, timezone
import os
from services.itinerary_service import ItineraryService
from utils.auth import get_current_user_optional
from motor.motor_asyncio import AsyncIOMotorDatabase

# Router para itinerarios
itinerary_router = APIRouter()


class ActivityPreferences(BaseModel):
    """Preferencias de actividades (solo Plus)"""
    adventure: bool = False
    culture: bool = False
    gastronomy: bool = False
    relax: bool = False


class UserPreferences(BaseModel):
    """Preferencias del usuario Plus"""
    activities: ActivityPreferences
    pace: str = "balanced"  # intense, balanced, relaxed


class ItineraryRequest(BaseModel):
    """Request para generar itinerario profesional"""
    destination: str
    startDate: str
    endDate: str
    hasFlights: bool = False
    arrivalTime: Optional[str] = None
    departureTime: Optional[str] = None
    hasHotel: bool = False
    hotelName: Optional[str] = None
    hotelCategory: Optional[str] = "standard"  # standard, boutique, luxury, hostel, apartment
    needsHotelRecommendation: bool = False
    userPlan: str = "basic"  # basic or plus
    preferences: Optional[UserPreferences] = None


def get_db(req: Request) -> AsyncIOMotorDatabase:
    """Dependency para obtener DB"""
    return req.app.state.db


@itinerary_router.post("/generate-itinerary")
async def generate_itinerary(
    request: ItineraryRequest,
    req: Request,
    user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Genera un itinerario profesional sin precios
    Solo planificación de actividades por Mañana/Tarde/Noche
    
    LÓGICA DE NEGOCIO:
    - Si el usuario está autenticado y es su primer viaje:
      * Se le otorga Plan PLUS automáticamente (gratis)
      * Se marca first_trip_used = True
      * Después del primer viaje, vuelve a Basic
    - Si no está autenticado, usa Plan Basic por defecto
    """
    try:
        db = req.app.state.db  # Obtener DB del app state
        print(f"\n📥 REQUEST: Itinerario para {request.destination}")
        
        # Determinar el plan del usuario
        user_plan = "basic"
        first_trip_bonus = False
        
        if user:
            # Usuario autenticado
            user_plan = user.get("user_plan", "basic")
            first_trip_used = user.get("first_trip_used", False)
            
            # ¡PRIMER VIAJE GRATIS! Otorgar Plan Plus
            if not first_trip_used:
                user_plan = "plus"
                first_trip_bonus = True
                print(f"🎁 PRIMER VIAJE DETECTADO: Otorgando Plan PLUS gratis a {user['email']}")
                
                # Marcar el primer viaje como usado
                await db.users.update_one(
                    {"user_id": user["user_id"]},
                    {"$set": {"first_trip_used": True}}
                )
        else:
            # Usuario no autenticado
            print(f"👤 Usuario NO AUTENTICADO: Usando Plan Basic")
        
        service = ItineraryService()
        
        itinerary = await service.generate_itinerary(
            destination=request.destination,
            start_date=request.startDate,
            end_date=request.endDate,
            has_flights=request.hasFlights,
            arrival_time=request.arrivalTime,
            departure_time=request.departureTime,
            has_hotel=request.hasHotel,
            hotel_name=request.hotelName,
            hotel_category=request.hotelCategory,
            needs_hotel_recommendation=request.needsHotelRecommendation,
            user_plan=user_plan,
            preferences=request.preferences.dict() if request.preferences else None
        )
        
        if not itinerary:
            raise HTTPException(
                status_code=500,
                detail="No se pudo generar el itinerario"
            )
        
        print(f"✅ ITINERARIO GENERADO EXITOSAMENTE")
        if first_trip_bonus:
            print(f"🎉 PLUS OTORGADO: Usuario {user['email']} ha usado su primer viaje gratis\n")
        print()
        
        # Indicar si es modo MOCK y si fue primer viaje
        is_mock = os.environ.get('USE_MOCK_DATA', 'false').lower() == 'true'
        
        response_data = {"itinerary": itinerary}
        if first_trip_bonus:
            response_data["first_trip_bonus"] = True
            response_data["message"] = "¡Felicidades! Has usado tu Plan PLUS gratis en tu primer viaje 🎉"
        
        return JSONResponse(
            content=response_data,
            headers={
                "X-Mock-Mode": "true" if is_mock else "false",
                "X-First-Trip-Bonus": "true" if first_trip_bonus else "false"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generando itinerario: {str(e)}"
        )
