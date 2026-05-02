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
- ✅ **Home: 2 nuevas secciones** entre buscador y "¿Por qué Visítalo?":
  - `TripExamples.jsx` → "Mira lo que te vamos a montar" con 3 cards (Barcelona 2d, Roma 3d, Japón 10d), desglose por días con etiqueta y plan. Flags + región + badge de duración.
  - `Reviews.jsx` → "Gente como tú, viajando mejor" con 3 testimonios (5 estrellas verdes, nombres españoles + edad, meta destino·días, sin avatares, tono natural Gen Z).
  - Diseño consistente: rounded-2xl, hover:shadow-lg, hover:-translate-y-1, eyebrow verde, heading azul+verde. i18n ES/EN.
  - Borrados `ExampleTrips.jsx` y `Testimonials.jsx` antiguos (dead code con mock data).
- ✅ **P0 Fix ventana de carga modal popup**: `ItineraryLoading.jsx` reescrito como modal centrado (no full-screen). Overlay blur, card blanca, brújula + sparkles animados, mensajes rotativos ES/EN cada 1.8s, barra de progreso simulada (tope 94%), helper "Solo tardará unos segundos". Fade-in 260ms + pop-in cubic-bezier.
- ✅ **P0 Fix JSON truncado en viajes largos**: Gemini devolvía JSON inválido en itinerarios de 5+ días porque `maxOutputTokens=4096` cortaba la respuesta. Ahora se escala dinámicamente: `min(48000, 2500 + días*2500)`. Añadido `_repair_truncated_json` para recuperar JSONs cortados cerrando brackets. Retry automático con temperatura 0.3 y tokens duplicados si el primer parseo falla. Probado E2E: Paris 7 días → 200 OK en 42s.
- ✅ **P0 Fix "Error al generar el itinerario"**: Gemini estaba devolviendo 503 (modelo preview saturado). Añadido retry con backoff exponencial (3 intentos por modelo) + fallback en cascada: `gemini-flash-latest` → `gemini-2.5-flash`. Mapeo de `GEMINI_UNAVAILABLE` a HTTP 503 con mensaje amable. Toast diferenciado en frontend (503 vs 429 vs genérico). Borrado `AppNew.js` (código muerto).
- ✅ Reescritura completa copy Home Page Gen-Z / Millennial
- ✅ Botón "Buscar" → "¡Montar mi plan!"
- ✅ Páginas legales `/legal/terminos`, `/legal/privacidad`, `/legal/cookies` con sistema de tabs y contenido RGPD completo
- ✅ Fix Helmet `<title>` en Legal page (template literal)
- ✅ Rebranding total RutaBarata → Visitalo.es (comentarios, email `info@visitalo.es`, link X `x.com/visitalo`)
- ✅ Doble registro tonal: copy fresco Gen-Z en app (buscador "¿Cuándo llegas?/¿Cuándo vuelves?", CTA "Personalízalo", empty state "Aquí va a aparecer tu planazo ✨") + corporativo en Footer/Legal
- ✅ Limpieza de código muerto: eliminados `App_old.js`, `Hero.jsx`, `Benefits.jsx`
- ✅ **P0 sección PLUS condicional**: oculta para suscriptores de pago (`subscription_active`); CTA abre AuthModal si no auth, llama Stripe checkout si auth+no-sub
- ✅ **P1 Stripe Checkout (Fase 1 - one-off mensual)**: endpoints checkout-session + checkout-status + webhook + colección payment_transactions + polling post-redirect + activación idempotente +30 días
- ✅ **P2 i18n ES/EN**: `i18next` + `react-i18next` + `i18next-browser-languagedetector`. Archivos en `src/locales/{es,en}.json`. Selector en Header ES/EN (FR/IT eliminados) con persistencia en localStorage (`visitalo_lang`).
  - **TIER 1** (chrome principal): Header, Footer, HeroItinerary, ItinerarySearchBar, RangeDatePicker, WelcomePromoModal, AuthModal, CookieBanner, ItineraryTimeline, ItinerarySidebar, MyTrips, Route.
  - **TIER 2** (post-búsqueda y páginas secundarias): ActivityCard, HotelCard, DeleteConfirmPopover, ActivityInfoModal, AlternativesModal, ConfirmationModal, TotalPricePanel, ItineraryLoading, WelcomeModal, AuthCallback, BlogList, BlogPost, Legal (chrome — contenido legal se mantiene en ES por validez jurídica).
  - Validado E2E en los 2 idiomas.

