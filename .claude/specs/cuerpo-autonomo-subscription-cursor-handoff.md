# Handoff para Cursor — Cuerpo Autónomo por suscripción

> Pegar este texto completo como prompt inicial en Cursor. Da todo el contexto necesario sin
> depender de una conversación previa.

## ⚠️ Actualización — bug real encontrado y corregido en `regenerateSuscripcionPaymentLinks`

Después del handoff original, se verificó todo el flujo en dev con precio final $49/mes + $147
cada 4 meses (3× mensual). Se encontró y corrigió un bug real en
`src/app/api/product/regenerateSuscripcionPaymentLinks/route.ts`:

**Síntoma:** el endpoint respondía `200` con Payment Links y montos nuevos y correctos (Stripe
los creaba de verdad), pero el campo `cursoConfig` nunca quedaba persistido en Mongo — una
relectura inmediata (incluso desde dentro del mismo request, incluso con `Model.updateOne()` en
vez de `document.save()`) seguía mostrando el valor viejo.

**Causa aislada (probada exhaustivamente):** el endpoint arranca leyendo `product.cursoConfig`
vía Mongoose (`Product.findById`/`findOne`), que devuelve un **subdocumento vivo de Mongoose**, no
un objeto plano. Ese `cursoConfig` se spreadea (`{...cursoConfig, planes: {...}}`) para armar el
objeto a guardar — pero un spread superficial de un subdocumento de Mongoose no lo "desmongoosea"
del todo: las ramas anidadas que no se tocan explícitamente siguen siendo instancias vivas de
Mongoose. Al reasignar eso a `product.cursoConfig` (con `.set()` o asignación directa) y llamar
`.save()` — o incluso al hacer `Product.updateOne()` con ese mismo objeto mixto — el tracking de
cambios de Mongoose para el `DocumentArray` anidado (`cursoConfig.planes.opcionesPago`)
específicamente queda corrupto y la escritura no se persiste, sin tirar ningún error.

Se confirmó con un driver nativo de MongoDB (`mongoose.connection.db.collection('products')`,
sin pasar por la capa de Mongoose) que las mismas escrituras SÍ persisten sin problema.

**Fix aplicado (ya en el archivo):**
- La lectura inicial de `cursoConfig` (para armar la base del merge) ahora también usa el driver
  nativo (`mongoose.connection.db.collection('products').findOne(...)`) en vez de
  `product.cursoConfig` de Mongoose.
- La escritura final usa `collection.updateOne({_id}, {$set: {...}})` con el driver nativo, en vez
  de `product.set(...) + product.save()`.

**Por qué esto no afecta a `createProduct/route.js` / `updateProduct/route.js`:** esos handlers
arman `cursoConfigParaGuardar` **desde cero a partir del body de la request** (JSON plano de
`req.json()`), nunca spreadean un `cursoConfig` que salió de un documento de Mongoose ya cargado —
por eso no pisan el mismo problema. **Ojo con replicar el patrón de
`regenerateSuscripcionPaymentLinks` (leer `product.algo`, spreadearlo, reasignarlo, `.save()`) en
cualquier endpoint nuevo que edite `cursoConfig`** — mejor seguir el patrón de `createProduct`
(objeto armado desde el body) o el driver nativo si hay que leer-modificar-escribir a partir de un
documento existente.

**Para producción:** el fix ya está en el código, se lleva solo. No hace falta ningún paso manual
adicional — pero si en producción aparece el mismo síntoma (respuesta 200 con datos que no
persisten) en **cualquier otro endpoint** que haga `documento.save()` después de spreadear un
campo ya cargado de Mongo, es la misma causa — aplicar el mismo fix (driver nativo para leer y
escribir ese campo puntual).

## Contexto del negocio

"Cuerpo Autónomo" es un curso de esta plataforma (Next.js + MongoDB/Mongoose + Stripe/MercadoPago)
que hasta ahora se vendía como **pago único**. Se está agregando la opción de venderlo (y a
cualquier otro curso, a futuro) como **suscripción recurrente por Stripe**, manteniendo intacto el
flujo de pago único para todo lo demás.

Ya se implementó una primera versión completa de esto en una sesión anterior. Este documento es
el resumen de esa implementación + **un requisito nuevo que falta agregar**. El pedido concreto
para vos: revisar el flujo de punta a punta, confirmar que lo ya hecho está bien, e implementar
lo que falta.

## Qué ya está implementado (sesión anterior)

