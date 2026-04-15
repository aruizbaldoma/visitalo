from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
import json
from datetime import datetime
from typing import Dict, List, Any

class GeminiTravelService:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        
    async def generate_travel_recommendations(
        self, 
        departure_city: str, 
        start_date: str, 
        end_date: str, 
        budget: int
    ) -> List[Dict[str, Any]]:
        """
        Genera recomendaciones de viajes personalizadas usando Gemini
        """
        # Calcular número de días
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        days = (end - start).days
        
        # Crear el chat con Gemini
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"travel-search-{datetime.now().timestamp()}",
            system_message="""Eres un experto en planificación de viajes económicos desde España. 
Tu trabajo es recomendar viajes asequibles y atractivos a destinos europeos.
Debes responder SOLO con un JSON válido que contenga una lista de 3-5 viajes recomendados.
Cada viaje debe incluir: destino, país, días, precio (dentro del presupuesto), imagen_url, itinerario (lista de actividades por día), includes (vuelos, hotel, desayuno), y ciudad de salida."""
        ).with_model("gemini", "gemini-2.5-pro")
        
        # Crear el prompt
        prompt = f"""Genera 3-5 recomendaciones de viajes desde {departure_city} con las siguientes condiciones:
- Presupuesto máximo: {budget}€ por persona
- Duración del viaje: {days} días (del {start_date} al {end_date})
- Destinos: Ciudades europeas accesibles desde {departure_city}
- Incluye vuelos + hotel como mínimo

Por favor devuelve SOLO un JSON válido con este formato exacto:
{{
  "viajes": [
    {{
      "id": 1,
      "destination": "nombre_ciudad",
      "country": "país",
      "days": {days},
      "price": precio_en_euros,
      "image": "https://images.unsplash.com/photo-XXXXX (busca una imagen representativa del destino)",
      "itinerary": ["Día 1: actividades", "Día 2: actividades", ...],
      "includes": {{
        "flights": true,
        "hotel": true,
        "breakfast": true o false
      }},
      "departure": "{departure_city}"
    }}
  ]
}}

IMPORTANTE: 
- Todos los precios deben estar por debajo de {budget}€
- Sugiere destinos variados y atractivos
- El itinerario debe ser realista y específico
- Usa URLs reales de Unsplash para las imágenes
- Responde SOLO con el JSON, sin texto adicional"""

        # Enviar mensaje y obtener respuesta
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parsear la respuesta JSON
        try:
            # Limpiar la respuesta si viene con markdown
            response_text = response.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            data = json.loads(response_text)
            return data.get('viajes', [])
        except json.JSONDecodeError as e:
            # Si falla el parsing, devolver un error estructurado
            print(f"Error parsing Gemini response: {e}")
            print(f"Response was: {response}")
            return []
    
    async def chat_with_travel_assistant(
        self,
        user_message: str,
        session_id: str
    ) -> str:
        """
        Chat general con el asistente de viajes
        """
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message="Eres un asistente experto en viajes que ayuda a planificar vacaciones económicas desde España."
        ).with_model("gemini", "gemini-2.5-pro")
        
        message = UserMessage(text=user_message)
        response = await chat.send_message(message)
        return response