### ⏭️ Pendiente opcional i18n
- `TravelDetailsModal` (859 líneas): modal de personalización avanzada con muchos campos de formulario. Si el usuario lo pide, se traduce en siguiente iteración.

## Backlog priorizado

### P1 — Monetización
- ✅ Fase 1: Pago único mensual 1€ que activa +30 días PLUS.
- ⏳ Fase 2: Migrar a Stripe Subscription recurrente cuando el usuario pase su key Stripe real.

### P2 — i18n (FASE 2 - componentes menores)
- Traducir componentes post-búsqueda: ActivityCard, HotelCard, ActivityInfoModal, AlternativesModal, TravelDetailsModal, TotalPricePanel, ConfirmationModal, DeleteConfirmPopover.
- Traducir páginas Blog (BlogList, BlogPost) y chrome de páginas Legal (el contenido legal se mantiene en ES siempre por validez jurídica).
- ItineraryLoading (mensajes de progreso durante generación).
- AuthCallback.

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

## Changelog reciente (Feb 2026 — sesión actual)
- ✅ Personalización del Hero: muestra "Visítalo todo, {name}." cuando el usuario está logueado (`hero.titleLine1WithName` ES/EN).
- ✅ TripExamples: nuevo CTA "Ver más destinos / View more destinations" enlazado a `/destinos` (ES) o `/destinations` (EN).
- ✅ Language Switcher con mapeo bidireccional ES↔EN para rutas localizadas (`/destinos`↔`/destinations` y los 10 itinerarios SEO con sus slugs traducidos). Implementado en `/app/frontend/src/utils/localizedPaths.js` y consumido por `Header.jsx`.
- ✅ **UX email duplicado en registro**: `AuthModal.jsx` ahora muestra banner inline rojo persistente cuando el backend devuelve 400 "El email ya está registrado", con CTA "Inicia sesión con este correo" que cambia a modo login conservando el email pre-rellenado. Traducciones ES/EN (`auth.emailAlreadyRegistered`, `auth.emailAlreadyRegisteredCta`). Verificado vía screenshot end-to-end.
- ✅ **Self-service Forgot Password**: nuevos endpoints `POST /api/auth/forgot-password` (genera token 1h, email vía Resend, respuesta neutra para no leak de cuentas) y `POST /api/auth/reset-password` (valida token, actualiza `password_hash`, marca `email_verified=True`, auto-login con session_token). Cuentas Google sin password_hash devuelven respuesta neutra. Plantilla email `forgot_password_email_html` añadida en `email_service.py`. Página frontend `/recuperar` y `/reset-password` (`ResetPassword.jsx`). Link "¿Olvidaste tu contraseña?" en modo login + segundo enlace dentro del banner de email duplicado. Traducciones ES/EN completas. Verificado end-to-end con curl: registro → forgot → reset → auto-login → vieja password rechazada → token reutilizado rechazado.
- ✅ **Recordar sesión 30 días**: `LoginRequest.remember_me: bool = False` en pydantic; `_create_session_for_user` ahora acepta `days` (default 7); `/login` usa 30 si `remember_me=true`. Frontend: checkbox "Mantenerme 30 días" / "Keep me signed in for 30 days" en modo login del `AuthModal`, junto al link de Forgot Password. `loginWithEmail(email, password, rememberMe)` en `AuthContext` reenvía la flag. Verificado: sesión de 7d sin flag, 30d con flag (consultado `expires_at - created_at` en `user_sessions`).

---
**Última Actualización**: Febrero 2026
