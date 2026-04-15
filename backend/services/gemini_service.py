import os
import json
from datetime import datetime
from typing import Dict, List, Any
from emergentintegrations.llm.chat import LlmChat, UserMessage

class GeminiTravelService:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise Exception("EMERGENT_LLM_KEY no encontrada en variables de entorno")
        
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
        print(f"\n{'='*60}")
        print(f"🔍 BÚSQUEDA RECIBIDA:")
        print(f"   - Origen: {departure_city}")
        print(f"   - Fechas: {start_date} a {end_date}")
        print(f"   - Presupuesto: {budget}€")
        print(f"{'='*60}\n")
        
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
            # Inicializar chat con Gemini usando emergentintegrations
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"travel-search-{departure_city}-{budget}",
                system_message="Eres un experto en planificación de viajes. Genera recomendaciones en formato JSON estricto."
            ).with_model("gemini", "gemini-2.5-flash")
            
            # Crear mensaje de usuario
            user_message = UserMessage(text=prompt)
            
            # Enviar mensaje y obtener respuesta
            response_text = await chat.send_message(user_message)
            
            if not response_text:
                print("❌ ERROR: Gemini retornó respuesta vacía")
                raise Exception("Gemini no generó respuesta")
            
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