### Modelo de datos

- **`src/models/productModel.js`**: nuevo campo `esSuscripcion: { type: Boolean, default: false }`
  a nivel de producto (mismo patrón que el ya existente `esProgramaTransformacional`). Si es
  `true` y `tipo === 'curso'`, el curso se vende por suscripción; si es `false` (default), pago
  único como siempre.
- **`src/models/userModel.js`**:
  - Se **eliminó por completo** el campo viejo `subscription` (y su `subscriptionSchema`) que
    vivía en el usuario — era un concepto global de "membresía" mal ubicado, no correspondía a
    ningún curso en particular, y no se usa más. **No lo reintroduzcas si lo ves referenciado en
    algún lado** — son referencias muertas de un sistema anterior (ver sección "Pendiente" abajo).
  - El array `cursosAdquiridos` (ya existía, es donde se guarda qué productos tiene cada usuario)
    se extendió con:
    ```js
    source: { type: String, enum: ['compra_unica', 'suscripcion', 'manual', 'beta'], default: 'compra_unica' },
    status: { type: String, enum: ['active', 'expired', 'revoked'], default: 'active' },
    expiresAt: { type: Date, default: null }, // solo aplica a source:'suscripcion'
    stripeSubscriptionId: { type: String },   // solo aplica a source:'suscripcion'
    ```
  - Idea central: el acceso a un curso ya no es "lo compró alguna vez" — ahora es "tiene una
    entrada vigente en `cursosAdquiridos`", sin importar si vino de compra única, suscripción
    activa, o un otorgamiento manual/beta.

### Control de acceso

- **`src/lib/courseAccess.ts`**: `userHasPurchasedCourse` ahora chequea `status === 'active'` y
  `expiresAt` (si existe, debe ser futuro). `userHasCourseAccess` sigue con el bypass de Admin.
- **`src/lib/userHasCuerpoAutonomo.ts`**: corregido para usar `userHasCourseAccess` (con bypass
  Admin) en vez de la variante sin bypass que tenía antes.

### Fulfillment (otorgar acceso)

- **`src/app/api/payments/course/fulfillCoursePurchase.ts`**:
  - La función existente `fulfillCoursePurchase` ahora acepta parámetros opcionales `source`,
    `expiresAt`, `stripeSubscriptionId` — si no se pasan, se comporta exactamente igual que antes
    (compra única). Se usa tanto para pago único como para el primer pago de una suscripción.
  - Nueva función `updateCourseSubscriptionStatus({ stripeSubscriptionId, status, expiresAt })`:
    busca al usuario por `cursosAdquiridos.stripeSubscriptionId`, actualiza esa entrada. La usan
    los webhooks de renovación/cancelación/expiración — nunca crea una entrada nueva.

### Checkout de Stripe

- Los cursos en este proyecto **no usan Checkout Sessions dinámicas** — usan **Payment Links**
  estáticos de Stripe, creados una sola vez al crear el producto (`stripe.paymentLinks.create`),
  guardados en `cursoConfig.planes.opcionesPago`. El webhook resuelve el `productId` leyendo el
  metadata del Payment Link (`resolveStripeCheckoutProductId` en
  `src/lib/handleStripeCourseCheckout.ts`) — **no cambiar este mecanismo por Checkout Sessions
  dinámicas**, es intencional y ya funciona así para pago único.
- **`src/app/api/payments/stripe/createCourseOneTimePayments.ts`**: nuevas funciones
  `createStripeCourseSubscriptionPaymentLink` y `createCourseSubscriptionPayments`, gemelas de las
  ya existentes `createStripeCoursePaymentLink`/`createCourseOneTimePayments` pero creando un
  **Price recurrente** (`recurring: { interval: 'month' }`) en vez de un Price único. Un Payment
  Link de Stripe con un Price recurrente se convierte automáticamente en checkout
  `mode:'subscription'` — no hace falta tocar nada más para que eso funcione.
- **`buildCursoOpcionesPago`** (mismo archivo) ahora acepta un flag `esSuscripcion` para ajustar el
  copy de la opción de Stripe ("Suscribirme" / "Suscripción mensual..." en vez de "Empezar AHORA" /
  "Pago único...").
- **`src/lib/handleStripeCourseCheckout.ts`**: `handleStripeCourseCheckoutCompleted` ahora detecta
  `session.mode === 'subscription'`, obtiene `current_period_end` de Stripe, y llama a
  `fulfillCoursePurchase` con `source:'suscripcion'`.
