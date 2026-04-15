import requests
import os
import json
from datetime import datetime
from typing import Dict, List, Any, Optional

class GeminiTravelService:
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY')
        if not self.api_key:
            raise Exception("GEMINI_API_KEY no encontrada en variables de entorno")
        # Usar gemini-flash-latest que apunta a la mejor versión de Flash disponible
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
        
    async def generate_professional_itinerary(
        self,
        departure_city: str,
        destination: str,
        start_date: str,
        end_date: str,
        travel_details: Optional[Dict] = None
    ) -> Dict:
        """
        Genera un itinerario profesional sin precios
        Solo planificación de actividades por Mañana/Tarde/Noche
        """
        # Verificar si está en modo MOCK
        use_mock = os.environ.get('USE_MOCK_DATA', 'false').lower() == 'true'
        
        if use_mock:
            print(f"\n{'='*60}")
            print(f"🎭 MODO MOCK - Generando itinerario profesional")
            print(f"   Destino: {destination}")
            print(f"   Fechas: {start_date} a {end_date}")
            if travel_details:
                print(f"   Con detalles: {travel_details}")
            print(f"{'='*60}\n")
            return self._generate_mock_itinerary(departure_city, destination, start_date, end_date, travel_details)
        
        # Calcular días
        from datetime import datetime
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        days = (end - start).days
        
        # Construir contexto inteligente
        context = self._build_intelligent_context(travel_details, days)
        
        # Crear prompt profesional
        prompt = f"""Eres un experto en planificación de viajes y gestión de itinerarios profesionales.

DESTINO: {destination}
ORIGEN: {departure_city}  
FECHAS: del {start_date} al {end_date} ({days} días)

{context}

ESTRUCTURA REQUERIDA:
Genera un itinerario profesional dividido por días, y cada día dividido en MAÑANA, TARDE y NOCHE.
Incluye nombres REALES de lugares, restaurantes, monumentos y actividades específicas.

IMPORTANTE:
- NO incluyas precios
- NO menciones "reservar" o "comprar"
- Solo actividades, lugares y experiencias
- Sé específico con nombres reales

Devuelve SOLO JSON con esta estructura EXACTA:

{{
  "destination": "{destination}",
  "totalDays": {days},
  "hotelRecommendation": "Zona Centro histórico cerca de..." o null,
  "days": [
    {{
      "day": 1,
      "date": "{start_date}",
      "morning": {{
        "startTime": "09:00",
        "activities": [
          {{
            "time": "09:00",
            "title": "Desayuno en Café Real",
            "description": "Café tradicional en Plaza Mayor",
            "location": "Plaza Mayor 5",
            "duration": "1h"
          }}
        ]
      }},
      "afternoon": {{
        "startTime": "14:00",
        "activities": [...]
      }},
      "night": {{
        "startTime": "20:00",
        "activities": [...]
      }}
    }}
  ]
}}

JSON:"""
        
        try:
            # Llamar a Gemini
            headers = {'Content-Type': 'application/json'}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 4096
                }
            }
            
            url = f"{self.base_url}?key={self.api_key}"
            response = requests.post(url, headers=headers, json=payload, timeout=45)
            
            if response.status_code != 200:
                raise Exception(f"Error {response.status_code} de Gemini")
            
            response_data = response.json()
            response_text = response_data['candidates'][0]['content']['parts'][0]['text'].strip()
            
            # Limpiar y parsear JSON
            response_text = self._clean_json_response(response_text)
            itinerary = json.loads(response_text)
            
            print(f"✅ ITINERARIO GENERADO: {destination}, {days} días")
            return itinerary
            
        except Exception as e:
            print(f"❌ ERROR generando itinerario: {str(e)}")
            raise Exception(f"Error en la generación del itinerario: {str(e)}")
    
    def _build_intelligent_context(self, travel_details: Optional[Dict], days: int) -> str:
        """
        Construye contexto inteligente según detalles del viaje
        """
        if not travel_details:
            return ""
        
        context_parts = []
        
        # Hora de llegada
        if travel_details.get('arrivalTime'):
            context_parts.append(f"- El día 1 comienza a partir de las {travel_details['arrivalTime']}, no antes. Ajusta las actividades de la mañana del día 1 según esta hora de llegada.")
        
        # Hora de salida
        if travel_details.get('departureTime'):
            context_parts.append(f"- El último día (día {days}) termina antes de las {travel_details['departureTime']}. Planifica actividades que permitan llegar al aeropuerto/estación a tiempo.")
        
        # Zona de hotel
        if travel_details.get('hotelZones'):
            zones = travel_details['hotelZones']
            context_parts.append(f"- El viajero se aloja en: {', '.join(set(zones.values()))}. Organiza las actividades principalmente cerca de estas zonas para minimizar traslados.")
        
        # Recomendación de zona
        if travel_details.get('needsHotelRecommendation'):
            context_parts.append("- El viajero necesita recomendación de zona para alojarse. Incluye en 'hotelRecommendation' la mejor zona basándote en la logística de este itinerario.")
        
        return "\n".join(context_parts) if context_parts else ""
    
    def _clean_json_response(self, text: str) -> str:
        """
        Limpia la respuesta para extraer JSON válido
        """
        # Remover markdown
        if '```json' in text:
            start = text.find('```json') + 7
            end = text.find('```', start)
            text = text[start:end].strip()
        elif '```' in text:
            start = text.find('```') + 3
            end = text.find('```', start)
            text = text[start:end].strip()
        
        # Extraer JSON
        start_brace = text.find('{')
        end_brace = text.rfind('}') + 1
        
        if start_brace != -1 and end_brace > start_brace:
            text = text[start_brace:end_brace]
        
        return text
    
    def _generate_mock_itinerary(
        self,
        departure_city: str,
        destination: str,
        start_date: str,
        end_date: str,
        travel_details: Optional[Dict] = None
    ) -> Dict:
        """
        Genera itinerario MOCK para testing
        """
        from datetime import datetime, timedelta
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        days_count = (end - start).days
        
        # Ajustar hora de inicio según llegada
        first_day_start = "09:00"
        if travel_details and travel_details.get('arrivalTime'):
            first_day_start = travel_details['arrivalTime']
        
        mock_days = []
        for i in range(days_count):
            current_date = (start + timedelta(days=i)).strftime('%Y-%m-%d')
            day_num = i + 1
            
            # Primer día con hora de llegada
            if day_num == 1:
                morning_start = first_day_start
                morning_activities = [
                    {
                        "time": first_day_start,
                        "title": f"Llegada a {destination}",
                        "description": "Check-in y acomodación" if not (travel_details and travel_details.get('hotelZones')) else f"Llegada a zona {list(travel_details['hotelZones'].values())[0]}",
                        "location": "Hotel",
                        "duration": "1h"
                    },
                    {
                        "time": self._add_hours(first_day_start, 1),
                        "title": f"Primer contacto con {destination}",
                        "description": "Paseo exploratorio por el centro",
                        "location": "Centro histórico",
                        "duration": "2h"
                    }
                ]
            else:
                morning_start = "09:00"
                morning_activities = [
                    {
                        "time": "09:00",
                        "title": "Desayuno local",
                        "description": f"Café tradicional de {destination}",
                        "location": "Café del Centro",
                        "duration": "1h"
                    },
                    {
                        "time": "10:30",
                        "title": f"Visita guiada por {destination}",
                        "description": "Tour por los monumentos principales",
                        "location": "Plaza principal",
                        "duration": "2.5h"
                    }
                ]
            
            mock_days.append({
                "day": day_num,
                "date": current_date,
                "morning": {
                    "startTime": morning_start,
                    "activities": morning_activities
                },
                "afternoon": {
                    "startTime": "14:00",
                    "activities": [
                        {
                            "time": "14:00",
                            "title": "Almuerzo gastronómico",
                            "description": f"Restaurante típico de {destination}",
                            "location": "Restaurante La Plaza",
                            "duration": "1.5h"
                        },
                        {
                            "time": "16:00",
                            "title": "Experiencia cultural",
                            "description": "Museo o galería local",
                            "location": "Museo Nacional",
                            "duration": "2h"
                        }
                    ]
                },
                "night": {
                    "startTime": "20:00",
                    "activities": [
                        {
                            "time": "20:00",
                            "title": "Cena con vistas",
                            "description": f"Restaurante panorámico en {destination}",
                            "location": "Restaurante Mirador",
                            "duration": "2h"
                        },
                        {
                            "time": "22:30",
                            "title": "Vida nocturna local",
                            "description": "Bar o zona de copas típica",
                            "location": "Barrio de tapas",
                            "duration": "2h"
                        }
                    ]
                }
            })
        
        hotel_rec = None
        if travel_details and travel_details.get('needsHotelRecommendation'):
            hotel_rec = f"Recomendamos alojarse en el Centro histórico de {destination} para estar cerca de todas las actividades principales y minimizar traslados."
        
        return {
            "destination": destination,
            "totalDays": days_count,
            "hotelRecommendation": hotel_rec,
            "days": mock_days
        }
    
    def _add_hours(self, time_str: str, hours: int) -> str:
        """Suma horas a un tiempo en formato HH:MM"""
        from datetime import datetime, timedelta
        time_obj = datetime.strptime(time_str, '%H:%M')
        new_time = time_obj + timedelta(hours=hours)
        return new_time.strftime('%H:%M')

        end_date: str, 
        budget: int,
        include_flights: bool = True,
        include_hotels: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Genera recomendaciones de viajes personalizadas usando Gemini 1.5 Flash
        O retorna datos MOCK si USE_MOCK_DATA=true
        """
        # Verificar si está en modo MOCK
        use_mock = os.environ.get('USE_MOCK_DATA', 'false').lower() == 'true'
        
        if use_mock:
            print(f"\n{'='*60}")
            print(f"🎭 MODO MOCK ACTIVADO - Generando datos de prueba")
            print(f"   - Origen: {departure_city}")
            print(f"   - Fechas: {start_date} a {end_date}")
            print(f"   - Presupuesto: {budget}€")
            print(f"   - Incluye Vuelos: {include_flights}")
            print(f"   - Incluye Hoteles: {include_hotels}")
            print(f"{'='*60}\n")
            return self._generate_mock_trips(departure_city, start_date, end_date, budget, include_flights, include_hotels)
        
        print(f"\n{'='*60}")
        print(f"🔍 BÚSQUEDA RECIBIDA:")
        print(f"   - Origen: {departure_city}")
        print(f"   - Fechas: {start_date} a {end_date}")
        print(f"   - Presupuesto: {budget}€")
        print(f"   - Incluye Vuelos: {include_flights}")
        print(f"   - Incluye Hoteles: {include_hotels}")
        print(f"{'='*60}\n")
        
        # Calcular número de días
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        days = (end - start).days
        
        # CONSTRUIR PROMPT DINÁMICO SEGÚN FILTROS
        scenario_instruction = self._build_scenario_instruction(include_flights, include_hotels, budget)
        
        # Determinar estructura JSON según servicios incluidos
        json_structure = self._build_json_structure(include_flights, include_hotels, days, departure_city)
        
        # Crear el prompt optimizado DINÁMICO
        prompt = f"""{scenario_instruction}

