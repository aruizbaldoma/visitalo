"""
Servicio de Gestión Profesional de Itinerarios
Sin precios, sin ofertas - Solo planificación de actividades
"""
import requests
import os
import json
import time
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional


# Modelos Gemini en cascada: preview (más reciente) -> estable (fallback)
GEMINI_MODELS = [
    "gemini-flash-latest",   # alias -> gemini-3-flash-preview (puede dar 503 si saturado)
    "gemini-2.5-flash",      # fallback estable si el preview está saturado
]

# Códigos transitorios que justifican retry / fallback de modelo
RETRIABLE_STATUS_CODES = {429, 500, 502, 503, 504}


class ItineraryService:
    """
    Servicio profesional para generar itinerarios de viaje detallados
    Enfocado en planificación de actividades (Mañana/Tarde/Noche)
    """
    
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY')
        self.use_mock = os.environ.get('USE_MOCK_DATA', 'false').lower() == 'true'
        self.base_url_template = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    
    async def generate_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        has_flights: bool = False,
        arrival_time: Optional[str] = None,
        departure_time: Optional[str] = None,
        has_hotel: bool = False,
        hotel_name: Optional[str] = None,
        hotel_category: str = "standard",
        needs_hotel_recommendation: bool = False,
        user_plan: str = "basic",
        preferences: Optional[Dict] = None,
        budget: Optional[str] = None,
        budget_amount: Optional[float] = None,
    ) -> Dict:
        """
        Genera un itinerario profesional estructurado por días y momentos del día
        
        Args:
            destination: Ciudad/país destino
            start_date: Fecha inicio (YYYY-MM-DD)
            end_date: Fecha fin (YYYY-MM-DD)
            has_flights: Si el usuario tiene vuelos reservados
            arrival_time: Hora llegada (HH:MM) - solo si has_flights=True
            departure_time: Hora salida (HH:MM) - solo si has_flights=True
            has_hotel: Si el usuario tiene hotel reservado
            hotel_name: Nombre del hotel - solo si has_hotel=True
            hotel_category: Categoría de hotel (standard, boutique, luxury, hostel, apartment)
            needs_hotel_recommendation: Si necesita recomendación de hotel - solo si has_hotel=False
            user_plan: Plan del usuario (basic o plus)
            preferences: Preferencias Plus (actividades y ritmo)
            
        Returns:
            Dict con estructura de itinerario completo
        """
        print(f"\n{'='*70}")
        print(f"📋 GENERANDO ITINERARIO PROFESIONAL")
        print(f"   Destino: {destination}")
        print(f"   Plan: {user_plan.upper()}")
        print(f"   Fechas: {start_date} → {end_date}")
        if has_flights:
            print(f"   Vuelos: Llegada {arrival_time}, Salida {departure_time}")
        if has_hotel and hotel_name:
            print(f"   Hotel: {hotel_name}")
        elif needs_hotel_recommendation:
            print(f"   Hotel: Recomendación solicitada (Categoría: {hotel_category})")
        if preferences and user_plan == 'plus':
            print(f"   Preferencias PLUS: {preferences}")
        print(f"{'='*70}\n")
        
        # Calcular días
        # Calcular días totales (rango inclusivo: del 8 al 9 de junio = 2 días)
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        total_days = (end - start).days + 1
        if total_days < 1:
            total_days = 1
        
        if self.use_mock:
            return self._generate_mock_itinerary(
                destination, start_date, end_date, total_days,
                has_flights, arrival_time, departure_time,
                has_hotel, hotel_name, hotel_category,
                needs_hotel_recommendation, user_plan, preferences
            )
        
        # Generar con Gemini AI
        return await self._generate_ai_itinerary(
            destination, start_date, end_date, total_days,
            has_flights, arrival_time, departure_time,
            has_hotel, hotel_name, hotel_category,
            needs_hotel_recommendation, user_plan, preferences,
            budget, budget_amount,
        )
    
    async def _generate_ai_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        total_days: int,
        has_flights: bool,
        arrival_time: Optional[str],
        departure_time: Optional[str],
        has_hotel: bool,
        hotel_name: Optional[str],
        hotel_category: str,
        needs_hotel_recommendation: bool,
        user_plan: str,
        preferences: Optional[Dict],
        budget: Optional[str] = None,
        budget_amount: Optional[float] = None,
    ) -> Dict:
        """
        Genera itinerario usando Gemini AI con nueva lógica Plus/Basic
        """
        # Construir contexto inteligente con preferencias
        context = self._build_context(
            total_days, has_flights, arrival_time, departure_time,
            has_hotel, hotel_name, hotel_category,
            needs_hotel_recommendation, user_plan, preferences
        )

        # Rango de precio por actividad según presupuesto
        # - Si el usuario eligió un modo de presupuesto (PLUS), lo usamos.
        # - Si no eligió nada (Basic por defecto), aplicamos 10-30€ por actividad.
        price_min, price_max, budget_label = self._derive_activity_price_range(
            budget=budget,
            budget_amount=budget_amount,
            user_plan=user_plan,
            total_days=total_days,
        )

        # Bloque de presupuesto que se inyecta en el prompt
        budget_block = (
            f"PRESUPUESTO POR ACTIVIDAD ({budget_label}):\n"
            f"- Cada actividad turística debe costar entre {price_min:.0f}€ y {price_max:.0f}€.\n"
            f"- NO incluyas actividades fuera de este rango.\n"
            f"- Vuelos y hoteles siguen sin precio (price=null).\n"
        )
        if budget_amount and budget_amount > 0:
            budget_block += (
                f"- Presupuesto total orientativo por persona: ~{budget_amount:.0f}€ "
                f"para todo el viaje (no lo sobrepases sumando actividades).\n"
            )

        # Rango de precio del HOTEL según el modo de presupuesto.
        # Si el usuario no eligió nada → modo "Equilibrado" por defecto.
        hotel_min, hotel_max, hotel_label = self._derive_hotel_price_range(budget)
        hotel_price_block = (
            f"\nPRESUPUESTO POR HOTEL ({hotel_label}):\n"
            f"- Si recomiendas hotel, su precio orientativo por persona y noche debe estar "
            f"entre {hotel_min:.0f}€ y "
            f"{(f'{hotel_max:.0f}€' if hotel_max is not None else 'sin techo (lujo)')}.\n"
            f"- Refleja claramente este rango en `hotelRecommendation` "
            f"(ej.: \"Hoteles 3-4★ en zona céntrica, ~80-150€/persona/noche\").\n"
        )
        budget_block += hotel_price_block

        # Catálogo Tiqets + Viator — productos REALES con afiliado. Si
        # tenemos productos para esta ciudad, le pedimos a Gemini que los USE
        # como primera opción siempre que encajen con el plan del día.
        tiqets_block = await self._build_tiqets_catalog_block(destination)
        viator_block = await self._build_viator_catalog_block(destination)

        # Prompt profesional — versión 2 (más rigurosa, anti-alucinaciones)
        prompt = f"""Eres un planificador senior de viajes con 15 años de experiencia local en {destination}. Construyes itinerarios que parecen escritos por alguien que vive allí: sabes qué calle coger, qué bar coger café, qué museo evitar los lunes, dónde no te timan, y cuánto cuesta cada cosa en 2026.

═══════════════════════════════════════════════
DATOS DEL VIAJE
═══════════════════════════════════════════════
DESTINO: {destination}
FECHAS: {start_date} → {end_date}   ({total_days} días, rango inclusivo)

CONTEXTO DEL USUARIO:
{context}

{budget_block}

{tiqets_block}

{viator_block}
═══════════════════════════════════════════════
REGLAS INNEGOCIABLES (rompe cualquiera y el output es INVÁLIDO)
═══════════════════════════════════════════════

R1. RESPETA TIEMPOS DE LLEGADA Y SALIDA
   - Si arriba ves "LLEGADA AL DESTINO" o "SALIDA DEL DESTINO" con horas, son LEY.
   - NO metas actividades antes de la llegada efectiva ni después de la hora límite de salida. Si lo haces, el JSON se descarta.

R2. ACTIVIDADES REALES, NOMBRES REALES
   - Nada de "Tour por el centro" genérico. Usa NOMBRE PROPIO de la atracción concreta (ej. "Catedral Nueva de Salamanca", "Casa de las Conchas", "Mercado Central", "Restaurante Río de la Plata").
   - Si no existe esa atracción/restaurante en {destination}, NO TE LA INVENTES — escoge una real que sí exista.
   - Direcciones: incluye calle/plaza concreta en `location` (ej. "Plaza Mayor, 12", "Calle Compañía, 1").

R3. PRECIOS REALISTAS 2026 (EUR)
   - Sigue el rango del bloque PRESUPUESTO de arriba.
   - Entradas a monumentos: precio real público (no inventes 45€ si la entrada cuesta 8€).
   - Comidas y cenas: precio del menú medio por persona en ese tipo de sitio.
   - Tours guiados: precio real del operador (Civitatis/GetYourGuide).
   - Si no estás seguro del precio EXACTO, da una horquilla baja realista — no infles.

R4. RITMO HUMANO
   - 2-4 actividades por día en ritmo equilibrado; 3-5 en intenso; 1-2 en relajado.
   - Cada actividad turística dura entre 1h y 3h.
   - Bloques: MAÑANA termina ~14:00; TARDE 14:00-19:00; NOCHE desde 19:30.
   - Deja margen para comer/cenar (ya lo metes como actividad) y para caminar entre puntos. Los puntos de un mismo bloque deben estar cerca; no des saltos de 30 min en metro entre dos actividades seguidas.

R5. PROVEEDORES — POLÍTICA ESTRICTA TIQETS + VIATOR
   - Actividades de pago (museos, monumentos, tours, parques temáticos, atracciones, miradores con entrada, espectáculos, experiencias guiadas):
     • Si encajan con algo del CATÁLOGO TIQETS de más arriba → `provider: "Tiqets"` + `tiqetsId`.
     • Si encajan con algo del CATÁLOGO VIATOR de más arriba → `provider: "Viator"` + `viatorCode` (productCode).
     • NUNCA uses Civitatis, GetYourGuide, Klook ni inventes operadores.
   - Experiencias gratis → `provider: "Gratis"`, `price: 0`.
   - Tiempo libre GenZ → `provider: "Tiempo libre"`, `price: 0`.
   - Restaurantes / bares → `provider: "Reserva directa"`. Sin `bookingUrl`.

R6. ESTRUCTURA POR DÍA
   - Genera EXACTAMENTE {total_days} entradas en `days`, una por cada día del rango.
   - NUNCA dejes un día con los tres bloques vacíos. Si un bloque queda vacío por la restricción de llegada/salida, compensa con más en los otros bloques de ese día.

R7. CONSEJOS LOCALES (campo opcional `tip`)
   - En 1 de cada 3 actividades, añade un campo `tip` con un consejo de local breve (1 frase): mejor hora para visitar, cómo evitar colas, qué pedir, qué barrio próximo merece pasear.

R8. PRECIOS NULL PARA TRANSPORTE Y HOTELES
   - Actividades turísticas: `price` numérico siempre (no null).
   - Vuelos / hoteles / traslados informativos: `price=null`.

R9. NUNCA REPITAS ATRACCIONES
   - Cada lugar/producto solo puede aparecer UNA VEZ en todo el itinerario.
   - Si tienes pocos productos Tiqets/Viator y muchos días: alterna y rellena el resto con gratis/comidas.

═══════════════════════════════════════════════
ESTRUCTURA JSON REQUERIDA (RESPONDE SOLO CON ESTE JSON)
═══════════════════════════════════════════════
{{
  "destination": "{destination}",
  "totalDays": {total_days},
  "hotelRecommendation": "Texto con zona + nombre/categoría + razón" o null,
  "days": [
    {{
      "day": 1,
      "date": "{start_date}",
      "morning": {{
        "activities": [
          {{
            "time": "10:30",
            "title": "Nombre propio real de la atracción",
            "description": "Por qué merece la pena, en 1-2 frases con personalidad",
            "location": "Dirección o plaza concreta",
            "duration": "2h",
            "price": 12.00,
            "activityId": "act_1_morning_1",
            "provider": "Tiqets",
            "tiqetsId": "12345",
            "tip": "Ve antes de las 11h para evitar grupos."
          }}
        ]
      }},
      "afternoon": {{ "activities": [...] }},
      "night":     {{ "activities": [...] }}
    }}
  ]
}}

IMPORTANTE: Devuelve **SOLO** el objeto JSON. Sin markdown, sin ```json, sin texto adicional antes o después.

JSON:"""
        
        # Escalar maxOutputTokens según días: viajes largos generan JSON mucho más grande.
        # Gemini 3 Flash soporta hasta ~65k tokens de output. Reservamos margen amplio.
        # Heurística: 2500 base + 2500 por día. 2d->7500, 7d->20000, 14d->37500, tope 48000.
        max_tokens = min(60000, 4500 + total_days * 3000)

        base_generation_config = {
            "temperature": 0.55,
            "maxOutputTokens": max_tokens,
        }

        try:
            headers = {'Content-Type': 'application/json'}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": base_generation_config,
            }

            itinerary = self._call_and_parse(headers, payload)

            # Si el parseo falla por JSON truncado/inválido, reintentamos con más tokens
            # y temperatura más baja para obtener una respuesta más determinista.
            if itinerary is None:
                print(
                    f"⚠️  JSON parse falló en 1er intento (days={total_days}, "
                    f"max_tokens={max_tokens}). Reintentando con config más estricta…"
                )
                retry_max_tokens = min(60000, max_tokens * 2)
                payload["generationConfig"] = {
                    "temperature": 0.3,
                    "maxOutputTokens": retry_max_tokens,
                }
                itinerary = self._call_and_parse(headers, payload)

            # Defensa adicional: a veces Gemini devuelve JSON válido pero con
            # menos días de los pedidos (modelo "vago"). Si faltan días,
            # reintentamos endureciendo el prompt.
            def _days_returned(it: Optional[Dict]) -> int:
                return len((it or {}).get("days", []) or [])

            if itinerary is not None and _days_returned(itinerary) < total_days:
                print(
                    f"⚠️  Modelo devolvió {_days_returned(itinerary)} días de "
                    f"{total_days}. Reintentando endurecido…"
                )
                payload["generationConfig"] = {
                    "temperature": 0.3,
                    "maxOutputTokens": min(60000, max_tokens * 2),
                }
                payload["contents"][0]["parts"][0]["text"] = (
                    prompt
                    + f"\n\nRECORDATORIO: el array `days` DEBE contener EXACTAMENTE {total_days} elementos. NO menos. Si te quedas sin espacio, recorta el texto de las descripciones pero NUNCA omitas días."
                )
                retry = self._call_and_parse(headers, payload)
                if retry is not None and _days_returned(retry) >= _days_returned(itinerary):
                    itinerary = retry

            if itinerary is None:
                raise Exception(
                    "Gemini devolvió JSON inválido tras 2 intentos "
                    f"(days={total_days}, max_tokens hasta {retry_max_tokens if 'retry_max_tokens' in locals() else max_tokens})"
                )

            # Enriquecer actividades que tengan `tiqetsId` con el deeplink
            # de afiliado real (`product_url` con ?partner=...).
            await self._enrich_tiqets_links(itinerary, destination)

            print(f"✅ ITINERARIO GENERADO: {destination}, {total_days} días\n")
            return itinerary

        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            raise Exception(f"Error generando itinerario: {str(e)}")

    async def _enrich_tiqets_links(self, itinerary: Dict, destination: str) -> None:
        """Enriquece las actividades con enlaces afiliados reales.

        Política Feb 2026 (proveedores activos):
          1. **Tiqets** — primer proveedor (catálogo con precio real, deeplink directo).
          2. **Viator** — segundo proveedor (catálogo grande con precio + URL trackeada).
          3. **Gratis / Tiempo libre / Reserva directa** — sin enlace.

        Klook quedó deshabilitado a petición del cliente; el código sigue
        intacto y se puede reactivar cambiando el flag `_USE_KLOOK_FALLBACK`.
        """
        from services import viator_service

        try:
            from services.tiqets_service import search_products as tiqets_search
            tiqets_products = await tiqets_search(destination, limit=50)
        except Exception as e:  # noqa: BLE001
            print(f"⚠️ Tiqets enrichment skipped: {e}")
            tiqets_products = []

        try:
            viator_products = await viator_service.search_products(destination, limit=40)
        except Exception as e:  # noqa: BLE001
            print(f"⚠️ Viator enrichment skipped: {e}")
            viator_products = []

        tiqets_by_id = {str(p.get("id")): p for p in (tiqets_products or [])}

        def norm(s):
            return " ".join((s or "").lower().split())

        tiqets_by_title = {norm(p.get("title")): p for p in (tiqets_products or [])}
        viator_by_code = {str(p.get("productCode")): p for p in (viator_products or [])}
        viator_by_title = {norm(p.get("title")): p for p in (viator_products or [])}

        viator_enabled = bool(viator_products)

        # Pool de slots "Tiempo libre" GenZ (último recurso).
        free_time_titles = [
            "Chill mode por el centro",
            "Vagueo del bueno por el barrio",
            "Tu rato pa ti",
            "Modo turista 0 estrés",
            "Café & vibras en una terraza random",
            "Plan flexible: lo que te apetezca",
            "Reset rápido: paseo sin rumbo",
            "Mini break: tu rollo",
        ]
        free_time_descriptions = [
            "Sin presión: tira por donde te llame el ojo y descúbrelo a tu ritmo.",
            "Tiempo para tu plan, una siesta o callejear sin Google Maps.",
            "Hueco para improvisar: la mejor parte del viaje suele estar aquí.",
            "Bloque libre. Ideal para terraza, vermut o lo que te apetezca.",
        ]
        free_idx = 0

        def is_meal(title: str) -> bool:
            t = (title or "").lower()
            return any(
                kw in t for kw in (
                    "desayuno", "almuerzo", "comida", "cena", "brunch",
                    "tapas", "tapeo", "restaurante", "mesón", "meson",
                    "bar ", "café ", "cafe ", "vermut",
                )
            )

        tiqets_count = viator_count = libre_count = 0
        # Sets para no asignar el mismo producto dos veces.
        used_viator_codes: set = set()
        used_tiqets_ids: set = set()

        def pick_viator_for_title(title: str) -> Optional[Dict]:
            """Match estricto SOLO por título exacto normalizado.

            Eliminamos el fuzzy matching por palabras clave: producía
            matches engañosos del tipo "Paseo por Piazza Navona" → "Rome
            Private City Walking Tour Kids Free". Si Gemini no copia el
            título exacto Y el `viatorCode`, NO asignamos producto Viator.
            """
            if not viator_enabled or not title:
                return None
            t = norm(title)
            p = viator_by_title.get(t)
            if p and str(p.get("productCode")) not in used_viator_codes:
                return p
            return None

        for day in itinerary.get("days", []):
            for block_key in ("morning", "afternoon", "night"):
                block = day.get(block_key) or {}
                for activity in block.get("activities", []):
                    title = activity.get("title") or ""
                    provider_raw = (activity.get("provider") or "").lower()

                    # 🔒 SECURITY: descartar SIEMPRE la `bookingUrl` que
                    # ponga Gemini. El LLM aluciona URLs inventadas que
                    # parecen reales (p.ej. `/London/d737-ttd/p-464661P4`
                    # en vez del producto exacto `/tours/London/<slug>/d737-...`).
                    # Solo confiamos en URLs que vienen del catálogo real
                    # de Tiqets/Viator y se asignan más abajo.
                    activity.pop("bookingUrl", None)

                    # 1) Match Tiqets primero (por id explícito o por título).
                    tid = str(activity.get("tiqetsId") or "").strip()
                    product = tiqets_by_id.get(tid) if tid else None
                    if not product:
                        product = tiqets_by_title.get(norm(title))

                    if product:
                        pid = str(product.get("id"))
                        if pid in used_tiqets_ids:
                            # Ya usamos este Tiqets en otro día/bloque.
                            # Pasamos al siguiente fallback (Viator/libre)
                            # para no duplicar.
                            product = None
                        else:
                            url = product.get("product_url")
                            if url:
                                activity["bookingUrl"] = url
                            activity["provider"] = "Tiqets"
                            activity["tiqetsId"] = pid
                            used_tiqets_ids.add(pid)
                            real_price = product.get("price")
                            try:
                                if real_price is not None and (
                                    not activity.get("price")
                                    or abs(float(activity["price"]) - float(real_price))
                                    / max(1.0, float(real_price)) > 0.5
                                ):
                                    activity["price"] = float(real_price)
                            except Exception:  # noqa: BLE001
                                pass
                            tiqets_count += 1
                            continue

                    # Comida o gratis explícita ya marcada → dejar.
                    if is_meal(title) or "reserva directa" in provider_raw:
                        continue

                    try:
                        price_num = float(activity.get("price")) if activity.get("price") is not None else 0.0
                    except Exception:  # noqa: BLE001
                        price_num = 0.0

                    # 2) Match Viator (por productCode si Gemini lo metió, o por título).
                    vcode = str(activity.get("viatorCode") or "").strip()
                    vproduct = viator_by_code.get(vcode) if vcode else None
                    if not vproduct:
                        vproduct = pick_viator_for_title(title)

                    if vproduct:
                        url = vproduct.get("productUrl")
                        if url:
                            activity["bookingUrl"] = url
                        activity["provider"] = "Viator"
                        activity["viatorCode"] = str(vproduct.get("productCode"))
                        used_viator_codes.add(str(vproduct.get("productCode")))
                        # Precio: ajustamos si Gemini se inventó.
                        real_price = (
                            (vproduct.get("pricing") or {}).get("summary", {}).get("fromPrice")
                        )
                        try:
                            if real_price is not None and (
                                not activity.get("price")
                                or abs(float(activity["price"]) - float(real_price))
                                / max(1.0, float(real_price)) > 0.5
                            ):
                                activity["price"] = float(real_price)
                        except Exception:  # noqa: BLE001
                            pass
                        viator_count += 1
                        continue

                    # 3) Sin match con ningún afiliado.
                    if provider_raw in ("gratis", "tiempo libre") or price_num == 0:
                        # Gratis válida: dejar como está.
                        continue

                    # Actividad de pago sin afiliado → convertir a Tiempo libre.
                    activity["title"] = free_time_titles[free_idx % len(free_time_titles)]
                    activity["description"] = free_time_descriptions[
                        free_idx % len(free_time_descriptions)
                    ]
                    activity["price"] = 0
                    activity["provider"] = "Tiempo libre"
                    activity.pop("bookingUrl", None)
                    activity.pop("tiqetsId", None)
                    activity.pop("viatorCode", None)
                    free_idx += 1
                    libre_count += 1

        print(
            f"🔗 Enriched: Tiqets={tiqets_count} Viator={viator_count} TiempoLibre={libre_count}"
        )

    def _call_and_parse(self, headers: Dict, payload: Dict) -> Optional[Dict]:
        """
        Llama a Gemini con retry/fallback y parsea el JSON.
        Devuelve None si Gemini respondió 200 pero el JSON es inválido
        (para que el caller pueda reintentar con otra config).
        Propaga cualquier otra excepción (GEMINI_UNAVAILABLE, 4xx, etc.).
        """
        result = self._call_gemini_with_retry(headers, payload)
        text = result['candidates'][0]['content']['parts'][0]['text']

        clean_text = self._clean_json(text)
        try:
            return json.loads(clean_text)
        except json.JSONDecodeError as je:
            # Intento de rescate: reparar JSON truncado cerrando brackets
            repaired = self._repair_truncated_json(clean_text)
            if repaired is not None:
                try:
                    return json.loads(repaired)
                except json.JSONDecodeError:
                    pass
            print(f"⚠️  JSON inválido: {je} (len={len(clean_text)})")
            return None

    def _call_gemini_with_retry(
        self,
        headers: Dict,
        payload: Dict,
        max_retries_per_model: int = 2,
    ) -> Dict:
        """
        Llama a Gemini intentando múltiples modelos en cascada con backoff exponencial.
        - Por cada modelo, reintenta hasta `max_retries_per_model` veces en códigos transitorios (429/5xx).
        - Si el modelo agota sus reintentos, pasa al siguiente modelo del fallback.
        - Si todos fallan con transitorios, lanza 'GEMINI_UNAVAILABLE' para que la capa HTTP
          pueda mapearlo a un 503 con mensaje amable al usuario.
        """
        last_status = None
        last_error_text = ""

        for model in GEMINI_MODELS:
            url = f"{self.base_url_template.format(model=model)}?key={self.api_key}"

            for attempt in range(max_retries_per_model + 1):
                try:
                    response = requests.post(url, headers=headers, json=payload, timeout=90)
                except requests.exceptions.RequestException as req_err:
                    last_status = None
                    last_error_text = f"network_error: {req_err}"
                    print(f"⚠️  [{model}] intento {attempt + 1}: network error — {req_err}")
                    if attempt < max_retries_per_model:
                        sleep_s = (2 ** attempt) + random.uniform(0, 0.5)
                        time.sleep(sleep_s)
                        continue
                    break  # siguiente modelo

                if response.status_code == 200:
                    return response.json()

                last_status = response.status_code
                last_error_text = response.text[:300] if response.text else ""

                # 4xx no-transitorio (400, 401, 403, 404) -> no reintentar, no cambiar modelo
                if response.status_code not in RETRIABLE_STATUS_CODES:
                    raise Exception(
                        f"Gemini API error {response.status_code}: {last_error_text}"
                    )

                print(
                    f"⚠️  [{model}] intento {attempt + 1} devolvió {response.status_code} — reintentando"
                )

                if attempt < max_retries_per_model:
                    sleep_s = (2 ** attempt) + random.uniform(0, 0.5)
                    time.sleep(sleep_s)
                else:
                    print(f"↪️  [{model}] agotado. Probando siguiente modelo de fallback…")

        # Si llegamos aquí, todos los modelos fallaron con errores transitorios
        raise Exception(
            f"GEMINI_UNAVAILABLE: last_status={last_status} detail={last_error_text}"
        )
    
    def _generate_mock_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        total_days: int,
        has_flights: bool,
        arrival_time: Optional[str],
        departure_time: Optional[str],
        has_hotel: bool,
        hotel_name: Optional[str],
        hotel_category: str,
        needs_hotel_recommendation: bool,
        user_plan: str,
        preferences: Optional[Dict]
    ) -> Dict:
        """
        Genera itinerario MOCK para testing con nueva lógica
        """
        start = datetime.strptime(start_date, '%Y-%m-%d')
        days_list = []
        
        # Determinar nombre del hotel para recomendaciones (Plus puede tener categorías)
        if needs_hotel_recommendation:
            hotel_categories_map = {
                'standard': 'Hotel Centro Histórico',
                'boutique': 'Boutique Hotel Art Decó',
                'luxury': 'Grand Luxury Palace 5★',
                'hostel': 'Hostal Encanto Local',
                'apartment': 'Apartamento Moderno Céntrico'
            }
            recommended_hotel_name = hotel_categories_map.get(hotel_category, 'Hotel Centro Histórico')
        else:
            recommended_hotel_name = None
        
        # Extraer pace para Plus
        pace = preferences.get('pace', 'balanced') if preferences and user_plan == 'plus' else 'balanced'
        
        print(f"📝 Mock Itinerary Config:")
        print(f"   - Plan: {user_plan.upper()}")
        print(f"   - Hotel Category: {hotel_category}")
        if preferences:
            print(f"   - Preferences: {preferences}")
        print(f"   - Pace: {pace}\n")
        
        for day_num in range(total_days):
            current_date = (start + timedelta(days=day_num)).strftime('%Y-%m-%d')
            
            # Detectar en qué momento del día comienza (si es día 1 con vuelos)
            start_moment = "morning"  # Por defecto mañana
            
            # Inicializar listas vacías por defecto
            morning_activities = []
            afternoon_activities = []
            night_activities = []
            
            if day_num == 0 and has_flights and arrival_time:
                hour = int(arrival_time.split(':')[0])
                if 12 <= hour < 21:
                    start_moment = "afternoon"  # TARDE
                elif 21 <= hour or hour < 6:
                    start_moment = "night"  # NOCHE
                else:
                    start_moment = "morning"  # MAÑANA
            
            # LÓGICA: Día 1 con vuelos
            if day_num == 0 and has_flights and arrival_time:
                # El día comienza después de la llegada + traslado
                morning_activities = [
                    {
                        "time": arrival_time,
                        "title": f"Llegada a {destination}",
                        "description": "Transfer del aeropuerto al alojamiento",
                        "location": "Aeropuerto internacional",
                        "duration": "1.5h",
                        "price": None,  # Vuelos sin precio
                        "activityId": f"flight_arrival",
                        "provider": "Booking.com"
                    },
                    {
                        "time": self._add_time(arrival_time, 2),
                        "title": "Primer recorrido por el centro",
                        "description": f"Paseo introductorio por {destination}",
                        "location": "Centro histórico",
                        "duration": "2h",
                        "price": 35.00,
                        "activityId": f"act_1_walk",
                        "provider": "GetYourGuide"
                    }
                ]
            # LÓGICA: Día 1 sin vuelos (comienza 09:00-11:00)
            elif day_num == 0 and not has_flights:
                morning_activities = [
                    {
                        "time": "09:30",
                        "title": "Desayuno típico local",
                        "description": f"Café tradicional en {destination}",
                        "location": "Café del Centro",
                        "duration": "1h",
                        "price": 15.00,
                        "activityId": f"act_1_breakfast",
                        "provider": "GetYourGuide"
                    },
                    {
                        "time": "11:00",
                        "title": f"Tour cultural por {destination}",
                        "description": "Visita guiada a monumentos principales",
                        "location": "Plaza Mayor",
                        "duration": "2.5h",
                        "price": 45.00,
                        "activityId": f"act_1_tour",
                        "provider": "Civitatis"
                    }
                ]
                afternoon_activities = [
                    {
                        "time": "14:00",
                        "title": "Almuerzo",
                        "description": f"Comida local en {destination}",
                        "location": "Restaurante La Plaza",
                        "duration": "1.5h",
                        "price": 28.00,
                        "activityId": f"act_1_lunch",
                        "provider": "GetYourGuide"
                    }
                ]
                night_activities = [
                    {
                        "time": "20:00",
                        "title": "Cena local",
                        "description": f"Restaurante típico de {destination}",
                        "location": "Zona gastronómica",
                        "duration": "2h",
                        "price": 35.00,
                        "activityId": f"act_1_dinner",
                        "provider": "GetYourGuide"
                    }
                ]
            else:
                # Días intermedios - usar actividades personalizadas si es Plus
                if user_plan == 'plus' and preferences:
                    personalized = self._get_personalized_activities(destination, preferences, pace, day_num)
                    morning_activities = personalized
                else:
                    # Basic: actividades estándar
                    morning_activities = [
                        {
                            "time": "09:00",
                            "title": "Desayuno típico local",
                            "description": f"Café tradicional en {destination}",
                            "location": "Café del Centro",
                            "duration": "1h",
                            "price": 15.00,
                            "activityId": f"act_{day_num+1}_1",
                            "provider": "GetYourGuide"
                        }
                    ]
                afternoon_activities = []
                night_activities = []
            
            # LÓGICA: Último día con vuelos (termina 3h antes de salida)
            if day_num == total_days - 1 and has_flights and departure_time:
                cutoff_time = self._subtract_time(departure_time, 3)
                night_activities = [
                    {
                        "time": "18:00",
                        "title": "Cena de despedida",
                        "description": f"Última cena en {destination}",
                        "location": "Restaurante panorámico",
                        "duration": "2h",
                        "price": 42.00,
                        "activityId": "act_farewell_dinner",
                        "provider": "Civitatis"
                    },
                    {
                        "time": cutoff_time,
                        "title": f"Salida hacia el aeropuerto",
                        "description": "Transfer al aeropuerto",
                        "location": "Aeropuerto internacional",
                        "duration": "1h",
                        "price": None,  # Vuelos sin precio
                        "activityId": "flight_departure",
                        "provider": "Booking.com"
                    }
                ]
            else:
                # Noches normales
                night_activities = [
                    {
                        "time": "20:00",
                        "title": "Cena local",
                        "description": f"Restaurante típico de {destination}",
                        "location": "Zona gastronómica",
                        "duration": "2h",
                        "price": 35.00,
                        "activityId": f"act_{day_num+1}_dinner",
                        "provider": "GetYourGuide"
                    },
                    {
                        "time": "22:30",
                        "title": "Vida nocturna",
                        "description": "Bar o zona de ambiente local",
                        "location": "Barrio de ocio",
                        "duration": "2h",
                        "price": 20.00,
                        "activityId": f"act_{day_num+1}_nightlife",
                        "provider": "Viator"
                    }
                ]
            
            # CAMBIO 5: Si NO tiene hotel, agregar recomendación al final de cada NOCHE
            if needs_hotel_recommendation and recommended_hotel_name:
                hotel_activity = {
                    "time": "23:30",
                    "title": recommended_hotel_name,
                    "description": f"Alojamiento recomendado en {destination}. Ubicación estratégica para tu itinerario.",
                    "location": "Centro de la ciudad",
                    "duration": "8h",
                    "price": None,  # Hoteles sin precio
                    "activityId": f"hotel_day_{day_num+1}",
                    "provider": "Booking.com"
                }
                night_activities.append(hotel_activity)
            
            days_list.append({
                "day": day_num + 1,
                "date": current_date,
                "morning": {
                    "activities": morning_activities
                },
                "afternoon": {
                    "activities": afternoon_activities
                },
                "night": {
                    "activities": night_activities
                }
            })
        
        # LÓGICA: Recomendación de hotel
        hotel_rec = None
        if needs_hotel_recommendation:
            if total_days > 20:
                hotel_rec = f"Para un viaje de {total_days} días a {destination}, recomendamos 2-3 hoteles estratégicos:\n1. Hotel Centro Histórico (Días 1-7): Ideal para explorar el casco antiguo.\n2. Hotel Zona Moderna (Días 8-15): Perfecto para la zona comercial y de negocios.\n3. Hotel Costero (Días 16+): Excelente para disfrutar de playas y vistas al mar."
            else:
                hotel_rec = f"Recomendamos alojarse en el Centro Histórico de {destination} para estar cerca de las principales atracciones y minimizar desplazamientos. La zona tiene excelente conectividad con transporte público."
        
        print(f"✅ MOCK ITINERARY: {destination}, {total_days} días")
        if has_flights:
            print(f"   Con vuelos: {arrival_time} - {departure_time}")
        if has_hotel and hotel_name:
            print(f"   Hotel: {hotel_name}")
        elif needs_hotel_recommendation:
            print(f"   Recomendación de hotel incluida")
        print()
        
        return {
            "destination": destination,
            "totalDays": total_days,
            "hotelRecommendation": hotel_rec,
            "days": days_list
        }
    
    async def _build_tiqets_catalog_block(self, destination: str) -> str:
        """Construye el bloque del prompt con productos REALES de Tiqets."""
        try:
            from services.tiqets_service import list_for_prompt
            items = await list_for_prompt(destination, limit=15)
        except Exception as e:  # noqa: BLE001
            print(f"⚠️ Tiqets catalog fetch failed: {e}")
            items = []

        lines = [
            "═══════════════════════════════════════════════",
            "POLÍTICA DE ACTIVIDADES DE PAGO — OBLIGATORIA",
            "═══════════════════════════════════════════════",
            (
                "Proveedores afiliados activos: **Tiqets** (preferido) y **Viator** (fallback con gran catálogo). "
                "NO uses Civitatis, GetYourGuide ni Klook. Reglas:"
            ),
            "",
            "0. PROPORCIÓN OBJETIVO POR DÍA (importante):",
            "   - Al menos el 60% de las actividades de cada día deben ser de PAGO con afiliado (Tiqets o Viator). Las gratis y de tiempo libre son **relleno** cuando no encaja una de pago.",
            "   - En un día típico de 4 actividades: 2-3 Tiqets/Viator + 1 comida + 0-1 gratis. NO conviertas el itinerario en un paseo gratuito.",
            "",
            "1. ACTIVIDADES DE PAGO (museos, monumentos, tours, parques temáticos, atracciones, miradores con entrada, espectáculos, experiencias guiadas):",
            "   - Si encaja con algo del CATÁLOGO TIQETS de abajo → `provider: \"Tiqets\"` + `tiqetsId`.",
            "   - Si encaja con algo del CATÁLOGO VIATOR de abajo → `provider: \"Viator\"` + `viatorCode` (productCode exacto).",
            "   - Para Viator, copia el `title` lo más fiel posible al catálogo (ayuda al matching automático posterior).",
            "",
            "2. EXPERIENCIAS GRATIS:",
            "   - Solo como relleno cuando NO encaje ninguna de pago. Máximo 1 por día.",
            "   - `price: 0` y `provider: \"Gratis\"`. Sin `bookingUrl`.",
            "",
            "3. TIEMPO LIBRE GENZ:",
            "   - Solo como último recurso. `price: 0`, `provider: \"Tiempo libre\"`.",
            "",
            "4. COMIDAS Y CENAS:",
            "   - Restaurantes/bares reales con precio realista por persona.",
            "   - `provider: \"Reserva directa\"`. Sin `bookingUrl`.",
            "",
            "5. PROHIBIDO:",
            "   - Civitatis, GetYourGuide, Klook, Viator fuera del catálogo proporcionado y operadores inventados.",
            "",
        ]

        if items:
            lines += [
                "═══════════════════════════════════════════════",
                f"CATÁLOGO TIQETS DISPONIBLE EN {destination.upper()}",
                "═══════════════════════════════════════════════",
                (
                    "⚠️  USO OBLIGATORIO: incluye AL MENOS 1 actividad de este "
                    "catálogo en cada día del itinerario (preferentemente 2)."
                ),
                "",
                "Para usar un producto del catálogo en una actividad:",
                (
                    "  - Copia el `title` exacto en el campo `title`."
                ),
                (
                    "  - Usa el precio (`price_eur`) tal cual, en el campo `price`."
                ),
                (
                    "  - Pon `provider: \"Tiqets\"` y `tiqetsId: \"<id>\"`."
                ),
                (
                    "  - Mete `address` en `location`."
                ),
                "",
                f"Catálogo ({len(items)} productos disponibles):",
            ]
            for it in items:
                rating = it.get("rating")
                rating_str = f" · {rating:.1f}⭐ ({it.get('rating_count')})" if rating else ""
                lines.append(
                    f"- id={it['id']} | \"{it['title']}\" | {it.get('price_eur')}€"
                    f"{rating_str} | venue: {it.get('venue') or '—'} | {it.get('address') or '—'}"
                )
        else:
            lines += [
                "═══════════════════════════════════════════════",
                f"AVISO: NO HAY CATÁLOGO TIQETS PARA {destination.upper()}",
                "═══════════════════════════════════════════════",
                (
                    "Tiqets NO tiene productos en esta ciudad ahora mismo. "
                    "TODAS las actividades del itinerario deben ser:"
                ),
                "  - Experiencias gratis (punto 2 de arriba), o",
                "  - Tiempo libre GenZ (punto 3), o",
                "  - Comidas/cenas reales (punto 4).",
                "NUNCA inventes actividades de pago.",
            ]

        return "\n".join(lines)

    async def _build_viator_catalog_block(self, destination: str) -> str:
        """Catálogo Viator a inyectar en el prompt (similar a Tiqets)."""
        try:
            from services.viator_service import list_for_prompt
            items = await list_for_prompt(destination, limit=15)
        except Exception as e:  # noqa: BLE001
            print(f"⚠️ Viator catalog fetch failed: {e}")
            items = []

        if not items:
            return ""

        lines = [
            "═══════════════════════════════════════════════",
            f"CATÁLOGO VIATOR DISPONIBLE EN {destination.upper()}",
            "═══════════════════════════════════════════════",
            "Productos REALES de Viator (afiliado). REGLAS ESTRICTAS:",
            "  - El `title` debe ser una COPIA EXACTA, palabra por palabra, del título del catálogo.",
            "  - El `viatorCode` DEBE ser el `code=` exacto del producto que copiaste.",
            "  - Si modificas el título (lo traduces, lo recortas, lo embelleces), el enlace NO funcionará y la actividad se perderá.",
            "  - SOLO usa `provider: \"Viator\"` cuando vayas a copiar literalmente título Y code.",
            "  - Pon el precio del catálogo (`price_eur`).",
            "",
            f"Catálogo ({len(items)} productos):",
        ]
        for it in items:
            t = (it.get("title") or "")[:80]
            rating = it.get("rating")
            rating_str = f" ⭐{rating:.1f}" if rating else ""
            lines.append(
                f"- code={it['code']}{rating_str} | \"{t}\" | {it.get('price_eur')}€"
            )
        return "\n".join(lines)

    def _build_context(
        self,
        total_days: int,
        has_flights: bool,
        arrival_time: Optional[str],
        departure_time: Optional[str],
        has_hotel: bool,
        hotel_name: Optional[str],
        hotel_category: Optional[str],
        needs_hotel_recommendation: bool,
        user_plan: str,
        preferences: Optional[Dict]
    ) -> str:
        """
        Construye contexto inteligente para el prompt según las nuevas reglas
        """
        parts = []

        # REGLA 1: Sincronización Temporal con LLEGADA/SALIDA
        # `has_flights=True` se entiende como "el usuario ya conoce su hora
        # de llegada y/o salida del destino". Las activities ANTES de la
        # llegada o DESPUÉS de la salida están terminantemente prohibidas.
        if has_flights and arrival_time:
            # Buffer de traslado terminal/estación → centro: 90 min (90 min
            # cubre vuelo medio o tren). En aeropuertos grandes súbelo
            # mentalmente: el prompt lo deja claro.
            first_activity_time = self._add_time(arrival_time, 2)
            parts.append("LLEGADA AL DESTINO (DÍA 1) — RESTRICCIÓN ESTRICTA:")
            parts.append(f"- El usuario llega al destino a las {arrival_time}.")
            parts.append(
                f"- PROHIBIDO programar ninguna actividad antes de las {first_activity_time}. "
                f"El bloque anterior queda VACÍO o solo con el traslado al alojamiento."
            )
            parts.append(
                "- Reserva ~90 min de margen tras la llegada para recoger equipaje, "
                "traslado del aeropuerto/estación al centro y check-in en el hotel."
            )
            parts.append(
                f"- La primera actividad turística debe empezar a las {first_activity_time} o más tarde."
            )
            if departure_time:
                last_activity_end = self._subtract_time(departure_time, 3)
                parts.append("")
                parts.append("SALIDA DEL DESTINO (ÚLTIMO DÍA) — RESTRICCIÓN ESTRICTA:")
                parts.append(f"- El usuario sale del destino a las {departure_time}.")
                parts.append(
                    f"- PROHIBIDO programar actividades que terminen después de las {last_activity_end}. "
                    f"Reserva 3h para check-out, traslado y trámites de salida."
                )
        elif has_flights and departure_time:
            # Solo conocemos la salida.
            last_activity_end = self._subtract_time(departure_time, 3)
            parts.append("SALIDA DEL DESTINO (ÚLTIMO DÍA) — RESTRICCIÓN ESTRICTA:")
            parts.append(f"- El usuario sale del destino a las {departure_time}.")
            parts.append(
                f"- PROHIBIDO programar actividades que terminen después de las {last_activity_end} "
                "(3h de margen para check-out + traslado)."
            )
            parts.append("- El Día 1 sin restricción de llegada: empieza entre 09:00 y 11:00.")
        else:
            # Sin info de transporte: día 1 empieza por la mañana, día final
            # se trata como día completo.
            parts.append("SIN INFO DE TRANSPORTE:")
            parts.append("- El Día 1 puede empezar entre las 09:00 y 11:00 AM.")
            parts.append("- El último día se trata como un día completo (hasta las 20:00-21:00).")

        # REGLA 2: Radio de Acción (Hoteles)
        if has_hotel and hotel_name:
            parts.append("")
            parts.append("HOTEL RESERVADO:")
            parts.append(f"- Nombre: {hotel_name}")
            if hotel_category:
                parts.append(f"- Categoría: {hotel_category}")
            parts.append(
                "- PRIORIZA actividades en un radio caminable / 15 min en transporte público "
                "desde este hotel. Minimiza desplazamientos largos."
            )
        elif needs_hotel_recommendation:
            parts.append("")
            parts.append("RECOMENDACIÓN DE HOTEL SOLICITADA:")
            if total_days > 20:
                parts.append(
                    f"- El viaje es de {total_days} días: recomienda 2-3 hoteles "
                    "estratégicos repartidos por zonas."
                )
                parts.append("- Justifica brevemente la ubicación de cada hotel.")
            else:
                parts.append("- Recomienda UN ÚNICO hotel estratégico para todo el viaje.")
                parts.append(
                    "- Justifica por qué esa zona es la más céntrica/conveniente "
                    "(transporte, seguridad, ambiente)."
                )
            parts.append("- Pon la recomendación en el campo 'hotelRecommendation' del JSON.")

        # REGLA 3: Personalización según plan
        if user_plan == "plus" and preferences:
            parts.append("")
            parts.append("PREFERENCIAS DEL USUARIO (PLAN PLUS):")
            activities = preferences.get("activities", {}) if isinstance(preferences, dict) else {}
            pace = preferences.get("pace") if isinstance(preferences, dict) else None
            active_themes = [k for k, v in activities.items() if v] if isinstance(activities, dict) else []
            if active_themes:
                parts.append(f"- Temáticas activas: {', '.join(active_themes)}. ENFOCA cada día en ellas.")
            if pace:
                pace_desc = {
                    "intense": "ritmo intenso (3-5 actividades por día, días largos hasta tarde)",
                    "balanced": "ritmo equilibrado (2-3 actividades por día, tiempo libre razonable)",
                    "relaxed": "ritmo relajado (1-2 actividades por día, mucho tiempo libre)",
                }.get(pace, pace)
                parts.append(f"- Ritmo: {pace_desc}.")
            parts.append("- Adapta el itinerario al máximo a estas preferencias.")

        return "\n".join(parts) if parts else ""
    
    def _derive_activity_price_range(
        self,
        budget: Optional[str],
        budget_amount: Optional[float],
        user_plan: str,
        total_days: int,
    ):
        """
        Calcula el rango de precio por actividad (min, max, label) que se usará
        en el prompt de Gemini para acotar los precios de las actividades.

        Reglas:
        - Si el usuario eligió un modo de presupuesto explícito → usar rangos por modo.
        - Si no eligió nada (Basic por defecto) → 10-30€ por actividad.
        - Si hay budget_amount, aplicamos un cap suave por actividad
          (asumiendo ~3 actividades pagadas por día con margen).
        """
        mode_ranges = {
            "saver":    (10.0, 25.0, "modo ahorro"),
            "balanced": (25.0, 60.0, "equilibrado"),
            "luxury":   (60.0, 200.0, "modo lujo, sin techo razonable"),
        }

        if budget and budget in mode_ranges:
            pmin, pmax, label = mode_ranges[budget]
        else:
            # Default Basic / sin selección
            pmin, pmax, label = 10.0, 30.0, "rango estándar"

        # Cap suave a partir del budget total: ~3 actividades pagadas por día,
        # dejando un 30% de margen para imprevistos / comida fuera del prompt.
        if budget_amount and budget_amount > 0 and total_days > 0:
            soft_cap_per_activity = (budget_amount * 0.7) / max(1, total_days * 3)
            if soft_cap_per_activity < pmax:
                pmax = max(pmin + 5.0, soft_cap_per_activity)

        return pmin, pmax, label

    def _derive_hotel_price_range(self, budget):
        """
        Rango de precio orientativo del hotel por persona/noche según el modo
        de presupuesto. Si no se eligió nada → "Equilibrado".

        - saver:    10-80€
        - balanced: 70-200€  (default)
        - luxury:   200€+ (sin techo)
        """
        ranges = {
            "saver":    (10.0, 80.0,  "modo ahorro"),
            "balanced": (70.0, 200.0, "equilibrado"),
            "luxury":   (200.0, None, "modo lujo, sin techo"),
        }
        return ranges.get(budget) or ranges["balanced"]

    def _clean_json(self, text: str) -> str:
        """Limpia markdown y extrae JSON válido"""
        if '```json' in text:
            start = text.find('```json') + 7
            end = text.find('```', start)
            text = text[start:end]
        elif '```' in text:
            start = text.find('```') + 3
            end = text.find('```', start)
            text = text[start:end]
        
        start_brace = text.find('{')
        end_brace = text.rfind('}') + 1
        
        if start_brace != -1 and end_brace > start_brace:
            return text[start_brace:end_brace]
        
        return text

    def _repair_truncated_json(self, text: str) -> Optional[str]:
        """
        Intenta reparar un JSON truncado por maxOutputTokens:
        - Recorta hasta el último ',' o '}' válido dentro de un array de days
        - Cierra brackets/braces pendientes contando los abiertos/cerrados
        - Ignora strings (comillas) y caracteres escapados al contar

        Devuelve el JSON reparado o None si no se pudo reparar.
        """
        if not text:
            return None

        # Truncar en el último caracter "seguro" (} o ]), no dentro de un string
        # Estrategia: recorrer el texto contando llaves/corchetes/comillas.
        # Si al final hay brackets abiertos, los cerramos.
        in_string = False
        escape = False
        stack = []  # lista de '{' y '['
        last_safe_pos = -1  # última posición donde el estado era "entre elementos"

        for i, ch in enumerate(text):
            if escape:
                escape = False
                continue
            if ch == '\\' and in_string:
                escape = True
                continue
            if ch == '"':
                in_string = not in_string
                continue
            if in_string:
                continue

            if ch == '{' or ch == '[':
                stack.append(ch)
            elif ch == '}':
                if stack and stack[-1] == '{':
                    stack.pop()
                    last_safe_pos = i
                else:
                    return None  # estructura rota
            elif ch == ']':
                if stack and stack[-1] == '[':
                    stack.pop()
                    last_safe_pos = i
                else:
                    return None
            elif ch == ',' and not stack:
                last_safe_pos = i

        if last_safe_pos < 0:
            return None

        # Recortamos al último carácter seguro y cerramos lo que falte
        truncated = text[: last_safe_pos + 1]

        # Recalcular el stack sobre el texto truncado para saber qué cerrar
        in_string = False
        escape = False
        stack = []
        for ch in truncated:
            if escape:
                escape = False
                continue
            if ch == '\\' and in_string:
                escape = True
                continue
            if ch == '"':
                in_string = not in_string
                continue
            if in_string:
                continue
            if ch == '{' or ch == '[':
                stack.append(ch)
            elif ch == '}' and stack and stack[-1] == '{':
                stack.pop()
            elif ch == ']' and stack and stack[-1] == '[':
                stack.pop()

        # Si el último carácter es ',' quitarlo (coma colgante no es válida en JSON)
        truncated = truncated.rstrip()
        if truncated.endswith(','):
            truncated = truncated[:-1]

        # Cerrar los brackets pendientes en orden inverso
        closers = {'{': '}', '[': ']'}
        while stack:
            truncated += closers[stack.pop()]

        print(f"🔧 JSON reparado: añadidos {truncated.count('}') - text.count('}')} cierres")
        return truncated
    
    def _add_time(self, time_str: str, hours: int) -> str:
        """Suma horas a formato HH:MM"""
        time_obj = datetime.strptime(time_str, '%H:%M')
        new_time = time_obj + timedelta(hours=hours)
        return new_time.strftime('%H:%M')
    
    def _subtract_time(self, time_str: str, hours: int) -> str:
        """Resta horas a formato HH:MM"""
        time_obj = datetime.strptime(time_str, '%H:%M')
        new_time = time_obj - timedelta(hours=hours)
        return new_time.strftime('%H:%M')

    def _get_personalized_activities(self, destination: str, preferences: Optional[Dict], pace: str, day_num: int) -> List[Dict]:
        """
        Genera actividades personalizadas según preferencias PLUS
        """
        activities = []
        
        if not preferences:
            # Basic: actividades estándar equilibradas
            return [
                {
                    "time": "10:00",
                    "title": f"Tour panorámico por {destination}",
                    "description": "Recorrido por los principales puntos de interés",
                    "location": "Centro histórico",
                    "duration": "3h",
                    "price": 45.00,
                    "activityId": f"act_{day_num+1}_tour",
                    "provider": "Civitatis"
                }
            ]
        
        # Plus: actividades personalizadas
        activity_prefs = preferences.get('activities', {})
        
        if activity_prefs.get('adventure'):
            activities.append({
                "time": "09:00",
                "title": f"Aventura: Kayak en {destination}",
                "description": "Experiencia de kayak en aguas cristalinas con guía experto",
                "location": "Costa/Río principal",
                "duration": "4h",
                "price": 65.00,
                "activityId": f"act_{day_num+1}_kayak",
                "provider": "GetYourGuide"
            })
        
        if activity_prefs.get('culture'):
            activities.append({
                "time": "11:00",
                "title": f"Museo de Arte de {destination}",
                "description": "Visita guiada a la colección permanente y exposiciones temporales",
                "location": "Distrito cultural",
                "duration": "2.5h",
                "price": 25.00,
                "activityId": f"act_{day_num+1}_museum",
                "provider": "Civitatis"
            })
        
        if activity_prefs.get('gastronomy'):
            activities.append({
                "time": "14:00",
                "title": f"Cata de vinos y tapas de {destination}",
                "description": "Experiencia culinaria con maridaje de vinos locales",
                "location": "Barrio gastronómico",
                "duration": "3h",
                "price": 85.00,
                "activityId": f"act_{day_num+1}_wine_tasting",
                "provider": "Viator"
            })
        
        if activity_prefs.get('relax'):
            activities.append({
                "time": "16:00",
                "title": f"Spa & Wellness en {destination}",
                "description": "Sesión de masaje y acceso a spa con circuito termal",
                "location": "Centro de bienestar",
                "duration": "2h",
                "price": 70.00,
                "activityId": f"act_{day_num+1}_spa",
                "provider": "GetYourGuide"
            })
        
        # Si no hay preferencias marcadas, usar actividades equilibradas
        if not activities:
            activities.append({
                "time": "10:00",
                "title": f"Tour personalizado por {destination}",
                "description": "Recorrido adaptado a tus intereses",
                "location": "Centro histórico",
                "duration": "3h",
                "price": 50.00,
                "activityId": f"act_{day_num+1}_custom_tour",
                "provider": "Civitatis"
            })
        
        # Ajustar según ritmo
        if pace == 'relaxed':
            # Espaciar más las actividades
            for i, act in enumerate(activities):
                if i > 0:
                    prev_time = activities[i-1]['time']
                    prev_duration = int(activities[i-1]['duration'].replace('h', '').split('.')[0])
                    new_time = self._add_time(prev_time, prev_duration + 2)  # +2h de descanso
                    activities[i]['time'] = new_time
        elif pace == 'intense':
            # Actividades más seguidas
            for i, act in enumerate(activities):
                if i > 0:
                    prev_time = activities[i-1]['time']
                    prev_duration = int(activities[i-1]['duration'].replace('h', '').split('.')[0])
                    new_time = self._add_time(prev_time, prev_duration + 1)  # +1h
                    activities[i]['time'] = new_time
        
        return activities[:2]  # Máximo 2 actividades por momento del día
