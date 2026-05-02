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
    # Budget hints: drive Gemini to keep activity prices in a sensible range
    budget: Optional[str] = None  # saver | balanced | luxury
    budgetAmount: Optional[float] = None  # total trip cap per person (EUR)


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
        # LÓGICA: cada usuario tiene 5 búsquedas PLUS gratis al registrarse.
        # Cuando las agota, vuelve a Basic.
        FREE_PLUS_SEARCHES = 5
        user_plan = "basic"
        first_trip_bonus = False
        plus_searches_used = 0
        plus_searches_remaining = 0

        if user:
            user_plan = user.get("user_plan", "basic")
            plus_searches_used = user.get("plus_searches_used", 0)
            # Soportar usuarios antiguos que tenían "first_trip_used"
            if plus_searches_used == 0 and user.get("first_trip_used") is True:
                plus_searches_used = FREE_PLUS_SEARCHES  # ya gastó su bonus antiguo

            if plus_searches_used < FREE_PLUS_SEARCHES:
                user_plan = "plus"
                first_trip_bonus = True
                plus_searches_used += 1
                plus_searches_remaining = FREE_PLUS_SEARCHES - plus_searches_used
                print(
                    f"🎁 BÚSQUEDA PLUS gratis {plus_searches_used}/{FREE_PLUS_SEARCHES} "
                    f"para {user['email']} — quedan {plus_searches_remaining}"
                )
                await db.users.update_one(
                    {"user_id": user["user_id"]},
                    {"$set": {
                        "plus_searches_used": plus_searches_used,
                        "first_trip_used": True,  # mantener compat
                    }},
                )
        else:
            print(f"👤 Usuario NO AUTENTICADO: Usando Plan Basic")

        # Registrar búsqueda en historial (solo si hay usuario autenticado).
        if user:
            try:
                await db.search_history.insert_one({
                    "user_id": user["user_id"],
                    "destination": request.destination,
                    "start_date": request.startDate,
                    "end_date": request.endDate,
                    "has_flights": request.hasFlights,
                    "has_hotel": request.hasHotel,
                    "hotel_category": request.hotelCategory,
                    "user_plan": user_plan,
                    "budget": request.budget,
                    "created_at": datetime.now(timezone.utc),
                })
            except Exception as e:  # noqa: BLE001
                print(f"⚠️ search_history insert falló: {e}")

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
            preferences=request.preferences.dict() if request.preferences else None,
            budget=request.budget,
            budget_amount=request.budgetAmount,
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
            response_data["plus_searches_remaining"] = plus_searches_remaining
            response_data["message"] = (
                f"¡PLUS activado! Te quedan {plus_searches_remaining} búsquedas gratis 🎉"
                if plus_searches_remaining > 0
                else "Esta ha sido tu última búsqueda PLUS gratis."
            )
        
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
        error_msg = str(e)
        print(f"❌ ERROR: {error_msg}")

        # Gemini saturado o caído: devolver 503 con mensaje amable para el usuario
        if "GEMINI_UNAVAILABLE" in error_msg:
            raise HTTPException(
                status_code=503,
                detail=(
                    "El servicio de planificación está saturado en este momento. "
                    "Vuelve a intentarlo en unos segundos."
                )
            )

        raise HTTPException(
            status_code=500,
            detail=f"Error generando itinerario: {error_msg}"
        )
