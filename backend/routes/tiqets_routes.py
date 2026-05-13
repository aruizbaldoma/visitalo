"""
Endpoint público que expone productos de Tiqets para un destino concreto.

Lo usa el frontend para enriquecer las tarjetas de actividad: si el
título coincide aproximadamente con un producto Tiqets, el botón
"Reservar" abre el deeplink real con `?partner=vistalo-...`.
"""
from typing import Any, Dict

from fastapi import APIRouter, Query, Request

from services.tiqets_service import search_products, shape_product_for_prompt

tiqets_router = APIRouter()


@tiqets_router.get("/products")
async def products(
    request: Request,
    destination: str = Query(..., min_length=2, max_length=80),
    limit: int = Query(20, ge=1, le=50),
) -> Dict[str, Any]:
    items = await search_products(destination, limit=limit)
    return {
        "destination": destination,
        "count": len(items),
        "products": [shape_product_for_prompt(p) for p in items],
    }
