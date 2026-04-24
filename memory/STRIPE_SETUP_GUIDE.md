# Guía paso a paso Stripe — Suscripción PLUS 1€/mes

> Esta guía es para que la sigas tú sin saber nada de Stripe. Te lleva de la mano.
> Tiempo estimado: **20–30 minutos** (todo en modo test, sin cobros reales).
> Cuando la termines, me pasas 3 datos y yo hago el resto.

---

## 🎯 Qué vamos a conseguir

Hoy mismo tu web cobrará 1€ al mes a los suscriptores PLUS **de forma automática**, sin que tú tengas que hacer nada. Stripe se encarga de:
- Cobrar la tarjeta el primer día
- Volver a cobrar cada mes automáticamente
- Permitir a los usuarios cancelar desde un portal
- Avisar a tu backend cuando alguien paga o cancela

Todo lo probamos primero en **modo test** (tarjetas ficticias, sin dinero real). Cuando lo verifiquemos, activamos el modo live.

---

## ⏱️ PARTE 1 — Crear tu cuenta Stripe (5 min)

### 1.1 Registro
1. Abre en el navegador: **https://dashboard.stripe.com/register**
2. Pon tu **email** (usa uno al que tengas acceso fácil, por ejemplo `info@visitalo.es`).
3. **Nombre completo**: el tuyo.
4. **Contraseña**: una fuerte — guárdala en tu gestor de contraseñas.
5. Marca ambos checks (términos + no-soy-robot) y click en **Create account**.

### 1.2 Verifica el email
- Stripe te envía un email con un enlace "Verify your email". Cliquéalo.
- Vuelve al dashboard.

### 1.3 País y tipo de cuenta
- Te pedirá el país: **España**.
- Tipo de negocio: elige **Individual / Sole proprietor** (autónomo) **o** **Business** (sociedad) según tu caso.

> 💡 **Importante**: NO hace falta que completes todo el proceso de verificación (CIF, IBAN, etc.) ahora mismo. Puedes empezar a trabajar en **modo test** inmediatamente. Solo tendrás que verificar la cuenta cuando quieras activar el modo live (cobros reales).

### 1.4 Asegúrate de estar en modo TEST
En la parte **superior derecha** del dashboard verás un toggle que dice:

```
  [●] Test mode
```

**Déjalo activado en TEST**. Se pondrá naranja/amarillo. En modo test no se cobran tarjetas reales, solo las de prueba de Stripe (`4242 4242 4242 4242`).

Si ves el toggle apagado (gris), cliquéalo para activarlo.

---

## 🛍️ PARTE 2 — Crear el producto "Visitalo PLUS" (3 min)

### 2.1 Ve al catálogo
1. En el menú lateral izquierdo, busca **"Product catalog"** (o solo "Catalog").
2. Click en **Product catalog**.

> Si no lo ves en el menú: usa la barra de búsqueda superior (tecla `/`), escribe "products" y entra.

### 2.2 Crear el producto
1. Arriba a la derecha verás un botón **"+ Add product"**. Cliquéalo.
2. Rellena el formulario así:

| Campo | Qué poner |
|---|---|
| **Name** | `Visitalo PLUS` |
| **Description** (opcional) | `Suscripción PLUS mensual a Visitalo.es. Hoteles únicos, actividades premium y personalización ilimitada.` |
| **Image** (opcional) | Puedes subir tu logo `visitalo-logo.png` si quieres (se verá en la página de checkout) |

### 2.3 Configurar el precio (¡lo más importante!)
Más abajo, en la sección **Pricing**:

| Campo | Qué poner |
|---|---|
| **Pricing model** | `Standard pricing` |
| **Price** | `1.00` |
| **Currency** | `EUR` |
| **Type** | ⚠️ **`Recurring`** (si pone "One-time" cliquéalo para cambiarlo) |
| **Billing period** | `Monthly` |

### 2.4 Guardar
1. Abajo del todo, click en **Add product**.
2. Te redirigirá a la página del producto recién creado.

### 2.5 Copiar el Price ID
Aquí es donde la mayoría de la gente se pierde. **Léeme bien**:

1. En la página del producto, baja hasta la sección **Pricing** (o "Prices").
2. Verás una tabla con tu precio de 1,00 € / month.
3. En esa fila, al hacer hover o click en el precio, aparece un código que empieza por **`price_`** (ej: `price_1OqXyZ2eZvKYlo2Cabcdefgh`).
4. **Cópialo entero** a un bloc de notas. Lo apuntaremos como `STRIPE_PRICE_ID`.

> 🆘 ¿No lo encuentras? Ruta alternativa:
> - Dashboard → **Developers** (menú lateral abajo) → **API** → no, eso es otro.
> - Dashboard → **Product catalog** → click en tu producto "Visitalo PLUS" → scroll abajo → **"View pricing"** o similar.
> - Si sigues sin verlo, mándame un screenshot del panel y te lo busco.

> ⚠️ El Price ID es distinto del Product ID. El Product empieza por `prod_...`, el Price empieza por `price_...`. **Necesito el `price_`.**

---

## 🔑 PARTE 3 — Obtener tu API Key (2 min)

