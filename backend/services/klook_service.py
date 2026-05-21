"""
Klook via Travelpayouts.

A diferencia de Tiqets (que tiene API de catálogo con productos reales),
Klook NO expone catálogo público. Por eso aquí solo construimos
**deeplinks de búsqueda** afiliados:

    https://tp.media/r?campaign_id=137&marker=<MARKER>&p=4110&sub_id=<sub>&trs=<TRS>&u=<URL_KLOOK_BUSQUEDA>

donde la URL Klook es del tipo:

    https://www.klook.com/es/search/?query=<actividad+destino>

El usuario aterriza en la búsqueda Klook ya con tracking aplicado.

Política actual (Feb 2026):
- Klook se usa como SEGUNDO proveedor de pago (después de Tiqets).
- Cuando una actividad de pago no encaja con Tiqets, intentamos Klook.
- Como no tenemos precio exacto, el precio que mete Gemini es estimación.
"""
import os
import urllib.parse

_KLOOK_SEARCH_BASE = "https://www.klook.com/es/search/"
_TP_REDIRECT = "https://tp.media/r"


def is_enabled() -> bool:
    """Devuelve True si tenemos todo lo necesario para construir deeplinks."""
    return bool(
        os.environ.get("TRAVELPAYOUTS_MARKER")
        and os.environ.get("TRAVELPAYOUTS_TRS")
    )


def build_klook_search_url(query: str) -> str:
    """URL de búsqueda Klook en español (sin tracking)."""
    q = urllib.parse.urlencode({"query": query})
    return f"{_KLOOK_SEARCH_BASE}?{q}"


def build_affiliate_url(query: str, sub_id: str = "visitalo") -> str:
    """Construye el deeplink afiliado de Klook vía tp.media.

    El formato fue verificado contra `api.travelpayouts.com/links/v1/create`
    para confirmar los IDs de `campaign_id` (137) y `p` (4110).
    Construirlo localmente evita llamadas extra a la API.
    """
    marker = os.environ.get("TRAVELPAYOUTS_MARKER", "").strip()
    trs = os.environ.get("TRAVELPAYOUTS_TRS", "").strip()
    campaign_id = os.environ.get("KLOOK_CAMPAIGN_ID", "137").strip()
    partner_id = os.environ.get("KLOOK_PARTNER_ID", "4110").strip()

    klook_url = build_klook_search_url(query)
    params = {
        "campaign_id": campaign_id,
        "marker": marker,
        "p": partner_id,
        "sub_id": sub_id,
        "trs": trs,
        "u": klook_url,
    }
    return f"{_TP_REDIRECT}?{urllib.parse.urlencode(params, safe='%')}"


def build_query(activity_title: str, destination: str) -> str:
    """Combina título y destino en una query de búsqueda para Klook."""
    title = (activity_title or "").strip()
    dest = (destination or "").strip().split(",")[0].strip()
    if dest and dest.lower() not in title.lower():
        return f"{title} {dest}"
    return title
