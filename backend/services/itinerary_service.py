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
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        total_days = (end - start).days
        
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
        
        # Prompt profesional optimizado
        prompt = f"""Eres un experto en planificación de itinerarios de alta gama, especializado en crear experiencias personalizadas.

DESTINO: {destination}
PERIODO: {start_date} a {end_date} ({total_days} días)

CONTEXTO DEL VIAJE:
{context}

{budget_block}
REGLAS CRÍTICAS DE FORMATO JSON:
1. Cada día debe tener: MAÑANA, TARDE y NOCHE
2. Cada actividad debe incluir: time, title, description, location, duration
3. **IMPORTANTE - PRECIOS**: 
   - Actividades turísticas: incluir campo "price" con valor numérico (ej: 45.50)
   - Vuelos y Hoteles: el campo "price" debe ser null o no incluirse
4. Incluir campo "provider" en actividades (Civitatis, Viator, GetYourGuide)
5. Nombres REALES de lugares y actividades específicas

ESTRUCTURA JSON REQUERIDA:

{{
  "destination": "{destination}",
  "totalDays": {total_days},
  "hotelRecommendation": "Texto de recomendación..." o null,
  "days": [
    {{
      "day": 1,
      "date": "{start_date}",
      "morning": {{
        "activities": [
          {{
            "time": "09:00",
            "title": "Nombre real de la actividad",
            "description": "Descripción detallada",
            "location": "Dirección o zona específica",
            "duration": "2h",
            "price": 35.00,
            "activityId": "act_1_morning_1",
            "provider": "Civitatis"
          }}
        ]
      }},
      "afternoon": {{
        "activities": [...]
      }},
      "night": {{
        "activities": [...]
      }}
    }}
  ]
}}

IMPORTANTE: Devuelve SOLO el JSON válido, sin texto adicional antes o después.

JSON:"""
        
        # Escalar maxOutputTokens según días: viajes largos generan JSON mucho más grande.
        # Gemini 3 Flash soporta hasta ~65k tokens de output. Reservamos margen amplio.
        # Heurística: 2500 base + 2500 por día. 2d->7500, 7d->20000, 14d->37500, tope 48000.
        max_tokens = min(48000, 2500 + total_days * 2500)

        base_generation_config = {
            "temperature": 0.7,
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

            if itinerary is None:
                raise Exception(
                    "Gemini devolvió JSON inválido tras 2 intentos "
                    f"(days={total_days}, max_tokens hasta {retry_max_tokens if 'retry_max_tokens' in locals() else max_tokens})"
                )

            print(f"✅ ITINERARIO GENERADO: {destination}, {total_days} días\n")
            return itinerary

        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            raise Exception(f"Error generando itinerario: {str(e)}")

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
                    response = requests.post(url, headers=headers, json=payload, timeout=50)
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
        
        # REGLA 1: Sincronización Temporal con Vuelos
        if has_flights and arrival_time:
            parts.append(f"VUELOS RESERVADOS:")
            parts.append(f"- Hora de llegada (Día 1): {arrival_time}")
            parts.append(f"- El Día 1 debe comenzar DESPUÉS de la llegada. Incluir traslado del aeropuerto (1-1.5h).")
            parts.append(f"- Primera actividad turística: aproximadamente {self._add_time(arrival_time, 2)}")
            
            if departure_time:
                parts.append(f"- Hora de salida (Día {total_days}): {departure_time}")
                parts.append(f"- El último día debe finalizar 3 HORAS ANTES de la salida ({self._subtract_time(departure_time, 3)}).")
                parts.append(f"- Incluir tiempo para traslado al aeropuerto.")
        else:
            # Si NO hay vuelos, el itinerario comienza por defecto 09:00-11:00
            parts.append(f"SIN VUELOS RESERVADOS:")
            parts.append(f"- El Día 1 debe comenzar entre las 09:00 y 11:00 AM.")
            parts.append(f"- El último día puede extenderse hasta las 20:00-21:00.")
        
        # REGLA 2: Radio de Acción (Hoteles)
        if has_hotel and hotel_name:
            parts.append(f"\nHOTEL RESERVADO:")
            parts.append(f"- Nombre: {hotel_name}")
            if hotel_category:
                parts.append(f"- Categoría: {hotel_category}")
            parts.append(f"- PRIORIZAR actividades en un radio geográfico cercano a este hotel.")
            parts.append(f"- Optimizar rutas para minimizar desplazamientos.")
        elif needs_hotel_recommendation:
            parts.append(f"\nRECOMENDACIÓN DE HOTEL SOLICITADA:")
            if total_days > 20:
                parts.append(f"- Recomendar 2-3 hoteles estratégicos (el viaje es de {total_days} días).")
                parts.append(f"- Justificar brevemente la ubicación de cada hotel.")
            else:
                parts.append(f"- Recomendar UN ÚNICO hotel estratégico para todo el viaje.")
                parts.append(f"- Justificar brevemente por qué esa ubicación es la más estratégica.")
            parts.append(f"- Incluir esta recomendación en el campo 'hotelRecommendation' del JSON.")

        # REGLA 3: Personalización según plan
        if user_plan == "plus" and preferences:
            parts.append(f"\nPREFERENCIAS DEL USUARIO (PLAN PLUS):")
            for key, value in preferences.items():
                if value:
                    parts.append(f"- {key}: {value}")
            parts.append(f"- Adaptar el itinerario al máximo a estas preferencias.")
        
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
