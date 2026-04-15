import requests
import os
import json
from datetime import datetime
from typing import Dict, List, Any

class GeminiTravelService:
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY')
        if not self.api_key:
            raise Exception("GEMINI_API_KEY no encontrada en variables de entorno")
        # Usar gemini-flash-latest que apunta a la mejor versión de Flash disponible
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
        
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
      "image": "https://images.unsplash.com/photo-1234567890123",
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
5. Para las imágenes, usa URLs MUY SIMPLES: "https://images.unsplash.com/photo-1", "https://images.unsplash.com/photo-2", etc
6. IDs únicos: 1, 2, 3, 4
7. Las URLs de imagen deben ser SIMPLES: solo "https://images.unsplash.com/photo-N" donde N es 1,2,3,4
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
