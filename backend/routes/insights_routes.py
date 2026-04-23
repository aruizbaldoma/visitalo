"""
Rutas de Insights — captura opcional de datos de usuario para mejorar el producto.
Por ahora guarda el texto "Sí o Sí" que los usuarios PLUS escriben al personalizar.
"""
from fastapi import APIRouter, Request
from pydantic import BaseModel
from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional


insights_router = APIRouter()


class MustVisitPayload(BaseModel):
    text: str
    destination: Optional[str] = None
    user_id: Optional[str] = None


@insights_router.post("/must-visit")
async def save_must_visit(payload: MustVisitPayload, req: Request):
    """Guarda el texto de 'Sí o Sí' para futuros análisis (recomendaciones, tendencias)."""
    text = (payload.text or "").strip()
    if not text:
        return {"saved": False}

    db = req.app.state.db
    doc = {
        "entry_id": f"mv_{uuid4().hex[:12]}",
        "text": text,
        "destination": (payload.destination or "").strip() or None,
        "user_id": payload.user_id,
        "created_at": datetime.now(timezone.utc),
    }
    await db.must_visit_inputs.insert_one(doc)
    return {"saved": True, "entry_id": doc["entry_id"]}
