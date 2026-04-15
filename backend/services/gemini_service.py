import requests
import os
import json
from datetime import datetime
from typing import Dict, List, Any

class GeminiTravelService:
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        
    async def generate_travel_recommendations(
        self, 
        departure_city: str, 
        start_date: str, 
        end_date: str, 
        budget: int
    ) -> List[Dict[str, Any]]:
        """
        Genera recomendaciones de viajes personalizadas usando Gemini 1.5 Flash
        """
        # Calcular número de días
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        days = (end - start).days
        
        # Determinar si es presupuesto alto o bajo
        budget_level = "económico"
        extra_instructions = "Sugiere opciones económicas con vuelos low-cost y hoteles de 2-3 estrellas."
        
        if budget > 1000:
            budget_level = "de lujo"
            extra_instructions = "Incluye SOLO opciones de lujo: hoteles 5 estrellas, vuelos en clase business, actividades premium, restaurantes gourmet y experiencias exclusivas."
        elif budget > 500:
            budget_level = "medio-alto"
            extra_instructions = "Sugiere opciones de calidad con buenos hoteles de 4 estrellas y actividades interesantes."
        
        # Crear el prompt optimizado
        prompt = f"""Eres un experto en planificación de viajes. Genera EXACTAMENTE 4 recomendaciones de viajes DIFERENTES desde {departure_city} a destinos europeos.

INFORMACIÓN DE LA BÚSQUEDA:
- Ciudad de origen: {departure_city}
- Fechas: del {start_date} al {end_date} ({days} días)
- Presupuesto máximo por persona: {budget}€
- Nivel de viaje: {budget_level}

INSTRUCCIONES ESPECIALES:
{extra_instructions}

DESTINOS IMPORTANTES:
- Genera destinos VARIADOS: capitales europeas, ciudades costeras, destinos culturales
- NO repitas siempre los mismos destinos
- Adapta las recomendaciones al presupuesto: si es bajo, destinos cercanos; si es alto, cualquier destino premium de Europa
- Considera la época del año (fechas proporcionadas)

Devuelve SOLO un objeto JSON con este formato EXACTO (sin markdown, sin texto adicional):

{{
  "viajes": [
    {{
      "id": 1,
      "destination": "Nombre Ciudad",
      "country": "País",
      "days": {days},
      "price": 450,
      "image": "https://images.unsplash.com/photo-XXXXX",
      "itinerary": [
        "Día 1: Actividad específica en el destino",
        "Día 2: Otra actividad interesante",
        "Día 3: Más actividades"
      ],
      "includes": {{
        "flights": true,
        "hotel": true,
        "breakfast": true
      }},
      "departure": "{departure_city}"
    }}
  ]
}}

REGLAS CRÍTICAS:
1. TODOS los precios DEBEN estar entre 100€ y {budget}€
2. Responde SOLO JSON puro, sin ```json ni explicaciones
3. Genera 4 destinos DIFERENTES y variados
4. Itinerarios específicos con nombres reales de lugares
5. URLs válidas de Unsplash para imágenes de cada destino
6. IDs únicos: 1, 2, 3, 4

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
                    "maxOutputTokens": 2048,
                }
            }
            
            # Llamar a Gemini API
            url = f"{self.base_url}?key={self.api_key}"
            response = requests.post(url, headers=headers, json=payload, timeout=45)
            
            if response.status_code == 503:
                print("⚠️ Gemini temporalmente sobrecargado, usando fallback")
                return self._get_fallback_trips(departure_city, days, budget)
            
            if response.status_code != 200:
                print(f"Error de Gemini API: {response.status_code} - {response.text[:500]}")
                return self._get_fallback_trips(departure_city, days, budget)
            
            # Extraer texto de la respuesta
            response_data = response.json()
            
            if 'candidates' not in response_data or len(response_data['candidates']) == 0:
                print("No candidates in Gemini response")
                return self._get_fallback_trips(departure_city, days, budget)
            
            response_text = response_data['candidates'][0]['content']['parts'][0]['text'].strip()
            
            # Limpiar markdown si existe
            if '```json' in response_text:
                start_idx = response_text.find('```json') + 7
                end_idx = response_text.find('```', start_idx)
                response_text = response_text[start_idx:end_idx].strip()
            elif '```' in response_text:
                start_idx = response_text.find('```') + 3
                end_idx = response_text.find('```', start_idx)
                response_text = response_text[start_idx:end_idx].strip()
            
            # Extraer JSON
            start_brace = response_text.find('{')
            end_brace = response_text.rfind('}') + 1
            
            if start_brace != -1 and end_brace > start_brace:
                response_text = response_text[start_brace:end_brace]
            
            # Parsear JSON
            data = json.loads(response_text)
            trips = data.get('viajes', [])
            
            # Validar precios
            validated_trips = []
            for trip in trips:
                if isinstance(trip.get('price'), (int, float)) and trip['price'] <= budget:
                    validated_trips.append(trip)
            
            if len(validated_trips) > 0:
                print(f"✓ Gemini generó {len(validated_trips)} viajes para {departure_city} con presupuesto {budget}€")
                return validated_trips
            else:
                print("No hay viajes validados dentro del presupuesto")
                return self._get_fallback_trips(departure_city, days, budget)
            
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            print(f"Response: {response_text[:500]}")
            return self._get_fallback_trips(departure_city, days, budget)
        except Exception as e:
            print(f"Error llamando a Gemini: {e}")
            return self._get_fallback_trips(departure_city, days, budget)
    
    def _get_fallback_trips(self, departure_city: str, days: int, budget: int) -> List[Dict[str, Any]]:
        """
        Viajes de respaldo SOLO si Gemini falla
        """
        print(f"⚠️ Usando viajes de fallback para {departure_city}, {days} días, {budget}€")
        
        fallback_trips = [
            {
                "id": 1,
                "destination": "Lisboa",
                "country": "Portugal",
                "days": days,
                "price": min(320, int(budget * 0.8)) if budget > 400 else 280,
                "image": "https://images.unsplash.com/photo-1585208798174-6cedd86e019a",
                "itinerary": [
                    "Día 1: Alfama y Castillo de San Jorge",
                    "Día 2: Belém y Torre de Belém",
                    "Día 3: Barrio Alto y Chiado"
                ],
                "includes": {"flights": True, "hotel": True, "breakfast": True},
                "departure": departure_city
            },
            {
                "id": 2,
                "destination": "Praga",
                "country": "República Checa",
                "days": days,
                "price": min(380, int(budget * 0.9)) if budget > 420 else 350,
                "image": "https://images.unsplash.com/photo-1541849546-216549ae216d",
                "itinerary": [
                    "Día 1: Puente de Carlos y Casco Antiguo",
                    "Día 2: Castillo de Praga",
                    "Día 3: Barrio Judío"
                ],
                "includes": {"flights": True, "hotel": True, "breakfast": False},
                "departure": departure_city
            }
        ]
        
        return [trip for trip in fallback_trips if trip['price'] <= budget]