INFORMACIÓN DE LA BÚSQUEDA:
- Ciudad de origen: {departure_city}
- Fechas: del {start_date} al {end_date} ({days} días)
- Presupuesto máximo por persona: {budget}€

DESTINOS IMPORTANTES:
- Genera destinos VARIADOS: capitales europeas, ciudades costeras, destinos culturales
- NO repitas siempre los mismos destinos
- Adapta las recomendaciones al presupuesto
- Considera la época del año (fechas proporcionadas)

Devuelve SOLO un objeto JSON con este formato EXACTO (sin markdown, sin texto adicional):

{json_structure}

REGLAS CRÍTICAS:
1. TODOS los precios DEBEN estar entre 100€ y {budget}€
2. Responde SOLO JSON puro, sin ```json ni explicaciones
3. Genera 4 destinos DIFERENTES y variados
4. Itinerarios específicos con nombres reales de lugares y experiencias
5. Para las imágenes, usa URLs MUY SIMPLES: "https://images.unsplash.com/photo-1", "https://images.unsplash.com/photo-2", etc
6. IDs únicos: 1, 2, 3, 4
7. Las URLs de imagen deben ser SIMPLES
8. IMPORTANTE: Genera SOLO JSON válido y completo, sin texto adicional

JSON:"""

        try:
            # Preparar request para Gemini API REST
            headers = {
                'Content-Type': 'application/json'
            }
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 4096,  # Aumentado para asegurar respuesta completa
                }
            }
            
            # Llamar a Gemini API
            url = f"{self.base_url}?key={self.api_key}"
            response = requests.post(url, headers=headers, json=payload, timeout=45)
            
            if response.status_code == 503:
                print(f"⚠️ GEMINI SOBRECARGADO (503) - Presupuesto: {budget}€, Origen: {departure_city}")
                raise Exception("Gemini temporalmente no disponible (alta demanda)")
            
            if response.status_code != 200:
                print(f"❌ ERROR API {response.status_code} - Presupuesto: {budget}€")
                print(f"Response: {response.text[:500]}")
                raise Exception(f"Error {response.status_code} de la API de Gemini")
            
            # Extraer texto de la respuesta
            response_data = response.json()
            
            if 'candidates' not in response_data or len(response_data['candidates']) == 0:
                print("❌ ERROR: No candidates in Gemini response")
                raise Exception("Gemini no devolvió candidatos válidos")
            
            response_text = response_data['candidates'][0]['content']['parts'][0]['text'].strip()
            
            # Limpiar markdown si existe
            response_text = response_text.strip()
            
            # Remover bloques de código markdown
            if '```json' in response_text:
                start_idx = response_text.find('```json') + 7
                end_idx = response_text.find('```', start_idx)
                if end_idx != -1:
                    response_text = response_text[start_idx:end_idx].strip()
            elif '```' in response_text:
                start_idx = response_text.find('```') + 3
                end_idx = response_text.find('```', start_idx)
                if end_idx != -1:
                    response_text = response_text[start_idx:end_idx].strip()
            
            # Extraer solo el objeto JSON principal
            start_brace = response_text.find('{')
            end_brace = response_text.rfind('}') + 1
            
            if start_brace != -1 and end_brace > start_brace:
                response_text = response_text[start_brace:end_brace]
            
            # Log de la respuesta (primeros 1000 caracteres para debugging)
            print(f"Response recibida (primeros 500 chars): {response_text[:500]}")
            
            # Parsear JSON
            try:
                data = json.loads(response_text)
            except json.JSONDecodeError as e:
                # Intentar reparar JSON común: reemplazar comillas simples por dobles
                print(f"⚠️ Intento de reparación de JSON...")
                response_text = response_text.replace("'", '"')
                data = json.loads(response_text)
            trips = data.get('viajes', [])
            
            # Validar precios y agregar imágenes reales
            # Mapeo de destinos a imágenes bonitas (fallback)
            default_images = {
                # Capitales populares
                "Lisboa": "https://images.unsplash.com/photo-1585208798174-6cedd86e019a",
                "Lisbon": "https://images.unsplash.com/photo-1585208798174-6cedd86e019a",
                "Porto": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b",
                "Oporto": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b",
                "Praga": "https://images.unsplash.com/photo-1541849546-216549ae216d",
                "Prague": "https://images.unsplash.com/photo-1541849546-216549ae216d",
                "Budapest": "https://images.unsplash.com/photo-1541849546-216549ae216d",
                "Viena": "https://images.unsplash.com/photo-1516550893923-42d28e5677af",
                "Vienna": "https://images.unsplash.com/photo-1516550893923-42d28e5677af",
                "Berlín": "https://images.unsplash.com/photo-1560969184-10fe8719e047",
                "Berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047",
                "Ámsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017",
                "Amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017",
                "París": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
                "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
                "Roma": "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
                "Rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
                "Florencia": "https://images.unsplash.com/photo-1543429258-955bcf73ca8e",
                "Florence": "https://images.unsplash.com/photo-1543429258-955bcf73ca8e",
                "Venecia": "https://images.unsplash.com/photo-1514890547357-a9ee288728e0",
                "Venice": "https://images.unsplash.com/photo-1514890547357-a9ee288728e0",
                "Barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded",
                "Madrid": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4",
                "Sevilla": "https://images.unsplash.com/photo-1550882518-a88c25ee1f80",
                "Seville": "https://images.unsplash.com/photo-1550882518-a88c25ee1f80",
                "Londres": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
                "London": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
                "Edimburgo": "https://images.unsplash.com/photo-1579003593419-98f949b9398f",
                "Edinburgh": "https://images.unsplash.com/photo-1579003593419-98f949b9398f",
                "Dublín": "https://images.unsplash.com/photo-1549918864-48ac978761a4",
                "Dublin": "https://images.unsplash.com/photo-1549918864-48ac978761a4",
                "Copenhague": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc",
                "Copenhagen": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc",
                "Estocolmo": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11",
                "Stockholm": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11",
                "Oslo": "https://images.unsplash.com/photo-1514984879728-be0aff75a6e8",
                "Helsinki": "https://images.unsplash.com/photo-1548630826-2ec01a41f26f",
                "Bruselas": "https://images.unsplash.com/photo-1559113202-c916b8e44373",
                "Brussels": "https://images.unsplash.com/photo-1559113202-c916b8e44373",
                "Zúrich": "https://images.unsplash.com/photo-1543783207-ec64e4d95325",
                "Zurich": "https://images.unsplash.com/photo-1543783207-ec64e4d95325",
                "Ginebra": "https://images.unsplash.com/photo-1514565131-fce0801e5785",
                "Geneva": "https://images.unsplash.com/photo-1514565131-fce0801e5785",
                "Cracovia": "https://images.unsplash.com/photo-1591974003513-f0fe03ab2a47",
                "Krakow": "https://images.unsplash.com/photo-1591974003513-f0fe03ab2a47",
                "Atenas": "https://images.unsplash.com/photo-1555993539-1732b0258235",
                "Athens": "https://images.unsplash.com/photo-1555993539-1732b0258235",
                "Niza": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a",
                "Nice": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a",
                "Lyon": "https://images.unsplash.com/photo-1574596036562-a5d2e4c15fe1",
                "Marsella": "https://images.unsplash.com/photo-1613157248068-dcf7672a1c85",
                "Marseille": "https://images.unsplash.com/photo-1613157248068-dcf7672a1c85",
                "Toulouse": "https://images.unsplash.com/photo-1542984280-21baf5e0b286",
                "Milán": "https://images.unsplash.com/photo-1513581166391-887a96ddeafd",
                "Milan": "https://images.unsplash.com/photo-1513581166391-887a96ddeafd",
                "Nápoles": "https://images.unsplash.com/photo-1559659421-94e0beee0609",
                "Naples": "https://images.unsplash.com/photo-1559659421-94e0beee0609",
                "Bolonia": "https://images.unsplash.com/photo-1592822617505-b0a2e0e2e3be",
                "Bologna": "https://images.unsplash.com/photo-1592822617505-b0a2e0e2e3be",
                "Palermo": "https://images.unsplash.com/photo-1583422409516-2895a77efded",
                "Liubliana": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
                "Ljubljana": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
                "Zagreb": "https://images.unsplash.com/photo-1560840308-0b46ee4e6b38",
                "Bratislava": "https://images.unsplash.com/photo-1560840309-666176693ee5",
                "Sofía": "https://images.unsplash.com/photo-1580748526878-2d95afb0e2ca",
                "Sofia": "https://images.unsplash.com/photo-1580748526878-2d95afb0e2ca",
                "Bucarest": "https://images.unsplash.com/photo-1562979314-bee7453e911c",
                "Bucharest": "https://images.unsplash.com/photo-1562979314-bee7453e911c",
                "Malta": "https://images.unsplash.com/photo-1536514072410-5019a3c69182",
                "Valeta": "https://images.unsplash.com/photo-1536514072410-5019a3c69182",
                "Valletta": "https://images.unsplash.com/photo-1536514072410-5019a3c69182",
                "Luqa": "https://images.unsplash.com/photo-1536514072410-5019a3c69182",
            }
            
            # Imagen por defecto para ciudades no mapeadas
            default_europe_image = "https://images.unsplash.com/photo-1488646953014-85cb44e25828"
            
            validated_trips = []
            for trip in trips:
                if isinstance(trip.get('price'), (int, float)) and trip['price'] <= budget:
                    # Buscar imagen del destino en el mapeo
                    destination = trip.get('destination', 'Europe')
                    trip['image'] = default_images.get(destination, default_europe_image)
                    validated_trips.append(trip)
            
            if len(validated_trips) > 0:
                print(f"✅ GEMINI ÉXITO: Generó {len(validated_trips)} viajes para {departure_city} (presupuesto: {budget}€)")
                print(f"Destinos generados: {[trip['destination'] for trip in validated_trips]}")
                return validated_trips
            else:
                print(f"❌ GEMINI ERROR: No hay viajes dentro del presupuesto de {budget}€")
                raise Exception("No se encontraron viajes dentro del presupuesto")
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON ERROR: {e}")
            print(f"Response recibida: {response_text[:1000]}")
            raise Exception(f"Error al parsear respuesta de Gemini: {str(e)}")
        except Exception as e:
            print(f"❌ GEMINI API ERROR: {e}")
            raise Exception(f"Error en la API de Gemini: {str(e)}")


    def _generate_mock_trips(
        self,
        departure_city: str,
        start_date: str,
        end_date: str,
        budget: int,
        include_flights: bool = True,
        include_hotels: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Genera datos MOCK de viajes para testing sin gastar API calls
        Soporta los 4 escenarios de filtrado
        """
        # Calcular días
        from datetime import datetime
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        days = (end - start).days
        
        # Mapeo de imágenes (mismo que en el método real)
        images = {
            "Lisboa": "https://images.unsplash.com/photo-1585208798174-6cedd86e019a",
            "Praga": "https://images.unsplash.com/photo-1541849546-216549ae216d",
            "Budapest": "https://images.unsplash.com/photo-1541849546-216549ae216d",
            "Berlín": "https://images.unsplash.com/photo-1560969184-10fe8719e047",
            "Ámsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017",
            "París": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
            "Roma": "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
            "Viena": "https://images.unsplash.com/photo-1516550893923-42d28e5677af",
            "Florencia": "https://images.unsplash.com/photo-1543429258-955bcf73ca8e",
            "Porto": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b",
            "Copenhague": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc",
            "Estocolmo": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11",
        }
        
        # Diferentes conjuntos de viajes según presupuesto
        if budget < 400:
            # Presupuesto bajo: destinos cercanos y económicos
            mock_trips = [
                {
                    "id": 1,
                    "destination": "Porto",
                    "country": "Portugal",
                    "days": days,
                    "price": int(budget * 0.65),
                    "image": images["Porto"],
                    "itinerary": [
                        "Día 1: Llegada y paseo por la Ribeira, visita a las bodegas de vino de Oporto",
                        "Día 2: Exploración del centro histórico, Torre de los Clérigos y Librería Lello",
                        "Día 3: Excursión al valle del Duero, cata de vinos",
                        f"Día {days}: Últimas compras y vuelta a {departure_city}"
                    ],
                    "includes": {"flights": True, "hotel": True, "breakfast": True},
                    "departure": departure_city
                },
                {
                    "id": 2,
                    "destination": "Lisboa",
                    "country": "Portugal",
                    "days": days,
                    "price": int(budget * 0.75),
                    "image": images["Lisboa"],
                    "itinerary": [
                        "Día 1: Barrio de Alfama, Castillo de San Jorge, cena con Fado",
                        "Día 2: Belém: Torre, Monasterio de los Jerónimos, Pastéis de Belém",
                        "Día 3: Chiado, Bairro Alto, Elevador de Santa Justa",
                        f"Día {days}: Tranvía 28 y vuelta a {departure_city}"
                    ],
                    "includes": {"flights": True, "hotel": True, "breakfast": True},
                    "departure": departure_city
                },
                {
                    "id": 3,
                    "destination": "Praga",
                    "country": "República Checa",
                    "days": days,
                    "price": int(budget * 0.85),
                    "image": images["Praga"],
                    "itinerary": [
                        "Día 1: Plaza de la Ciudad Vieja, Reloj Astronómico, Puente de Carlos",
                        "Día 2: Castillo de Praga, Catedral de San Vito, Callejón del Oro",
                        "Día 3: Barrio Judío, degustación de cerveza checa",
                        f"Día {days}: Compras de cristal de Bohemia y vuelta"
                    ],
                    "includes": {"flights": True, "hotel": True, "breakfast": True},
                    "departure": departure_city
                },
                {
                    "id": 4,
                    "destination": "Budapest",
                    "country": "Hungría",
                    "days": days,
                    "price": int(budget * 0.90),
                    "image": images["Budapest"],
                    "itinerary": [
                        "Día 1: Parlamento, Bastión de los Pescadores, vistas del Danubio",
                        "Día 2: Baños termales Széchenyi, Avenida Andrássy",
                        "Día 3: Castillo de Buda, Mercado Central",
                        f"Día {days}: Crucero por el Danubio y vuelta a {departure_city}"
                    ],
                    "includes": {"flights": True, "hotel": True, "breakfast": True},
                    "departure": departure_city
                }
            ]
        elif budget < 800:
            # Presupuesto medio: mezcla de destinos
            mock_trips = [
                {
                    "id": 1,
                    "destination": "Berlín",
                    "country": "Alemania",
                    "days": days,
                    "price": int(budget * 0.70),
                    "image": images["Berlín"],
                    "itinerary": [
                        "Día 1: Puerta de Brandeburgo, Reichstag, Memorial del Holocausto",
                        "Día 2: Isla de los Museos, East Side Gallery",
                        "Día 3: Palacio de Charlottenburg, barrio de Kreuzberg",
                        f"Día {days}: Checkpoint Charlie y vuelta a {departure_city}"
                    ],
                    "includes": {"flights": True, "hotel": True, "breakfast": True},
                    "departure": departure_city
                },
                {
                    "id": 2,
                    "destination": "Ámsterdam",
                    "country": "Países Bajos",
                    "days": days,
                    "price": int(budget * 0.80),
                    "image": images["Ámsterdam"],
                    "itinerary": [
                        "Día 1: Canales, Casa de Ana Frank, Jordaan",
                        "Día 2: Museo Van Gogh, Rijksmuseum, Vondelpark",
                        "Día 3: Paseo en bicicleta, Mercado de las Flores",
                        f"Día {days}: Zaanse Schans y vuelta a {departure_city}"
                    ],
                    "includes": {"flights": True, "hotel": True, "breakfast": True},
                    "departure": departure_city
                },
                {
                    "id": 3,
                    "destination": "Viena",
                    "country": "Austria",
                    "days": days,
                    "price": int(budget * 0.85),
                    "image": images["Viena"],
                    "itinerary": [
                        "Día 1: Palacio de Schönbrunn, Ópera de Viena",
                        "Día 2: Centro histórico, Catedral de San Esteban, Hofburg",
                        "Día 3: Museos, café vienés tradicional",
                        f"Día {days}: Compras y vuelta a {departure_city}"
                    ],
                    "includes": {"flights": True, "hotel": True, "breakfast": True},
                    "departure": departure_city
                },
                {
                    "id": 4,
                    "destination": "Florencia",
                    "country": "Italia",
                    "days": days,
                    "price": int(budget * 0.90),
                    "image": images["Florencia"],
                    "itinerary": [
                        "Día 1: Duomo, Galería de la Academia (David de Miguel Ángel)",
                        "Día 2: Galería Uffizi, Ponte Vecchio, Palazzo Pitti",
                        "Día 3: Piazzale Michelangelo, Jardines de Boboli",
                        f"Día {days}: Compras en el Mercado de San Lorenzo y vuelta"
                    ],
                    "includes": {"flights": True, "hotel": True, "breakfast": True},
                    "departure": departure_city
                }
            ]
        else:
            # Presupuesto alto: destinos premium
            mock_trips = [
                {
                    "id": 1,
                    "destination": "París",
                    "country": "Francia",
                    "days": days,
                    "price": int(budget * 0.75),
                    "image": images["París"],
                    "itinerary": [
                        "Día 1: Torre Eiffel, Campos Elíseos, Arco de Triunfo",
                        "Día 2: Museo del Louvre, Notre-Dame, Sainte-Chapelle",
                        "Día 3: Montmartre, Sacré-Cœur, Moulin Rouge",
                        f"Día {days}: Versalles y vuelta a {departure_city}"
                    ],
                    "includes": {"flights": True, "hotel": True, "breakfast": True},
                    "departure": departure_city
                },
                {
                    "id": 2,
                    "destination": "Roma",
                    "country": "Italia",
                    "days": days,
                    "price": int(budget * 0.80),
                    "image": images["Roma"],
                    "itinerary": [
                        "Día 1: Coliseo, Foro Romano, Palatino",
                        "Día 2: Ciudad del Vaticano, Capilla Sixtina, Basílica de San Pedro",
                        "Día 3: Fontana di Trevi, Panteón, Piazza Navona",
                        f"Día {days}: Villa Borghese y vuelta a {departure_city}"
                    ],
                    "includes": {"flights": True, "hotel": True, "breakfast": True},
                    "departure": departure_city
                },
                {
                    "id": 3,
                    "destination": "Copenhague",
                    "country": "Dinamarca",
                    "days": days,
                    "price": int(budget * 0.85),
                    "image": images["Copenhague"],
                    "itinerary": [
                        "Día 1: Nyhavn, La Sirenita, Palacio de Amalienborg",
                        "Día 2: Jardines de Tivoli, Strøget (zona comercial)",
                        "Día 3: Christiania, restaurantes de diseño nórdico",
                        f"Día {days}: Castillo de Kronborg y vuelta a {departure_city}"
                    ],
                    "includes": {"flights": True, "hotel": True, "breakfast": True},
                    "departure": departure_city
                },
                {
                    "id": 4,
                    "destination": "Estocolmo",
                    "country": "Suecia",
                    "days": days,
                    "price": int(budget * 0.90),
                    "image": images["Estocolmo"],
                    "itinerary": [
                        "Día 1: Gamla Stan (casco antiguo), Palacio Real",
                        "Día 2: Museo Vasa, Skansen (museo al aire libre)",
                        "Día 3: Archipelago tour, SoFo (barrio moderno)",
                        f"Día {days}: ABBA Museum y vuelta a {departure_city}"
                    ],
                    "includes": {"flights": True, "hotel": True, "breakfast": True},
                    "departure": departure_city
                }
            ]
        
        # Filtrar solo viajes dentro del presupuesto
        filtered_trips = [trip for trip in mock_trips if trip['price'] <= budget]
        
        # APLICAR FILTROS DE SERVICIOS
        for trip in filtered_trips:
            # Ajustar estructura según filtros
            trip['includes']['flights'] = include_flights
            trip['includes']['hotel'] = include_hotels
            
            # Añadir campos opcionales según filtros
            if include_flights:
                trip['flights'] = {
                    "class": "Business" if not include_hotels and budget > 600 else "Economy",
                    "details": f"Vuelo directo desde {departure_city}" if budget > 800 else f"Vuelo con escala desde {departure_city}"
                }
            
            if include_hotels:
                trip['hotels'] = {
                    "name": f"Hotel Premium {trip['destination']}",
                    "stars": 5 if not include_flights and budget > 500 else 4,
                    "zone": "Centro histórico",
                    "amenities": ["WiFi", "Desayuno", "Spa", "Piscina"] if not include_flights else ["WiFi", "Desayuno"]
                }
            
            # Ajustar itinerario según escenario
            if not include_flights and not include_hotels:
                # CASO D: Solo experiencias VIP
                trip['itinerary'] = [
                    f"Día 1: Transfer en limusina + Guía privado por {trip['destination']} + Cena estrella Michelin",
                    f"Día 2: Experiencia VIP 'saltarse la cola' en monumentos + Tour gastronómico premium",
                    f"Día 3: Helicóptero panorámico + Spa de lujo + Reserva exclusiva en restaurante gourmet",
                    f"Día {days}: Experiencias personalizadas según preferencias + Transfer premium"
                ]
            elif include_flights and not include_hotels:
                # CASO B: Vuelos premium + experiencias
                trip['itinerary'] = [
                    f"Día 1: Vuelo Business/Premium + Tour gastronómico VIP",
                    f"Día 2: Experiencias premium en {trip['destination']} + Cena en restaurante de renombre",
                    f"Día 3: Tours privados + Actividades exclusivas",
                    f"Día {days}: Compras en zonas exclusivas + Vuelo de regreso Premium"
                ]
            elif not include_flights and include_hotels:
                # CASO C: Hoteles de lujo + logística local premium
                trip['itinerary'] = [
                    f"Día 1: Check-in hotel 5 estrellas + Transfer privado + Spa",
                    f"Día 2: Desayuno gourmet + Tours con chofer privado + Experiencias locales VIP",
                    f"Día 3: Acceso a club lounge del hotel + Actividades premium",
                    f"Día {days}: Late check-out + Transfer privado al punto de partida"
                ]
        
        print(f"✅ MOCK DATA: Generados {len(filtered_trips)} viajes para {departure_city}")
        print(f"   Destinos: {[trip['destination'] for trip in filtered_trips]}")
        print(f"   Filtros: Vuelos={include_flights}, Hoteles={include_hotels}")
        
        return filtered_trips

    def _build_scenario_instruction(self, include_flights: bool, include_hotels: bool, budget: int) -> str:
        """
        Construye la instrucción del escenario según los servicios incluidos
        """
        if include_flights and include_hotels:
            # CASO A: Vuelos + Hoteles
            return f"""Actúa como un agente de viajes integral. Distribuye el presupuesto de {budget}€ entre vuelos, alojamiento de alta calidad y un itinerario detallado. Genera EXACTAMENTE 4 recomendaciones de viajes DIFERENTES."""
        
        elif include_flights and not include_hotels:
            # CASO B: Solo Vuelos
            return f"""No busques hoteles. Asume que el alojamiento ya está resuelto. Reasigna el presupuesto que iría a hoteles para proponer vuelos en clases superiores (Business/Premium Economy) y añade experiencias gastronómicas VIP o tours privados al itinerario. Presupuesto total: {budget}€. Genera EXACTAMENTE 4 recomendaciones DIFERENTES."""
        
        elif not include_flights and include_hotels:
            # CASO C: Solo Hoteles
            return f"""No busques vuelos. Asume que el usuario ya tiene transporte. Reasigna el presupuesto de transporte para buscar los hoteles más lujosos posibles en las mejores zonas y detalla la logística local (taxis premium, transfers privados) en el itinerario. Presupuesto total: {budget}€. Genera EXACTAMENTE 4 recomendaciones DIFERENTES."""
        
        else:
            # CASO D: Ni Vuelos ni Hoteles - Solo Experiencias
            return f"""Céntrate exclusivamente en la experiencia. Al no tener gastos de transporte ni alojamiento, utiliza TODO el presupuesto de {budget}€ para diseñar el itinerario más exclusivo imaginable: guías privados, entradas 'saltarse la cola', cenas en restaurantes con estrella Michelin, experiencias VIP y logística de transporte interno premium (limusinas, helicópteros si el presupuesto lo permite). Genera EXACTAMENTE 4 destinos DIFERENTES con experiencias únicas."""
    
    def _build_json_structure(self, include_flights: bool, include_hotels: bool, days: int, departure_city: str) -> str:
        """
        Construye la estructura JSON esperada según los servicios incluidos
        """
        # Construir la estructura de includes dinámicamente
        includes_structure = '{'
        if include_flights:
            includes_structure += '\n        "flights": true,'
        if include_hotels:
            includes_structure += '\n        "hotel": true,'
        includes_structure += '\n        "breakfast": true\n      }'
        
        # Construir campos opcionales
        flights_field = '''
      "flights": {
        "class": "Economy" o "Business" o "Premium",
        "details": "Descripción del vuelo"
      },''' if include_flights else ''
        
        hotels_field = '''
      "hotels": {
        "name": "Nombre del hotel",
        "stars": 4,
        "zone": "Zona del hotel",
        "amenities": ["WiFi", "Desayuno", "Spa"]
      },''' if include_hotels else ''
        
        return f'''{{
  "viajes": [
    {{
      "id": 1,
      "destination": "Nombre Ciudad",
      "country": "País",
      "days": {days},
      "price": 450,
      "image": "https://images.unsplash.com/photo-1",{flights_field}{hotels_field}
      "itinerary": [
        "Día 1: Actividad específica y detallada",
        "Día 2: Otra actividad memorable",
        "Día 3: Experiencia única"
      ],
      "includes": {includes_structure},
      "departure": "{departure_city}"
    }}
  ]
}}'''

