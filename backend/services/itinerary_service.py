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
        has_flights: bool = False,
        arrival_time: Optional[str] = None,
        departure_time: Optional[str] = None,
        has_hotel: bool = False,
        hotel_name: Optional[str] = None,
        needs_hotel_recommendation: bool = False
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
            needs_hotel_recommendation: Si necesita recomendación de hotel - solo si has_hotel=False
            
        Returns:
            Dict con estructura de itinerario completo
        """
        print(f"\n{'='*70}")
        print(f"📋 GENERANDO ITINERARIO PROFESIONAL")
        print(f"   Destino: {destination}")
        print(f"   Fechas: {start_date} → {end_date}")
        if has_flights:
            print(f"   Vuelos: Llegada {arrival_time}, Salida {departure_time}")
        if has_hotel and hotel_name:
            print(f"   Hotel: {hotel_name}")
        elif needs_hotel_recommendation:
            print(f"   Hotel: Solicita recomendación")
        print(f"{'='*70}\n")
        
        # Calcular días
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        total_days = (end - start).days
        
        if self.use_mock:
            return self._generate_mock_itinerary(
                destination, start_date, end_date, total_days,
                has_flights, arrival_time, departure_time,
                has_hotel, hotel_name, needs_hotel_recommendation
            )
        
        # Generar con Gemini AI
        return await self._generate_ai_itinerary(
            destination, start_date, end_date, total_days,
            has_flights, arrival_time, departure_time,
            has_hotel, hotel_name, needs_hotel_recommendation
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
        needs_hotel_recommendation: bool
    ) -> Dict:
        """
        Genera itinerario usando Gemini AI con nueva lógica
        """
        # Construir contexto inteligente
        context = self._build_context(
            total_days, has_flights, arrival_time, departure_time,
            has_hotel, hotel_name, needs_hotel_recommendation
        )
        
        # Prompt profesional optimizado
        prompt = f"""Eres un experto en planificación de itinerarios de alta gama, especializado en crear experiencias personalizadas.

DESTINO: {destination}
PERIODO: {start_date} a {end_date} ({total_days} días)

CONTEXTO DEL VIAJE:
{context}

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
        has_flights: bool,
        arrival_time: Optional[str],
        departure_time: Optional[str],
        has_hotel: bool,
        hotel_name: Optional[str],
        needs_hotel_recommendation: bool
    ) -> Dict:
        """
        Genera itinerario MOCK para testing con nueva lógica
        """
        start = datetime.strptime(start_date, '%Y-%m-%d')
        days_list = []
        
        # Determinar nombre del hotel para recomendaciones
        recommended_hotel_name = "Hotel Centro Histórico" if needs_hotel_recommendation else None
        
        for day_num in range(total_days):
            current_date = (start + timedelta(days=day_num)).strftime('%Y-%m-%d')
            
            # Detectar en qué momento del día comienza (si es día 1 con vuelos)
            start_moment = "morning"  # Por defecto mañana
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
                # Días intermedios
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
        needs_hotel_recommendation: bool
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
    
    def _build_context(
        self,
        total_days: int,
        has_flights: bool,
        arrival_time: Optional[str],
        departure_time: Optional[str],
        has_hotel: bool,
        hotel_name: Optional[str],
        needs_hotel_recommendation: bool
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
