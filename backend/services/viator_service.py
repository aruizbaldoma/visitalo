"""
Cliente del Viator Partner API v2.

Auth: header `exp-api-key`.
Base URL: https://api.viator.com/partner

Flujo:
    1. Cargamos el catálogo de DESTINATIONS al primer uso (cache 24h en memoria).
       Necesario para mapear "Roma" → destinationId=511.
    2. `search_products(destination, limit)` busca productos por destinationId
       ordenados por TRAVELER_RATING DESC, en EUR y `Accept-Language: es-ES`.
       Cache 1h por (destinationId, limit).
    3. Cada producto trae `productUrl` ya con `pid=` y `mcid=` listos para
       cobrar comisión.

Pollución vs Tiqets: Viator suele tener más volumen de actividades. Lo usamos
como SEGUNDO proveedor (Tiqets sigue siendo el preferido).
"""
import os
import re
import time
import unicodedata
from typing import Any, Dict, List, Optional

import httpx

_BASE_URL = "https://api.viator.com/partner"
_PRODUCTS_TTL = 3600  # 1h
_DESTINATIONS_TTL = 24 * 3600  # 24h

# Mapeo manual ES→nombre que Viator devuelve (la mayoría de ciudades
# vienen en su idioma local en `destinations.name`; este diccionario evita
# matches ambiguos para los destinos top).
_DEST_OVERRIDE_ES = {
    "roma": ("Roma", "CITY"),
    "rome": ("Roma", "CITY"),
    "paris": ("París", "CITY"),
    "parís": ("París", "CITY"),
    "londres": ("Londres", "CITY"),
    "london": ("Londres", "CITY"),
    "barcelona": ("Barcelona", "CITY"),
    "madrid": ("Madrid", "CITY"),
    "sevilla": ("Sevilla", "CITY"),
    "lisboa": ("Lisboa", "CITY"),
    "lisbon": ("Lisboa", "CITY"),
    "amsterdam": ("Ámsterdam", "CITY"),
    "ámsterdam": ("Ámsterdam", "CITY"),
    "berlin": ("Berlín", "CITY"),
    "berlín": ("Berlín", "CITY"),
    "praga": ("Praga", "CITY"),
    "prague": ("Praga", "CITY"),
    "viena": ("Viena", "CITY"),
    "vienna": ("Viena", "CITY"),
    "florencia": ("Florencia", "CITY"),
    "florence": ("Florencia", "CITY"),
    "venecia": ("Venecia", "CITY"),
    "venice": ("Venecia", "CITY"),
    "estambul": ("Estambul", "CITY"),
    "tokio": ("Tokio", "CITY"),
    "tokyo": ("Tokio", "CITY"),
    "osaka": ("Osaka", "CITY"),
    "nueva york": ("Nueva York", "CITY"),
    "new york city": ("Nueva York", "CITY"),
    "nueva york city": ("Nueva York", "CITY"),
}

_cache: Dict[str, Any] = {
    "destinations": None,            # lista
    "destinations_ts": 0,
    "products": {},                  # cache_key -> {data, ts}
}


def _strip_accents(s: str) -> str:
    if not s:
        return ""
    return (
        unicodedata.normalize("NFKD", s)
        .encode("ascii", "ignore")
        .decode("ascii")
    )


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", _strip_accents((s or "").lower()).strip())


async def _load_destinations() -> List[Dict[str, Any]]:
    """Carga el listado completo de destinos (3000+ items) la primera vez."""
    api_key = os.environ.get("VIATOR_API_KEY", "").strip()
    if not api_key:
        return []
    now = time.time()
    cached = _cache.get("destinations")
    if cached and (now - _cache["destinations_ts"]) < _DESTINATIONS_TTL:
        return cached

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{_BASE_URL}/destinations",
                headers={
                    "exp-api-key": api_key,
                    "Accept": "application/json;version=2.0",
                    "Accept-Language": "es-ES",
                },
            )
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:  # noqa: BLE001
        print(f"⚠️ Viator destinations fetch failed: {e}")
        return []

    destinations = data.get("destinations") or []
    _cache["destinations"] = destinations
    _cache["destinations_ts"] = now
    return destinations


