from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, List
import uuid
from datetime import datetime, timezone
# from services.gemini_service import GeminiTravelService  # Deprecated - usar itinerary_service
from routes.itinerary_routes import itinerary_router
from routes.auth_routes import auth_router
from routes.trips_routes import trips_router
from routes.subscription_routes import subscription_router
from routes.stripe_routes import stripe_router
from routes.insights_routes import insights_router


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class TravelDetailsRequest(BaseModel):
    """Detalles opcionales del viaje para contexto inteligente"""
    arrivalTime: Optional[str] = None  # Hora de llegada día 1 (ej: "14:00")
    departureTime: Optional[str] = None  # Hora de salida último día (ej: "18:00")
    hotelZones: Optional[Dict[str, str]] = None  # {"day1": "Centro histórico", "day2": "Centro histórico"}
    needsHotelRecommendation: bool = False  # ¿Necesita recomendación de zona?

class TravelSearchRequest(BaseModel):
    departureCity: str
    destination: str  # Ahora el usuario elige destino específico
    startDate: str
    endDate: str
    travelDetails: Optional[TravelDetailsRequest] = None  # Detalles opcionales

class Trip(BaseModel):
    id: int
    destination: str
    country: str
    days: int
    price: int
    image: str
    itinerary: List[str]
    includes: dict
    departure: str

class TravelSearchResponse(BaseModel):
    results: List[Trip]
    query: TravelSearchRequest

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# DEPRECATED: Endpoint viejo - usar /api/generate-itinerary en su lugar
# @api_router.post("/search-trips")
# async def search_trips(search_request: TravelSearchRequest):
#     ...endpoint comentado temporalmente...

# Include the routers in the main app
app.include_router(api_router)
app.include_router(itinerary_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")  # Rutas de autenticación
app.include_router(trips_router, prefix="/api/trips")  # Viajes guardados
app.include_router(subscription_router, prefix="/api/subscription")  # Suscripción PLUS (Stripe-ready)
app.include_router(stripe_router, prefix="/api")  # Stripe Checkout + webhooks
app.include_router(insights_router, prefix="/api/insights")  # Captura de datos para análisis

# Almacenar DB en app.state para acceso en dependencies
@app.on_event("startup")
async def startup_db():
    app.state.db = db

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()