### 3.1 Ve a API keys
1. En el menú lateral, scroll hasta abajo y click en **"Developers"**.
2. Click en **"API keys"**.

### 3.2 Copiar la Secret Key
Verás dos claves en la sección **Standard keys**:

| Key | Qué es | Acción |
|---|---|---|
| **Publishable key** (`pk_test_...`) | Se usa en el frontend (pública, no pasa nada si se filtra) | No la necesitamos ahora |
| **Secret key** (`sk_test_...`) | Se usa en el backend (SECRETA) | ⚠️ **LA QUE NECESITAMOS** |

1. En la fila **Secret key**, click en **"Reveal test key"** (o similar).
2. Cópiala entera a tu bloc de notas. La apuntaremos como `STRIPE_API_KEY`.

> ⚠️ **MUY IMPORTANTE**: nunca compartas esta clave con nadie, ni la pongas en GitHub. Si alguien la consigue, puede cobrar con tu Stripe. Si crees que la has filtrado, en esta misma página hay un botón "Roll key" que la invalida y te da una nueva.

---

## 📡 PARTE 4 — Configurar el Webhook (5 min)

Un webhook es una "llamada que Stripe le hace a tu backend" cuando algo pasa (ej: un cliente paga, se da de baja, se cobra una renovación). Así tu web sabe en tiempo real quién tiene suscripción activa.

### 4.1 Ve a Webhooks
1. Menú lateral → **Developers** → **Webhooks**.

### 4.2 Crear el endpoint
1. Arriba a la derecha, click en **"+ Add endpoint"** (o "Add an endpoint").
2. Se abre un formulario. Rellena:

| Campo | Qué poner |
|---|---|
| **Endpoint URL** | `https://visitalo-production.up.railway.app/api/webhooks/stripe` |
| **Description** (opcional) | `Activación/renovación/cancelación PLUS` |

> ⚠️ **Verifica la URL**: si tu backend Railway tiene otro dominio, reemplaza `visitalo-production.up.railway.app` por el tuyo. Puedes verlo en Railway → tu proyecto → Settings → Domains.

### 4.3 Seleccionar eventos
Debajo de la URL hay una sección **"Select events to listen to"**. Click en **"Select events"** (o "+ Select events").

Se abre un listado enorme. Usa el buscador y marca **exactamente estos 4**:

- [x] `checkout.session.completed` — cuando alguien completa el alta de suscripción
- [x] `invoice.payment_succeeded` — cuando se cobra la renovación mensual
- [x] `customer.subscription.updated` — cambios en la suscripción (plan, método de pago...)
- [x] `customer.subscription.deleted` — cuando alguien cancela y termina el periodo

> ✅ Asegúrate de que SOLO esos 4 están marcados. Si marcas más, no rompe nada pero recibirás ruido.

Click en **"Add events"**.

### 4.4 Crear el endpoint
Click abajo en **"Add endpoint"**. Te lleva a la página del webhook recién creado.

### 4.5 Copiar el Signing Secret
En la página del endpoint:
1. Busca una sección que dice **"Signing secret"** o **"Endpoint secret"**.
2. Click en **"Click to reveal"** o **"Reveal"**.
3. Cópialo entero. Empieza por **`whsec_...`** y es largo.
4. Lo apuntaremos como `STRIPE_WEBHOOK_SECRET`.

---

## 📋 PARTE 5 — Checklist: ¿tienes ya los 3 valores?

Revisa tu bloc de notas. Deberías tener esto:

```
STRIPE_API_KEY=sk_test_51N...xxxxx... (empieza por sk_test_)
STRIPE_PRICE_ID=price_1OqX...xxxxx... (empieza por price_)
STRIPE_WEBHOOK_SECRET=whsec_abc...xxxxx... (empieza por whsec_)
```

### Si te falta alguno:
- ❌ **Falta `STRIPE_API_KEY`** → vuelve a PARTE 3.
- ❌ **Falta `STRIPE_PRICE_ID`** → vuelve a PARTE 2.5.
- ❌ **Falta `STRIPE_WEBHOOK_SECRET`** → vuelve a PARTE 4.5.

---

## 📤 PARTE 6 — Pasármelos

Cuando los tengas los 3, mándamelos en un mensaje así:

```
STRIPE_API_KEY=sk_test_xxxx
STRIPE_PRICE_ID=price_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
```

> 🔒 Te los puedo configurar aquí en preview. Cuando despliegues a producción, los meteré también en Railway (o te explico cómo hacerlo tú).

---

## 🔧 PARTE 7 — Yo migro el código (lo hago yo)

Con esos 3 valores, yo:
1. Actualizo `/app/backend/routes/stripe_routes.py` para usar `mode='subscription'` y `line_items=[{price: STRIPE_PRICE_ID, quantity: 1}]`.
2. Añado verificación de firmas del webhook con `STRIPE_WEBHOOK_SECRET`.
3. Añado manejo de los 4 eventos:
   - `checkout.session.completed` → activa PLUS, guarda `stripe_customer_id`
   - `invoice.payment_succeeded` → extiende suscripción (renovación)
   - `customer.subscription.updated` → sincroniza estado
   - `customer.subscription.deleted` → `subscription_active=false` al final del periodo
