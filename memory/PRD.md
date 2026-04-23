# Visitalo.es — Product Requirements Document

## Visión General
**Producto**: Visitalo.es — Planificador de viajes con IA + marketplace de actividades (estilo Booking) para turistas Gen-Z / Millennial.
**Claim**: "Visítalo todo. No te pierdas nada."
**Dominio producción**: https://visitalo.es (Vercel + Railway + MongoDB Atlas)

## Tech Stack
- Frontend: React 19, Tailwind, Shadcn UI, react-router-dom, react-helmet-async, @react-oauth/google
- Backend: FastAPI, Motor, google-auth, bcrypt, PyJWT
- Deploy: Vercel (FE), Railway (BE), MongoDB Atlas

## Estructura Home (Febrero 2026)
1. **Hero** — H1 "Visítalo todo. No te pierdas nada.", buscador horizontal (destino, fechas, Personalizar, ¡Montar mi plan!)
2. **3 Pilares** — Rapidez / Curación PRO / Personalización, tono Gen-Z
3. **Únete a PLUS (Modo Dios)** — Upsell 1€/mes con preview card visual
4. **Actividades Hook** — "Más que ver. Para vivir." + grid de actividades mock
5. **Itinerario** (post búsqueda) — Timeline responsive
6. **Footer** — blanco, links legales funcionales

## Rutas
- `/` Home
- `/blog`, `/blog/:slug` SEO blog
- `/misviajes` Dashboard usuario autenticado (trips guardados)
- `/legal/terminos`, `/legal/privacidad`, `/legal/cookies` — Páginas legales con tabs

## Auth
- Email/Password (bcrypt) + Google Identity Services nativo
- 5 búsquedas PLUS gratis al registrarse, auto-downgrade a Basic al agotarse

## Integraciones
- Google Identity Services OAuth (configurado)
- Google Gemini AI (**MOCK MODE ACTIVO**, `USE_MOCK_DATA=true`)

## Cambios recientes (Febrero 2026)
- ✅ Reescritura completa copy Home Page Gen-Z / Millennial ("Visítalo todo. No te pierdas nada.", pilares nuevos, PLUS "Modo Dios", Activities hook)
- ✅ Botón "Buscar" → "¡Montar mi plan!"
- ✅ Creadas páginas legales `/legal/terminos`, `/legal/privacidad`, `/legal/cookies` con sistema de tabs y contenido RGPD completo
- ✅ Fix Helmet <title> en Legal page (template literal)

## Backlog priorizado

### P1 — Monetización
- **Stripe**: integrar suscripción PLUS 1€/mes (usar `integration_playbook_expert_v2`). Test key ya disponible en el pod.
- Flujo: tras agotar 5 búsquedas PLUS → modal upsell → checkout Stripe → webhook → marcar plan `plus` en Mongo.

### P2 — Core
- Desactivar Mock Mode de Gemini cuando el usuario esté listo para consumir créditos API.
- Integrar APIs reales de actividades (Civitatis / Viator).

### P3 — Internacionalización
- i18n real (selector de idioma actual no traduce nada). Usar `react-i18next` con ES/EN/FR/IT.

### P4 — SEO / Growth
- Más posts en el blog (Markdown)
- Páginas destino específicas `/destino/[ciudad]`

## Archivos clave
- `/app/frontend/src/components/HeroItinerary.jsx` (Home completa)
- `/app/frontend/src/components/ItinerarySearchBar.jsx` (botón "¡Montar mi plan!")
- `/app/frontend/src/pages/Legal.jsx` (legal con tabs)
- `/app/frontend/src/App.js` (routes)
- `/app/frontend/src/components/Footer.jsx` (links legales)
- `/app/backend/routes/auth_routes.py`, `/app/backend/routes/trips_routes.py`

## Notas críticas para próximo agente
- **NO EDITAR GITHUB DIRECTO**. Usar "Save to Github" en Emergent. Repo es público (Vercel auto-deploy).
- **MOCK MODE ACTIVO**: no cambiar `USE_MOCK_DATA` sin confirmar con usuario.
- **Auth**: cualquier cambio → llamar `integration_playbook_expert_v2` primero.
- **Test credentials**: `/app/memory/test_credentials.md` (demo@visitalo.es).

---
**Última Actualización**: Febrero 2026