- **`src/app/api/payments/stripe/stripe-webhook/route.ts`**: reescrito. Ya NO tiene ninguna lógica
  de "membership"/bitácora/onboarding/emails de cancelación — eso se sacó a propósito (ver
  "Pendiente"). Ahora:
  - `checkout.session.completed` → `handleStripeCourseCheckoutCompleted(session)` siempre (sin
    branch de `type==='membership'`).
  - `customer.subscription.updated` → si el status de Stripe es `canceled`/`unpaid`/
    `incomplete_expired`, marca `expired`; si no, `active` con el `expiresAt` actualizado (esto
    cubre tanto renovaciones como el caso "canceló pero sigue vigente hasta fin de período",
    porque Stripe mantiene `status:'active'` con `cancel_at_period_end:true` hasta esa fecha).
  - `customer.subscription.deleted` → marca `expired`.

### Admin (creación/edición de curso)

- **`src/app/api/product/createProduct/route.js`** y **`updateProduct/route.js`**: agregado
  `esSuscripcion` a la desestructuración del body y al objeto que se persiste (⚠️ este proyecto
  no acepta el body arbitrario, cada campo nuevo se tiene que agregar a mano en ambos handlers —
  ya está hecho para `esSuscripcion`, pero tenelo en cuenta para cualquier campo nuevo que agregues
  vos).
  - En `createProduct/route.js`, cuando `tipo==='curso'` y `esSuscripcion===true`: usa
    `createCourseSubscriptionPayments` en vez de `createCourseOneTimePayments`, fuerza
    `proveedores = ['stripe']` (dLocal/MercadoPago no generan links para cursos por suscripción,
    solo Stripe soporta recurrencia acá), y saltea la generación de precios de preventa
    (`generateCursoPreciosPreventaLinks`) porque no tiene sentido mezclarlo con suscripción.
- **`src/components/PageComponent/Products/CreateProductStep1.tsx`** /
  **`CreateProduct.tsx`** y **`EditProductStep1.tsx`** / **`EditProduct.tsx`**: checkbox "Vender
  por suscripción mensual (en vez de pago único)" ubicado justo debajo del selector de "Tipo de
  producto" (visible solo si `tipo==='curso'`). En edición, hay un texto aclarando que tocar el
  toggle en un curso ya publicado **no regenera** el Payment Link existente (habría que hacerlo a
  mano si se quiere cambiar el modelo de un curso ya en producción).
- **`typings.d.ts`**: agregado `esSuscripcion?: boolean` a la interfaz `ProductDB`.

## ⚠️ Requisito nuevo que falta implementar

**El plan de suscripción de un curso debe tener 2 precios, no 1:**

1. **Mensual**: el precio base que carga el admin (el que ya existe hoy).
2. **Cada 4 meses**: el precio de **3 meses** (paga 3, se lleva 4 — un mes gratis), facturado cada
   4 meses. Ejemplo: si el mensual es $30, el de 4 meses es $90 (3 × $30) facturado una vez cada 4
   meses — no $120.

### Cómo encararlo (lo que se llegó a analizar, sin implementar)

**Backend — Stripe (`createCourseOneTimePayments.ts`):**
- `createStripeCourseSubscriptionPaymentLink` hoy crea UN Price con `recurring: { interval:
  'month' }`. Hay que generalizarla (o duplicarla) para poder crear también un segundo Price con
  `recurring: { interval: 'month', interval_count: 4 }` y `unit_amount` = 3× el monto mensual.
- `createCourseSubscriptionPayments` debería crear **ambos** Prices/Payment Links y devolver los
  dos (hoy devuelve uno).
- `buildCursoOpcionesPago` (o una función nueva específica para suscripción) tiene que producir
  **2 entradas** en `opcionesPago` en vez de 1.

**Modelo (`productModel.js` → `cursoPlanPagoSchema`):**
- Hoy esta sub-schema no tiene ningún campo para distinguir "mensual" de "cada 4 meses" dentro del
  mismo `proveedor:'stripe'`. Se recomienda agregar algo como
  `intervaloMeses: { type: Number, default: 1 }` (1 = mensual, 4 = cada 4 meses) para poder
  diferenciarlos sin romper nada de lo existente (default 1 = comportamiento actual).

**Frontend — esto es lo más importante que encontramos, y todavía no tiene solución:**

