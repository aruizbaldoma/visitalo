"""
Servicio de Gestión Profesional de Itinerarios
Sin precios, sin ofertas - Solo planificación de actividades
"""
import requests
import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional


class ItineraryService:
    """
    Servicio profesional para generar itinerarios de viaje detallados
    Enfocado en planificación de actividades (Mañana/Tarde/Noche)
    """
    
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY')
        self.use_mock = os.environ.get('USE_MOCK_DATA', 'false').lower() == 'true'
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
    
    async def generate_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        arrival_time: Optional[str] = None,
        departure_time: Optional[str] = None,
        hotel_zones: Optional[Dict[str, str]] = None,
        needs_hotel_recommendation: bool = False
    ) -> Dict:
        """
        Genera un itinerario profesional estructurado por días y momentos del día
        
        Args:
            destination: Ciudad/país destino
            start_date: Fecha inicio (YYYY-MM-DD)
            end_date: Fecha fin (YYYY-MM-DD)
            arrival_time: Hora llegada primer día (HH:MM) opcional
            departure_time: Hora salida último día (HH:MM) opcional
            hotel_zones: Dict con zonas de hotel por día opcional
            needs_hotel_recommendation: Si necesita recomendación de zona
            
        Returns:
            Dict con estructura de itinerario completo
        """
        print(f"\n{'='*70}")
        print(f"📋 GENERANDO ITINERARIO PROFESIONAL")
        print(f"   Destino: {destination}")
        print(f"   Fechas: {start_date} → {end_date}")
        if arrival_time:
            print(f"   Llegada: {arrival_time}")
        if departure_time:
            print(f"   Salida: {departure_time}")
        if hotel_zones:
            print(f"   Zonas hotel: {hotel_zones}")
        print(f"{'='*70}\n")
        
        # Calcular días
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        total_days = (end - start).days
        
        if self.use_mock:
            return self._generate_mock_itinerary(
                destination, start_date, end_date, total_days,
                arrival_time, departure_time, hotel_zones, needs_hotel_recommendation
            )
        
        # Generar con Gemini AI
        return await self._generate_ai_itinerary(
            destination, start_date, end_date, total_days,
            arrival_time, departure_time, hotel_zones, needs_hotel_recommendation
        )
    
    async def _generate_ai_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        total_days: int,
        arrival_time: Optional[str],
        departure_time: Optional[str],
        hotel_zones: Optional[Dict[str, str]],
        needs_hotel_recommendation: bool
    ) -> Dict:
        """
        Genera itinerario usando Gemini AI
        """
        # Construir contexto inteligente
        context = self._build_context(
            total_days, arrival_time, departure_time, 
            hotel_zones, needs_hotel_recommendation
        )
        
        # Prompt profesional
        prompt = f"""Eres un experto en planificación de viajes profesional.

DESTINO: {destination}
PERIODO: {start_date} a {end_date} ({total_days} días)

{context}

INSTRUCCIONES:
1. Genera un itinerario detallado dividido por días
2. Cada día debe tener: MAÑANA, TARDE y NOCHE
3. Incluye actividades específicas con nombres REALES de lugares
4. NO incluyas precios, NO menciones "reservar" o "comprar"
5. Solo planificación de actividades y experiencias

Devuelve SOLO JSON con esta estructura:

{{
  "destination": "{destination}",
  "totalDays": {total_days},
  "hotelRecommendation": "Zona recomendada..." o null,
  "days": [
    {{
      "day": 1,
      "date": "{start_date}",
      "morning": {{
        "activities": [
          {{
            "time": "09:00",
            "title": "Nombre actividad",
            "description": "Descripción detallada",
            "location": "Dirección exacta",
            "duration": "2h"
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

JSON:"""
        
        try:
            headers = {'Content-Type': 'application/json'}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 4096
                }
            }
            
            url = f"{self.base_url}?key={self.api_key}"
            response = requests.post(url, headers=headers, json=payload, timeout=50)
            
            if response.status_code != 200:
                raise Exception(f"Gemini API error {response.status_code}")
            
            result = response.json()
            text = result['candidates'][0]['content']['parts'][0]['text']
            
            # Limpiar y parsear
            clean_text = self._clean_json(text)
            itinerary = json.loads(clean_text)
            
            print(f"✅ ITINERARIO GENERADO: {destination}, {total_days} días\n")
            return itinerary
            
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            raise Exception(f"Error generando itinerario: {str(e)}")
    
    def _generate_mock_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        total_days: int,
        arrival_time: Optional[str],
        departure_time: Optional[str],
        hotel_zones: Optional[Dict[str, str]],
        needs_hotel_recommendation: bool
    ) -> Dict:
        """
        Genera itinerario MOCK para testing
        """
        start = datetime.strptime(start_date, '%Y-%m-%d')
        days_list = []
        
        for day_num in range(total_days):
            current_date = (start + timedelta(days=day_num)).strftime('%Y-%m-%d')
            
            # Día 1 con hora de llegada
            if day_num == 0 and arrival_time:
                morning_start = arrival_time
                morning_activities = [
                    {
                        "time": arrival_time,
                        "title": f"Llegada a {destination}",
                        "description": "Transfer del aeropuerto al alojamiento",
                        "location": "Aeropuerto internacional",
                        "duration": "1.5h"
                    },
                    {
                        "time": self._add_time(arrival_time, 2),
                        "title": "Primer recorrido por el centro",
                        "description": f"Paseo introductorio por {destination}",
                        "location": "Centro histórico",
                        "duration": "2h"
                    }
                ]
            else:
                morning_start = "09:00"
                morning_activities = [
                    {
                        "time": "09:00",
                        "title": "Desayuno típico local",
                        "description": f"Café tradicional en {destination}",
                        "location": "Café del Centro",
                        "duration": "1h"
                    },
                    {
                        "time": "10:30",
                        "title": f"Tour cultural por {destination}",
                        "description": "Visita guiada a monumentos principales",
                        "location": "Plaza Mayor",
                        "duration": "2.5h"
                    }
                ]
            
            # Último día con hora de salida
            if day_num == total_days - 1 and departure_time:
                night_activities = [
                    {
                        "time": "20:00",
                        "title": "Cena de despedida",
                        "description": f"Última cena en {destination}",
                        "location": "Restaurante panorámico",
                        "duration": "2h"
                    },
                    {
                        "time": self._subtract_time(departure_time, 2),
                        "title": "Preparación para salida",
                        "description": "Check-out y traslado al aeropuerto",
                        "location": "Hotel",
                        "duration": "1.5h"
                    }
                ]
            else:
                night_activities = [
                    {
                        "time": "20:00",
                        "title": "Cena local",
                        "description": f"Restaurante típico de {destination}",
                        "location": "Zona gastronómica",
                        "duration": "2h"
                    },
                    {
                        "time": "22:30",
                        "title": "Vida nocturna",
                        "description": "Bar o zona de ambiente local",
                        "location": "Barrio de ocio",
                        "duration": "2h"
                    }
                ]
            
            days_list.append({
                "day": day_num + 1,
                "date": current_date,
                "morning": {
                    "activities": morning_activities
                },
                "afternoon": {
                    "activities": [
                        {
                            "time": "14:00",
                            "title": "Almuerzo",
                            "description": f"Comida local en {destination}",
                            "location": "Restaurante La Plaza",
                            "duration": "1.5h"
                        },
                        {
                            "time": "16:00",
                            "title": "Museo o atracción principal",
                            "description": "Visita cultural de la tarde",
                            "location": "Museo Nacional",
                            "duration": "2h"
                        },
                        {
                            "time": "18:30",
                            "title": "Paseo al atardecer",
                            "description": f"Caminata por zonas pintorescas de {destination}",
                            "location": "Mirador panorámico",
                            "duration": "1.5h"
                        }
                    ]
                },
                "night": {
                    "activities": night_activities
                }
            })
        
        # Recomendación de hotel
        hotel_rec = None
        if needs_hotel_recommendation:
            hotel_rec = f"Recomendamos alojarse en el Centro Histórico de {destination} para estar cerca de las principales atracciones y minimizar desplazamientos. La zona tiene excelente conectividad con transporte público."
        
        print(f"✅ MOCK ITINERARY: {destination}, {total_days} días\n")
        
        return {
            "destination": destination,
            "totalDays": total_days,
            "hotelRecommendation": hotel_rec,
            "days": days_list
        }
    
    def _build_context(
        self,
        total_days: int,
        arrival_time: Optional[str],
        departure_time: Optional[str],
        hotel_zones: Optional[Dict[str, str]],
        needs_hotel_recommendation: bool
    ) -> str:
        """
        Construye contexto inteligente para el prompt
        """
        parts = []
        
        if arrival_time:
            parts.append(f"HORA DE LLEGADA: El día 1 comienza a las {arrival_time}. Ajusta las actividades de la mañana según esta hora.")
        
        if departure_time:
            parts.append(f"HORA DE SALIDA: El día {total_days} termina antes de las {departure_time}. Planifica para llegar a tiempo al aeropuerto.")
        
        if hotel_zones:
            zones_list = ", ".join(set(hotel_zones.values()))
            parts.append(f"ZONA DE ALOJAMIENTO: {zones_list}. Organiza actividades cerca de estas zonas para minimizar traslados.")
        
        if needs_hotel_recommendation:
            parts.append("RECOMENDACIÓN DE ZONA: Incluye en 'hotelRecommendation' la mejor zona para alojarse según este itinerario.")
        
        return "\n".join(parts) if parts else ""
    
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
