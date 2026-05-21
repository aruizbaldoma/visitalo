"""Endpoint público para consultar productos Viator por destino."""
from typing import Any, Dict

from fastapi import APIRouter, Query, Request

from services.viator_service import search_products, shape_product_for_prompt

viator_router = APIRouter()


@viator_router.get("/products")
async def products(
    request: Request,
    destination: str = Query(..., min_length=2, max_length=80),
    limit: int = Query(25, ge=1, le=50),
) -> Dict[str, Any]:
    items = await search_products(destination, limit=limit)
    return {
        "destination": destination,
        "count": len(items),
        "products": [shape_product_for_prompt(p) for p in items],
    }