- **`src/components/PageComponent/Products/CursoProductDetails.tsx`** (vista de admin): renderiza
  `opcionesPago.map(...)` usando **`key={plan.proveedor}`** (línea ~175). Con 2 entradas
  `proveedor:'stripe'` (mensual + 4 meses), React va a tener **keys duplicadas** — hay que cambiar
  la key a algo único por entrada (ej. `plan.stripePriceId` o el índice del map).
- **`src/components/PageComponent/Course/CoursePlans.tsx`** (la pantalla real de compra del
  curso, la que ve el usuario final): la función `renderPlans()` (línea ~679) hace
  **`const displayCheckoutPlan = activeCheckoutPlans[0]`** — es decir, **hoy solo se muestra
  y usa la PRIMERA opción de pago del curso, siempre**, sin importar cuántas haya. Además arma el
  objeto `displayPlan` con **`frequency_label: 'Pago único'` hardcodeado** (línea ~697) — así que
  ni siquiera para un curso por suscripción de un solo precio dice hoy "suscripción", dice "pago
  único" en la UI aunque por atrás sea recurrente.
  - Esto significa que agregar el segundo precio (4 meses) **no es solo un cambio de backend** —
    hay que rediseñar esta parte para: (a) mostrar ambas opciones cuando el curso es por
    suscripción, (b) dejar que el usuario elija una, y (c) que el copy diga "Mensual" / "Cada 4
    meses (ahorrás 1 mes)" en vez de "Pago único" cuando corresponda.
  - Recomendación: cuando `landing.cursoConfig` (o el producto) indique `esSuscripcion:true`,
    renderizar las N opciones de `activeCheckoutPlans` como cards seleccionables (reusando
    `PlanCard`/`PriceReferenceCard` que ya existen en este mismo archivo), en vez de forzar
    `[0]`. Cuando `esSuscripcion:false`, dejar el comportamiento actual intacto (un solo plan,
    "Pago único").

### Cosas a NO tocar en esta tarea

- **`src/components/PageComponent/Course/CoursePlans.tsx`** también maneja, en el mismo archivo, un
  flujo completamente distinto y viejo: un selector de `Plan` (modelo `planModel.js`, sistema de
  "membresía" por dLocal, funciones `handleSelect`/`monthlyPlan`/`annualPlan`/`displayPlan` con
  minúscula, líneas ~106-230). **Es un sistema separado y no relacionado a lo de Cuerpo
  Autónomo** — no lo confundas con `activeCheckoutPlans`/`renderPlans()` (que sí es lo relevante
  acá), y no lo toques a menos que se pida explícitamente.

## Pendiente de una limpieza previa (no bloquea esto, pero dales una mirada)

Al eliminar `user.subscription` se encontró que 4 endpoints viejos, de ese mismo sistema de
membresía por dLocal, todavía lo leen:
- `src/app/api/payments/validateSubscription/route.js`
- `src/app/api/payments/createPaymentToken/route.js`
- `src/app/api/payments/cancelSubscription/[id]/route.js`
- `src/app/api/payments/stripe/createPaymentURL/route.js`

No rompen nada (están dentro de `try/catch`, devuelven error o "sin suscripción" en vez de tirar
un 500 sin manejar), pero conviene limpiarlos o eliminarlos en algún momento — quedaron fuera de
alcance de la sesión anterior.

Además, en producción se detectó un bug de otro sistema (no de esto): 13 usuarios distintos tenían
pegado el mismo ID de suscripción de Stripe por un error en cómo se buscaba la suscripción por
email. Esos 20 usuarios (13 + otros 7 con datos raros) quedaron sin acceso automático a propósito,
a la espera de revisión manual — no es parte de esta tarea, solo contexto por si aparece algo
relacionado.

## Qué te pedimos concretamente

1. Recorré el flujo completo: toggle en el admin → creación del producto → generación de
   Price/Payment Link en Stripe → webhook → `cursosAdquiridos` → gate de acceso (`courseAccess.ts`)
   → qué ve el usuario en la landing del curso. Confirmá que lo ya implementado (arriba) está bien
   armado y no dejaste pasar nada raro.
2. Implementá el precio de 4 meses (3× mensual, ahorra 1 mes) como se describe arriba: backend
   (Stripe + schema) y frontend (arreglo de `CoursePlans.tsx` y `CursoProductDetails.tsx`).
3. Si encontrás algo que corregir en lo ya hecho, corregilo — está pedido explícitamente que
   "toques lo que haga falta".
