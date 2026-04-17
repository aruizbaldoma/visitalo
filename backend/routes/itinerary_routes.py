"""
Endpoint para Gestión Profesional de Itinerarios
API limpia sin precios ni ofertas
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict
import os
from services.itinerary_service import ItineraryService

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


@itinerary_router.post("/generate-itinerary")
async def generate_itinerary(request: ItineraryRequest):
    """
    Genera un itinerario profesional sin precios
    Solo planificación de actividades por Mañana/Tarde/Noche
    """
    try:
        print(f"\n📥 REQUEST: Itinerario para {request.destination}")
        
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
            user_plan=request.userPlan,
            preferences=request.preferences.dict() if request.preferences else None
        )
        
        if not itinerary:
            raise HTTPException(
                status_code=500,
                detail="No se pudo generar el itinerario"
            )
        
        print(f"✅ ITINERARIO GENERADO EXITOSAMENTE\n")
        
        # Indicar si es modo MOCK
        is_mock = os.environ.get('USE_MOCK_DATA', 'false').lower() == 'true'
        
        return JSONResponse(
            content={"itinerary": itinerary},
            headers={"X-Mock-Mode": "true" if is_mock else "false"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generando itinerario: {str(e)}"
        )
