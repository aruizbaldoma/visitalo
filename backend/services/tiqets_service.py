"""
Cliente del Affiliate API de Tiqets.

Token: env `TIQETS_API_KEY` (`tqat-...`).
Endpoint base: https://api.tiqets.com/v2/

Ofrecemos dos métodos:
    search_products(destination, limit) → lista de productos (cache 1h)
    list_for_prompt(destination, limit)  → resumen corto listo para inyectar
                                            en el prompt de Gemini

Tiqets usa nombres de ciudad en inglés. Mantenemos un mapeo común
ES→EN para que el usuario pueda escribir "Sevilla" y encuentre "Seville".
Si no hay match, probamos el string tal cual y devolvemos vacío si no.
"""
import os
import time
from typing import Any, Dict, List, Optional

import httpx

_BASE_URL = "https://api.tiqets.com/v2"
_CACHE_TTL = 3600  # 1h
_USER_AGENT = "Visitalo.es/1.0"

# Mapeo destinos ES → nombre de ciudad en Tiqets (inglés).
# Solo los destinos más buscados; el resto cae al fallback que prueba
# variantes comunes (sin tildes, primera palabra, etc.).
_CITY_MAP_ES_EN = {
    "sevilla": "Seville",
    "roma": "Rome",
    "lisboa": "Lisbon",
    "lisbôa": "Lisbon",
    "florencia": "Florence",
    "venecia": "Venice",
    "milán": "Milan",
    "milan": "Milan",
    "atenas": "Athens",
    "viena": "Vienna",
    "moscú": "Moscow",
    "moscu": "Moscow",
    "praga": "Prague",
    "varsovia": "Warsaw",
    "estocolmo": "Stockholm",
    "copenhague": "Copenhagen",
    "ámsterdam": "Amsterdam",
    "amsterdam": "Amsterdam",
    "berlín": "Berlin",
    "berlin": "Berlin",
    "múnich": "Munich",
    "munich": "Munich",
    "hamburgo": "Hamburg",
    "colonia": "Cologne",
    "frankfurt": "Frankfurt",
    "bruselas": "Brussels",
    "brujas": "Bruges",
    "londres": "London",
    "edimburgo": "Edinburgh",
    "dublín": "Dublin",
    "dublin": "Dublin",
    "estambul": "Istanbul",
    "el cairo": "Cairo",
    "ciudad de méxico": "Mexico City",
    "nueva york": "New York",
    "los ángeles": "Los Angeles",
    "los angeles": "Los Angeles",
    "san francisco": "San Francisco",
    "miami": "Miami",
    "tokio": "Tokyo",
    "pekín": "Beijing",
    "pekin": "Beijing",
    "shanghái": "Shanghai",
    "shanghai": "Shanghai",
}

_cache: Dict[str, Dict[str, Any]] = {}


def _normalize_destination(destination: str) -> str:
    """Devuelve el `city_name` que Tiqets reconoce.

    Estrategia:
    1. Quitamos sufijos (",", "(") y aplicamos lowercase.
    2. Si el nombre está en el mapeo ES→EN, devolvemos la traducción.
    3. Probamos sin tildes (París → Paris, Múnich → Munich) — Tiqets usa
       grafías sin tildes en la mayoría de ciudades.
    4. Si nada de lo anterior, devolvemos el primer nombre tal cual.
    """
    if not destination:
        return ""
    raw = destination.strip()
    head = raw.split(",")[0].split("(")[0].strip()
    key = head.lower()

    if key in _CITY_MAP_ES_EN:
        return _CITY_MAP_ES_EN[key]

    import unicodedata
    stripped_key = (
        unicodedata.normalize("NFKD", key).encode("ascii", "ignore").decode("ascii").strip()
    )
    if stripped_key in _CITY_MAP_ES_EN:
        return _CITY_MAP_ES_EN[stripped_key]

    # Importante: Tiqets reconoce muchas ciudades por su grafía SIN tildes
    # (París → Paris, Múnich → Munich, Berlín → Berlin), pero rechaza la
    # versión con tildes. Devolvemos siempre la versión sin acentos cuando
    # no tenemos un mapeo explícito.
    if stripped_key and stripped_key != key:
        # Capitalizamos cada palabra para mantener formato consistente.
        return " ".join(w.capitalize() for w in stripped_key.split())
    return head


def _cache_get(key: str) -> Optional[List[Dict[str, Any]]]:
    entry = _cache.get(key)
    if entry and time.time() - entry["ts"] < _CACHE_TTL:
        return entry["data"]
    return None


def _cache_set(key: str, data: List[Dict[str, Any]]) -> None:
    _cache[key] = {"ts": time.time(), "data": data}


async def search_products(destination: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Devuelve hasta `limit` productos de Tiqets en la ciudad indicada.

    Cache en memoria 1h por (city_name, limit). Si no hay API key
    configurada o la llamada falla, devuelve `[]` (no rompe el flujo).
    """
    api_key = os.environ.get("TIQETS_API_KEY", "").strip()
    if not api_key:
        return []

    city_name = _normalize_destination(destination)
    if not city_name:
        return []

    cache_key = f"{city_name.lower()}::{limit}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                f"{_BASE_URL}/products",
                params={"city_name": city_name, "limit": limit},
                headers={
                    "Accept": "application/json",
                    "User-Agent": _USER_AGENT,
                    "Authorization": f"Token {api_key}",
                },
            )
            resp.raise_for_status()
            payload = resp.json()
    except Exception as e:  # noqa: BLE001
        print(f"⚠️ Tiqets API error: {e}")
        return []

    products = payload.get("products") or []
    # Solo conservamos los disponibles.
    products = [
        p for p in products if (p.get("sale_status") or "available") == "available"
    ]
    _cache_set(cache_key, products)
    return products


def shape_product_for_prompt(p: Dict[str, Any]) -> Dict[str, Any]:
    """Versión recortada del producto para inyectar en el prompt."""
    venue = p.get("venue") or {}
    return {
        "id": p.get("id"),
        "title": p.get("title"),
        "tagline": p.get("tagline"),
        "city": p.get("city_name"),
        "address": venue.get("address") or p.get("starting_point", {}).get("address"),
        "venue": venue.get("name"),
        "price_eur": p.get("price"),
        "duration": p.get("duration"),
        "rating": (p.get("ratings") or {}).get("average"),
        "rating_count": (p.get("ratings") or {}).get("total"),
        "url": p.get("product_url"),
    }


async def list_for_prompt(destination: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Lista recortada de productos para inyectar en el prompt de Gemini."""
    products = await search_products(destination, limit=limit)
    return [shape_product_for_prompt(p) for p in products]
