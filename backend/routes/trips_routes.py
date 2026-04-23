"""
Endpoints para guardar, listar y eliminar itinerarios del usuario.
Todo requiere autenticación.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime, timezone
from uuid import uuid4

from utils.auth import get_current_user

trips_router = APIRouter()


class SaveTripRequest(BaseModel):
    destination: str
    startDate: str
    endDate: str
    title: Optional[str] = None
    itinerary: Any  # El objeto completo (dict) que genera el backend


@trips_router.post("/save")
async def save_trip(
    payload: SaveTripRequest,
    req: Request,
    user: dict = Depends(get_current_user),
):
    """Guarda un itinerario del usuario autenticado."""
    db = req.app.state.db
    trip_id = f"trip_{uuid4().hex[:12]}"
    doc = {
        "trip_id": trip_id,
        "user_id": user["user_id"],
        "destination": payload.destination,
        "start_date": payload.startDate,
        "end_date": payload.endDate,
        "title": payload.title or payload.destination,
        "itinerary": payload.itinerary,
        "created_at": datetime.now(timezone.utc),
    }
    await db.saved_trips.insert_one(doc)
    return {
        "trip_id": trip_id,
        "title": doc["title"],
        "destination": doc["destination"],
        "startDate": doc["start_date"],
        "endDate": doc["end_date"],
        "createdAt": doc["created_at"].isoformat(),
    }


@trips_router.get("")
async def list_trips(
    req: Request,
    user: dict = Depends(get_current_user),
):
    """Lista los itinerarios guardados del usuario."""
    db = req.app.state.db
    cursor = db.saved_trips.find(
        {"user_id": user["user_id"]},
        {"_id": 0, "itinerary": 0},  # Excluir itinerary en el listado para rendimiento
    ).sort("created_at", -1)
    trips = []
    async for doc in cursor:
        trips.append({
            "trip_id": doc["trip_id"],
            "title": doc.get("title") or doc["destination"],
            "destination": doc["destination"],
            "startDate": doc["start_date"],
            "endDate": doc["end_date"],
            "createdAt": doc["created_at"].isoformat() if isinstance(doc["created_at"], datetime) else doc["created_at"],
        })
    return {"trips": trips}


@trips_router.get("/{trip_id}")
async def get_trip(
    trip_id: str,
    req: Request,
    user: dict = Depends(get_current_user),
):
    """Devuelve el itinerario completo de un viaje guardado."""
    db = req.app.state.db
    doc = await db.saved_trips.find_one(
        {"trip_id": trip_id, "user_id": user["user_id"]},
        {"_id": 0},
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    if isinstance(doc.get("created_at"), datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    return doc


@trips_router.delete("/{trip_id}")
async def delete_trip(
    trip_id: str,
    req: Request,
    user: dict = Depends(get_current_user),
):
    """Elimina un viaje guardado del usuario."""
    db = req.app.state.db
    result = await db.saved_trips.delete_one(
        {"trip_id": trip_id, "user_id": user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    return {"ok": True}