4. Añado un "Portal del cliente" para que los suscriptores puedan cancelar desde su cuenta.

---

## ✅ PARTE 8 — Verificación E2E (lo hacemos juntos)

Una vez migrado el código:

### 8.1 Tarjetas de prueba Stripe
En modo test, úsalas para simular distintos escenarios:

| Tarjeta | Qué simula |
|---|---|
| `4242 4242 4242 4242` | Pago exitoso estándar |
| `4000 0025 0000 3155` | Pago que requiere 3D Secure (autenticación SMS, muy común en Europa) |
| `4000 0000 0000 9995` | Pago rechazado por fondos insuficientes |

- **CVC**: cualquier número de 3 dígitos (`123`)
- **Fecha**: cualquier fecha futura (`12/34`)
- **Código postal**: cualquiera (`28001`)

### 8.2 Flujo completo que probaremos
1. Entra a https://barato-planner.preview.emergentagent.com/ (o visitalo.es si ya está deployed).
2. Crea una cuenta nueva con un email de test.
3. Scroll a la sección PLUS → click **"Unirme a PLUS"**.
4. Te lleva a Stripe Hosted Checkout.
5. Pon `4242 4242 4242 4242`, CVC `123`, fecha `12/34`.
6. Confirma el pago.
7. Stripe te redirige de vuelta a `/misviajes`.
8. Verás un toast verde: **"¡Bienvenido a PLUS!"**.
9. La sección PLUS del Home desaparece.

### 8.3 Verificar en Stripe Dashboard
1. Dashboard Stripe → **Customers** (menú lateral).
2. Verás tu usuario con una suscripción **activa**.
3. Click en el customer → **Subscriptions** → verás "Visitalo PLUS — 1,00 EUR/mo — Active".
4. Siguiente cobro: exactamente dentro de 1 mes (`next invoice`).

### 8.4 Simular una renovación (sin esperar 1 mes)
Desde el dashboard Stripe:
1. Customers → tu cliente → Subscriptions → click en la suscripción.
2. Arriba a la derecha hay un menú **"..."** → **"Update subscription"** → **"Advance cycle"** (o "Simular renovación" / "Next cycle").
3. Stripe ejecuta una renovación fake. Tu backend recibirá el webhook `invoice.payment_succeeded`.
4. El `subscription_expires_at` del usuario se extiende otro mes.

### 8.5 Simular una cancelación
1. Customer → Subscriptions → click en la suscripción → botón **"Cancel subscription"**.
2. Elige: "Cancel immediately" o "Cancel at period end".
3. Tu backend recibirá `customer.subscription.deleted`.
4. El usuario sigue siendo PLUS hasta el final del periodo ya pagado.

---

## 🚀 PARTE 9 — Pasar a producción (cobros reales) cuando tú decidas

Cuando estés listo:

1. En el dashboard Stripe: **Activate your account** → completa verificación KYC:
   - CIF/NIF + datos fiscales
   - IBAN donde recibir los cobros (Stripe cobra en tu banco a los 2–7 días)
   - DNI tuyo (para verificar identidad)
2. Una vez activada, el toggle superior derecho te deja cambiar a **Live mode**.
3. **OJO**: en Live mode tienes OTRAS keys distintas (`sk_live_...`, `whsec_...` diferentes, y otro Price ID).
4. Repite las PARTES 2, 3 y 4 en live mode para conseguir las keys de producción.
5. Me las pasas igual que antes y cambio los env vars en Railway (test → live).
6. ¡A facturar! 💰

---

## 🆘 Problemas frecuentes y soluciones

### "No me sale el toggle de test mode"
Asegúrate de que tu navegador no esté bloqueando cookies/JS de stripe.com. Prueba en modo incógnito.

### "El checkout de Stripe dice que la tarjeta no es válida"
En modo test SOLO funcionan las tarjetas de prueba. Si usas una tarjeta real, Stripe la rechaza. Usa `4242 4242 4242 4242`.

### "No me aparece el webhook en ningún sitio"
A veces el menú es **Developers → Webhooks → Your endpoints**. Si sigue sin salir, usa la búsqueda (`/`) y escribe "webhooks".

### "Stripe me pide más información para activar la cuenta"
Eso solo aplica para modo LIVE. Para modo test puedes ignorarlo de momento.

### "Me he equivocado con un dato ya creado"
- **Precio mal configurado**: archiva el producto y créalo de nuevo. En Stripe no se pueden editar precios, solo archivar y crear nuevos.
- **Webhook con URL mal**: puedes editar el endpoint desde su página.
- **API key filtrada**: click en "Roll key" (rotar key) y te da una nueva, invalidando la vieja.

### "¿Los cobros de modo test aparecen en mi extracto?"
No. Modo test es 100% simulado. No se mueve ni un céntimo hasta que cambies a Live mode.

---

## 📞 Si te atascas

Manda un screenshot del panel donde estés perdido y te digo exactamente dónde hacer click. No hay prisa, esto lo hacemos a tu ritmo.
