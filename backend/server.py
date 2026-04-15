from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from services.gemini_service import GeminiTravelService


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

class TravelSearchRequest(BaseModel):
    departureCity: str
    startDate: str
    endDate: str
    budget: int

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

@api_router.post("/search-trips", response_model=TravelSearchResponse)
async def search_trips(search_request: TravelSearchRequest):
    """
    Endpoint para buscar viajes usando Gemini AI
    """
    try:
        # Validar datos
        if search_request.budget < 100:
            raise HTTPException(status_code=400, detail="El presupuesto mínimo es 100€")
        
        print(f"\n📥 REQUEST RECIBIDO:")
        print(f"   Origen: {search_request.departureCity}")
        print(f"   Fechas: {search_request.startDate} a {search_request.endDate}")
        print(f"   Presupuesto: {search_request.budget}€\n")
        
        # Crear servicio de Gemini
        gemini_service = GeminiTravelService()
        
        # Generar recomendaciones (esto lanzará excepción si falla)
        trips = await gemini_service.generate_travel_recommendations(
            departure_city=search_request.departureCity,
            start_date=search_request.startDate,
            end_date=search_request.endDate,
            budget=search_request.budget
        )
        
        if not trips or len(trips) == 0:
            raise HTTPException(
                status_code=500, 
                detail="Gemini no generó viajes. Por favor intenta con otro presupuesto o destino."
            )
        
        # Guardar búsqueda en la base de datos
        search_record = {
            "search_id": str(uuid.uuid4()),
            "query": search_request.model_dump(),
            "results_count": len(trips),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.travel_searches.insert_one(search_record)
        
        print(f"\n✅ RESPUESTA EXITOSA: {len(trips)} viajes generados\n")
        
        return TravelSearchResponse(
            results=trips,
            query=search_request
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ ERROR EN BÚSQUEDA: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error generando recomendaciones: {str(e)}"
        )

# Include the router in the main app
app.include_router(api_router)

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