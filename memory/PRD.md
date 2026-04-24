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
- ✅ Reescritura completa copy Home Page Gen-Z / Millennial
- ✅ Botón "Buscar" → "¡Montar mi plan!"
- ✅ Páginas legales `/legal/terminos`, `/legal/privacidad`, `/legal/cookies` con sistema de tabs y contenido RGPD completo
- ✅ Fix Helmet `<title>` en Legal page (template literal)
- ✅ Rebranding total RutaBarata → Visitalo.es (comentarios, email `info@visitalo.es`, link X `x.com/visitalo`)
- ✅ Doble registro tonal: copy fresco Gen-Z en app (buscador "¿Cuándo llegas?/¿Cuándo vuelves?", CTA "Personalízalo", empty state "Aquí va a aparecer tu planazo ✨") + corporativo en Footer/Legal
- ✅ Limpieza de código muerto: eliminados `App_old.js`, `Hero.jsx`, `Benefits.jsx`
- ✅ **P0 sección PLUS condicional**: oculta para suscriptores de pago (`subscription_active`); CTA abre AuthModal si no auth, llama Stripe checkout si auth+no-sub (validado en los 3 estados)
- ✅ **P1 Stripe Checkout (Fase 1 - one-off mensual)**: `POST /api/stripe/checkout-session` + `GET /api/stripe/checkout-status/{session_id}` + webhook `/api/webhooks/stripe` + colección `payment_transactions`. Polling post-redirect en `/misviajes`. Modo dev: el proxy Emergent no soporta retrieve, se confía en el redirect de Stripe. Idempotente (no doble activación). E2E validado en preview.

## Backlog priorizado

### P1 — Monetización (EN CURSO)
- ✅ Fase 1: Pago único mensual 1€ que activa +30 días PLUS.
- ⏳ Fase 2: Migrar a Stripe Subscription recurrente cuando el usuario pase su key Stripe real (ver `test_credentials.md` sección "Fase 2").

### P2 — Internacionalización ES / EN
- Quitar opciones FR/IT del selector de idioma. Implementar i18n real con `react-i18next`. Traducir toda la web (Home, buscador, benefits, PLUS, actividades, blog, legal, footer, sidebar, timeline, modales de auth y personalización).

### P3 — Core
- Desactivar Mock Mode de Gemini cuando el usuario esté listo para consumir créditos API.
- Integrar APIs reales de actividades (Civitatis / Viator).

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