async def find_destination_id(destination: str) -> Optional[int]:
    """Resuelve "Roma, Italia" → 511. Devuelve None si no encuentra."""
    if not destination:
        return None
    head = destination.strip().split(",")[0].split("(")[0].strip()
    key = _norm(head)

    override = _DEST_OVERRIDE_ES.get(key)
    target_name, target_type = (None, None)
    if override:
        target_name, target_type = override

    destinations = await _load_destinations()
    if not destinations:
        return None

    # Pase 1: match exacto con override (preferimos type=CITY).
    if target_name:
        for d in destinations:
            if d.get("name") == target_name and (
                not target_type or d.get("type") == target_type
            ):
                return d.get("destinationId")

    # Pase 2: match exacto normalizado en `name` con type=CITY.
    for d in destinations:
        if _norm(d.get("name", "")) == key and d.get("type") == "CITY":
            return d.get("destinationId")
    # Pase 3: cualquier type, igual normalizado.
    for d in destinations:
        if _norm(d.get("name", "")) == key:
            return d.get("destinationId")
    # Pase 4: contiene (puede haber ruido — solo si type=CITY).
    for d in destinations:
        n = _norm(d.get("name", ""))
        if key in n and d.get("type") == "CITY":
            return d.get("destinationId")
    return None


async def search_products(destination: str, limit: int = 25) -> List[Dict[str, Any]]:
    """Devuelve hasta `limit` productos Viator de la ciudad indicada.

    Ordenados por traveler rating descendente. Cache en memoria 1h.
    Sin API key → []. Cualquier error → [] (no rompe el flujo).
    """
    api_key = os.environ.get("VIATOR_API_KEY", "").strip()
    if not api_key:
        return []

    dest_id = await find_destination_id(destination)
    if not dest_id:
        return []

    cache_key = f"{dest_id}::{limit}"
    entry = _cache["products"].get(cache_key)
    if entry and time.time() - entry["ts"] < _PRODUCTS_TTL:
        return entry["data"]

    body = {
        "filtering": {"destination": str(dest_id)},
        "sorting": {"sort": "TRAVELER_RATING", "order": "DESCENDING"},
        "pagination": {"start": 1, "count": max(1, min(limit, 50))},
        "currency": "EUR",
    }
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(
                f"{_BASE_URL}/products/search",
                headers={
                    "exp-api-key": api_key,
                    "Accept": "application/json;version=2.0",
                    "Accept-Language": "es-ES",
                    "Content-Type": "application/json",
                },
                json=body,
            )
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:  # noqa: BLE001
        print(f"⚠️ Viator products fetch failed: {e}")
        return []

    products = data.get("products") or []
    _cache["products"][cache_key] = {"data": products, "ts": time.time()}
    return products


def shape_product_for_prompt(p: Dict[str, Any]) -> Dict[str, Any]:
    """Versión recortada del producto para inyectar en el prompt."""
    pricing = p.get("pricing") or {}
    summary = pricing.get("summary") or {}
    reviews = p.get("reviews") or {}
    duration = p.get("duration") or {}
    return {
        "code": p.get("productCode"),
        "title": p.get("title"),
        "price_eur": summary.get("fromPrice"),
        "currency": pricing.get("currency"),
        "rating": reviews.get("combinedAverageRating"),
        "rating_count": reviews.get("totalReviews"),
        "duration_min": (duration.get("fixedDurationInMinutes")
                          or duration.get("variableDurationFromMinutes")),
        "url": p.get("productUrl"),
    }


async def list_for_prompt(destination: str, limit: int = 25) -> List[Dict[str, Any]]:
    products = await search_products(destination, limit=limit)
    return [shape_product_for_prompt(p) for p in products]
