from google import genai
from google.genai import types
import os
import json
from datetime import datetime
from typing import Dict, List, Any

class GeminiTravelService:
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY')
        self.client = genai.Client(api_key=self.api_key)
        
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
        if budget > 1000:
            budget_level = "de lujo"
        elif budget > 500:
            budget_level = "medio-alto"
        
        # Crear el prompt optimizado para JSON válido
        prompt = f"""Eres un experto planificador de viajes. Genera EXACTAMENTE 4 recomendaciones de viajes {budget_level} desde {departure_city} a destinos europeos.

RESTRICCIONES IMPORTANTES:
- Presupuesto máximo por persona: {budget}€
- Duración: {days} días (del {start_date} al {end_date})
- Todos los precios DEBEN estar entre 100€ y {budget}€
- Si el presupuesto es superior a 1000€, incluye opciones de lujo con hoteles 5 estrellas y actividades premium

Devuelve SOLO un objeto JSON válido con este formato EXACTO (sin texto adicional, sin markdown, sin explicaciones):

{{
  "viajes": [
    {{
      "id": 1,
      "destination": "Roma",
      "country": "Italia",
      "days": {days},
      "price": 450,
      "image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
      "itinerary": [
        "Día 1: Coliseo y Foro Romano",
        "Día 2: Vaticano y Museos",
        "Día 3: Fontana di Trevi y compras"
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

REGLAS ESTRICTAS:
1. Responde SOLO con JSON, sin ```json ni texto adicional
2. Usa comillas dobles para strings
3. Los precios deben ser números enteros sin símbolos
4. El array itinerary debe tener entre 3-5 actividades específicas
5. Usa URLs reales de Unsplash para cada destino
6. Sugiere destinos europeos variados y atractivos
7. Si budget > 1000€: incluye hoteles de lujo, vuelos business class, actividades premium
8. Si budget < 300€: opciones económicas con hostales y vuelos low-cost
9. Todos los viajes deben tener id único (1, 2, 3, 4)

Genera ahora las 4 recomendaciones en JSON:"""

        try:
            # Generar contenido con Gemini
            response = self.client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    top_p=0.8,
                    top_k=40,
                    max_output_tokens=2048,
                )
            )
            
            # Obtener el texto de la respuesta
            response_text = response.text.strip()
            
            # Limpiar la respuesta si viene con markdown o texto extra
            if '```json' in response_text:
                start_idx = response_text.find('```json') + 7
                end_idx = response_text.find('```', start_idx)
                response_text = response_text[start_idx:end_idx].strip()
            elif '```' in response_text:
                start_idx = response_text.find('```') + 3
                end_idx = response_text.find('```', start_idx)
                response_text = response_text[start_idx:end_idx].strip()
            
            # Buscar el inicio y fin del objeto JSON
            start_brace = response_text.find('{')
            end_brace = response_text.rfind('}') + 1
            
            if start_brace != -1 and end_brace > start_brace:
                response_text = response_text[start_brace:end_brace]
            
            # Parsear JSON
            data = json.loads(response_text)
            trips = data.get('viajes', [])
            
            # Validar que todos los viajes tengan el formato correcto
            validated_trips = []
            for trip in trips:
                if trip.get('price', 0) <= budget:
                    validated_trips.append(trip)
            
            return validated_trips if validated_trips else self._get_fallback_trips(departure_city, days, budget)
            
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON from Gemini: {e}")
            print(f"Response was: {response_text}")
            return self._get_fallback_trips(departure_city, days, budget)
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return self._get_fallback_trips(departure_city, days, budget)
    
    def _get_fallback_trips(self, departure_city: str, days: int, budget: int) -> List[Dict[str, Any]]:
        """
        Devuelve viajes de respaldo en caso de error con Gemini
        """
        fallback_trips = [
            {
                "id": 1,
                "destination": "Lisboa",
                "country": "Portugal",
                "days": days,
                "price": min(320, budget - 50) if budget > 370 else 280,
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
                "price": min(380, budget - 30) if budget > 410 else 350,
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
