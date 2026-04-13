# RutaBarata - Product Requirements Document

## Visión General
**Producto**: RutaBarata - Planificador de viajes AI para viajes económicos desde España a Europa
**Fecha de Inicio**: Diciembre 2025
**Estado**: Frontend MVP Completo con datos mock

## Problema a Resolver
Los viajeros españoles pierden tiempo comparando vuelos y hoteles en múltiples plataformas. RutaBarata utiliza IA para encontrar automáticamente las mejores combinaciones de viajes económicos.

## Usuarios Objetivo
- Viajeros españoles de 25-45 años
- Personas con presupuesto limitado pero con ganas de viajar
- Usuarios que valoran la conveniencia sobre el precio más bajo absoluto

## Requisitos Funcionales Implementados (MVP Frontend - Diciembre 2025)

### ✅ Secciones Completadas
1. **Hero Section**
   - Título principal: "Viaja más gastando menos"
   - Formulario de búsqueda interactivo con:
     * Selector de ciudad de origen (Barcelona, Madrid, Valencia, Sevilla, Málaga, Bilbao)
     * Selector de fechas (ida y vuelta)
     * Input de presupuesto máximo
     * Botón de búsqueda con gradiente naranja
   - Fondo con imagen de avión y gradiente naranja-verde

2. **Cómo Funciona**
   - 3 pasos visuales con iconos
   - Diseño circular con conectores entre pasos
   - Esquema de colores naranja/verde

3. **Viajes de Ejemplo / Resultados**
   - Tarjetas de 3 destinos: Roma (280€), Lisboa (320€), París (350€)
   - Imágenes profesionales de cada destino
   - Información incluida: días, precio, incluye (vuelos/hotel/desayuno), itinerario
   - Funcionalidad de búsqueda que filtra por presupuesto
   - Transición entre "Viajes de ejemplo" y "Viajes encontrados"

4. **Beneficios**
   - 4 beneficios principales con iconos
   - Diseño de tarjetas con hover effects

5. **Testimonios**
   - 3 testimonios de usuarios con calificaciones 5 estrellas
   - Estadísticas de confianza (12,000+ viajes, €450 ahorro promedio, 4.9/5, 24/7)

6. **CTA (Call to Action)**
   - Sección destacada con gradiente naranja-verde
   - Botón principal "Planificar viaje gratis"
   - Mensaje sin compromisos

7. **Header & Footer**
   - Header fijo con logo RutaBarata
   - Navegación smooth scroll
   - Footer completo con enlaces, contacto, redes sociales
   - Disclaimer de enlaces de afiliados

### 🎨 Diseño y UX
- Colores corporativos: Naranja (#FF8C00) y Verde (#6B8E23)
- Tipografía: Inter, sans-serif
- Responsive design (mobile-first)
- Animaciones y transiciones suaves
- Componentes de Shadcn UI
- Toast notifications con Sonner

### 📦 Tecnologías Frontend
- React 19
- Tailwind CSS
- Shadcn UI components
- Lucide React icons
- Axios para futuras llamadas API

## Datos Mock Implementados (/app/frontend/src/data/mock.js)
- `exampleTrips`: 3 viajes de ejemplo (Roma, Lisboa, París)
- `departureCities`: 6 ciudades de origen españolas
- `howItWorksSteps`: 3 pasos del proceso
- `benefits`: 4 beneficios principales
- `testimonials`: 3 testimonios de usuarios
- `searchTrips()`: Función mock que filtra viajes por presupuesto

## Próximos Pasos (Backlog Priorizado)

### P0 - Backend Core (Próxima Fase)
1. **API de Búsqueda de Viajes**
   - Endpoint: `POST /api/search-trips`
   - Integración con APIs de vuelos (Skyscanner, Amadeus, o similar)
   - Integración con APIs de hoteles (Booking, Expedia)
   - Algoritmo de optimización de combinaciones precio/calidad

2. **Base de Datos**
   - Modelo Trip: almacenar búsquedas y resultados
   - Modelo User (opcional): guardar búsquedas favoritas
   - Modelo SearchHistory: analytics de búsquedas

3. **Integración AI**
   - Servicio de recomendaciones con GPT/Gemini
   - Optimización de itinerarios
   - Sugerencias personalizadas basadas en preferencias

### P1 - Monetización
1. **Enlaces de Afiliados**
   - Integración con programas de afiliados (Skyscanner, Booking, etc.)
   - Tracking de conversiones
   - Sistema de deep links

2. **Analytics**
   - Google Analytics 4
   - Tracking de conversiones
   - Heatmaps de usuario

### P2 - Mejoras UX
1. **Autenticación de Usuarios**
   - Login/registro
   - Guardar búsquedas favoritas
   - Alertas de precio

2. **Características Avanzadas**
   - Filtros adicionales (tipo de hotel, aerolíneas preferidas)
   - Comparador visual de opciones
   - Calendario de precios
   - Newsletter con ofertas

3. **SEO y Marketing**
   - Páginas de destinos específicos
   - Blog de viajes
   - Meta tags optimizados
   - Sitemap

## Contrato de API (Para Implementación Backend)

### POST /api/search-trips
**Request:**
```json
{
  "departureCity": "Barcelona",
  "startDate": "2026-06-15",
  "endDate": "2026-06-20",
  "budget": 400
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "trip_123",
      "destination": "Roma",
      "country": "Italia",
      "days": 3,
      "price": 280,
      "image": "url",
      "itinerary": ["..."],
      "includes": {
        "flights": true,
        "hotel": true,
        "breakfast": true
      },
      "departure": "Barcelona",
      "flightDetails": {...},
      "hotelDetails": {...},
      "affiliateLinks": {
        "flight": "url",
        "hotel": "url"
      }
    }
  ]
}
```

## Notas Técnicas
- Frontend corriendo en puerto 3000
- Backend planeado para puerto 8001 con prefijo /api
- URLs de entorno configuradas en .env
- Hot reload habilitado para desarrollo

## Métricas de Éxito (KPIs Futuros)
- Tasa de conversión de búsquedas a clicks en afiliados: > 15%
- Tiempo promedio en sitio: > 3 minutos
- Búsquedas por sesión: > 2
- Tasa de retorno: > 30%

---
**Última Actualización**: Diciembre 2025
**Próxima Revisión**: Después de implementación de backend
