# Cuerpo Autónomo: de curso comprado a suscripción — análisis de arquitectura

> **v3 — YA IMPLEMENTADO.** Este documento empezó como un análisis previo a escribir código.
> Ese código ya se escribió, se probó y se aplicó en dev y producción (incluida una migración de
> datos reales). Lo que sigue abajo es el análisis original que guio la implementación — para el
> estado actual y qué quedó pendiente, leer primero el resumen simple de la siguiente sección.

---

## Resumen simple (sin tecnicismos)

**¿Cuál era el problema?**
El curso "Cuerpo Autónomo" se vendía como compra única. Se pidió que además pueda venderse por
suscripción mensual. El sistema viejo de suscripción vivía "pegado" al usuario en general (no al
curso), estaba mezclado con otro sistema de pagos viejo, y **nunca se conectaba con el acceso real
al contenido**: alguien podía estar pagando la suscripción todos los meses y aun así no tener
acceso a las clases del curso.

**¿Qué se hizo?**
1. Ahora cualquier curso se puede marcar como "por suscripción" o "pago único" desde el panel de
   admin, con un simple interruptor al crear o editar el curso (por ahora, activado únicamente en
   Cuerpo Autónomo).
2. Se rehízo cómo el sistema decide si alguien tiene acceso a un curso. Antes era solo "lo compró
   alguna vez". Ahora puede ser: lo compró una vez, está suscripto y sigue vigente, se lo dieron a
   mano, o tiene acceso beta. Ese acceso queda pegado al curso puntual, no a un campo genérico del
   usuario.
3. Se conectó el pago recurrente de Stripe con el acceso real: cuando alguien se suscribe, paga la
   cuota siguiente, cancela, o se le vence la suscripción, el sistema actualiza solo si puede ver
   el curso o no. Antes esto no pasaba.
4. Se borró el campo viejo de "suscripción" que vivía en cada usuario — ya no se usa para nada,
   todo lo nuevo vive en el curso correspondiente.
5. Se sacó toda la lógica vieja de bitácora/onboarding/comunidad que estaba pegada a ese campo
   (ya no se quería mantener) — quedó solo lo pedido: el acceso al contenido (biblioteca).

**El hallazgo importante en producción, antes de borrar nada:**
Se revisó quién tenía ese campo viejo activo. Aparecieron 20 personas marcadas como "suscripción
activa" — pero **13 de ellas, dadas de alta en fechas distintas, tenían pegado exactamente el
mismo ID de suscripción de Stripe**. Eso es un bug de otro sistema, no de esta feature (al buscar
la suscripción de alguien por su email, probablemente agarraba por error la de otra persona). No
se le puede dar acceso automático a nadie de ese grupo sin saber, caso por caso, quién es el que
realmente paga esa suscripción.

**Qué se hizo con esos 20 usuarios:**
Antes de borrar nada, se guardó una copia de seguridad de los datos de suscripción de los 38
usuarios que tenían ese campo (incluye a los 20 activos). El campo ya está borrado en dev y en
producción. Los 20 quedaron **sin acceso automático** — hay que revisar a mano en el dashboard de
Stripe quién es el suscriptor real en cada caso y otorgarle el acceso manualmente.

> ⚠️ **La copia de seguridad se guardó en una carpeta temporal de esta sesión, no en el proyecto.**
> Puede borrarse sola cuando termine la sesión. Conviene guardarla en un lugar seguro (no en el
> repo de Git, porque tiene emails reales de usuarios) antes de que eso pase.

**Qué queda pendiente:**
- Revisar a mano esos 20 casos y darles acceso si corresponde.
- 4 endpoints viejos de un sistema de membresía que ya no se usa (`validateSubscription`,
  `createPaymentToken`, `cancelSubscription`, `createPaymentURL`) todavía mencionan el campo
  borrado. No rompen nada (están protegidos y responden un error prolijo), pero conviene
  limpiarlos o borrarlos del todo más adelante.
- Todo lo demás — el interruptor en el admin, la generación del link de pago recurrente, la
  conexión con Stripe, y el control de acceso — ya está implementado y andando.

---

## 1. Arquitectura actual relevante

### 1.1 Lo que existe hoy: un campo de suscripción global mal ubicado

**A) `user.subscription` — hoy vive en el usuario, debería vivir en la relación usuario↔producto**

- `userModel.js` → campo `subscription` (schema `subscriptionSchema`): `id`, `planId`, `status`, `active` (bool), `isCanceled`, `cancellation_reason`, y un sub-objeto `onboarding` (contrato aceptado, bitácora "Primer Círculo", `practicasSemanales`).
- Se llena vía `createStripeSubscription(email)` (`src/app/api/payments/createSubscription/createStripeSubscription.ts`) → `getLatestSubscriptionByEmail(email)` (`src/app/api/payments/stripe/getLatestSubscriptionByMail.ts`, consulta Stripe en vivo) → **sobreescribe `user.subscription` completo**. No persiste `current_period_end`.
- El webhook `src/app/api/payments/stripe/stripe-webhook/route.ts` procesa `customer.subscription.created/updated/deleted` e `invoice.payment_failed`, distinguiendo "membership" vía `subscription.metadata?.type === 'membership'`, con **"Cuerpo autónomo" hardcodeado como fallback de nombre** en varios puntos (`subscription.metadata?.planName || 'Cuerpo autónomo'`).
- Dispara `ensureCoherenceTracking(user._id)` — hoy keyed **solo por `userId`**, asumiendo que un usuario tiene a lo sumo una suscripción en toda la plataforma. Eso deja de ser cierto en cuanto cualquier curso pueda ser suscripción.
- **Blast radius real de `user.subscription` (relevado en esta pasada, vía grep — no vía graphify porque el grafo está desactualizado respecto a estos archivos):** además del webhook, lo leen/escriben directamente:
  `src/app/api/payments/validateSubscription/route.js`, `.../createPaymentToken/route.js`, `.../cancelSubscription/[id]/route.js`, `.../stripe/createPaymentURL/route.js`, `src/app/api/bitacora/replace-event-with-recording/route.js`, `.../bitacora/complete/route.js`, `src/app/api/move-crew/stats/route.ts`, `src/app/api/onboarding/complete-video/route.js`, `.../onboarding/accept-contract/route.js`, `.../onboarding/weekly-report/route.js`, `.../onboarding/complete-bitacora-tutorial/route.js`, `src/app/api/cron/event-reminder/route.ts`, `src/app/api/cron/weekly-logbook/route.ts`, `src/lib/scheduleMoveCrewReminders.js`.
  Es decir: **toda la experiencia de "bitácora"/"move-crew"/onboarding semanal ya es, en los hechos, la experiencia de Cuerpo Autónomo** — solo que modelada como si fuera un atributo único y global del usuario en vez de algo atado al producto. Esto confirma el diagnóstico del usuario: la suscripción "pertenece" al curso, no a la persona en abstracto.

**B) `cursosAdquiridos` — el gate real de acceso a contenido, y el lugar correcto para que viva esto**

- Array en `userModel.js`: `{ productoId, fechaCompra, metodoPago, transaccionId, monto, moneda, bienvenidaPendiente }` — **ya está indexado por producto**, que es exactamente la granularidad que necesitamos.
- Se llena desde `fulfillCoursePurchase.ts` para compra única (sigue igual, sin cambios).
- Gate en `src/lib/courseAccess.ts`: `userHasPurchasedCourse` (por `productoId`) + `userHasCourseAccess` (con bypass Admin). `src/lib/userHasCuerpoAutonomo.ts` resuelve el `productId` de Cuerpo Autónomo y llama la variante sin bypass Admin (inconsistencia menor a corregir).

**C) Un tercer sistema de suscripción, más viejo, sin relación con lo anterior**

- `planModel.js` (`provider: 'dlocalgo'`) + familia `src/app/api/payments/{createPlan,membership,getPlans,createManualSubscription,...}`. Campos legacy en `userModel.js`: `isMember`, `isVip`, `memberShip`, `productToken`. No se consultan en `courseAccess.ts`. Fuera de alcance — no confirmado si tiene call-sites vivos.

### 1.2 Contenido: curso, módulos, clases — y la biblioteca ya está modelada de forma genérica

- `Product` (`productModel.js`, `tipo: 'curso'`) tiene `cursoConfig.contenidoModulos[].clases[]` embebido (fallback/seed). La fuente viva es la colección **`CourseClass`** (`courseClassModel.js`: `productId`, `timelineIndex`, `order`, **`visibleInLibrary`**), leída en `src/app/api/curso/[slug]/contenido/route.ts`.
- **Dato clave para la propuesta:** tanto `CourseClass` como el `cursoClaseContenidoSchema` embebido ya tienen el flag `visibleInLibrary`. Es decir, **el concepto de "biblioteca" ya existe a nivel de clase individual y ya es agnóstico de qué curso es** — no hace falta inventar una entidad "Biblioteca". Alcanza con que el gate de acceso al producto sea el mismo para el camino estructurado y para las clases marcadas `visibleInLibrary` de ese `productId`.
- Jerarquía legacy separada (`courseModel.js`, `classModel.js`, `moduleClassModel.js`, `individualClassModel.js`) — no confirmado si sigue viva, no se toca en esta propuesta.

### 1.3 Progreso

Sin cambios respecto al análisis anterior: `CourseClassProgress` (`{userId, courseClassId → CourseClass, productId, status}`) ya apunta a la colección correcta y ya está desacoplado del acceso — solo está artificialmente scopeado en comentario/uso a "producto gratuito secuencial". Es la pieza correcta para generalizar, sin cambio de schema.

### 1.4 Configuración por curso ya existe y ya es extensible

- `productSchema` (`productModel.js`) ya tiene el patrón de "perilla booleana que activa una sub-configuración específica del producto": `esProgramaTransformacional: { type: Boolean, default: false }` + bloque `programaTransformacional: {...}` que solo aplica cuando esa perilla está en `true`. **Este es exactamente el patrón a repetir para suscripción** — no hay que inventar una convención nueva.
- `cursoConfig.planes.opcionesPago: [cursoPlanPagoSchema]` ya modela "formas de pago disponibles para este curso" por producto, con `proveedor` (`stripe`/`dlocalgo`/`mercadopago`), `stripePriceId`, `monto`, `moneda`, `activo`. **No distingue hoy si un `stripePriceId` es de precio único o recurrente** — esa distinción vive del lado de Stripe (cómo se creó el Price), no en este schema. No hace falta agregarle un campo: al crear/editar el curso como "suscripción", el admin carga ahí el `stripePriceId` recurrente igual que cargaría uno de pago único.
- `productSchema.invitacionGrupoWhatsapp` **ya existe a nivel de producto** (no solo a nivel global) — confirma que "WhatsApp por curso" no es una construcción nueva, ya está el campo, solo hay que dejar de ignorarlo en el flujo de membership (que hoy usa `NEXT_PUBLIC_WHATSAPP_GROUP_LINK`, una env var global, en vez de leer del producto).
- El componente de admin (`CreateProductStep1.tsx` / `EditProductStep1.tsx`, que envuelven `CursoLandingConfigForm.tsx`) ya tiene el estado `esProgramaTransformacional` declarado junto a `tipo`/`nombre`/`precio` al principio del componente — el lugar natural para la nueva perilla `esSuscripcion` es al lado de ese mismo bloque.

---

## 2. Problemas del modelo actual para soportar esto

1. **La suscripción está modelada 1:1 con el usuario, no con la relación usuario↔producto.** `user.subscription` asume "el usuario tiene una sola suscripción en toda la plataforma". En cuanto un segundo curso pueda ser de suscripción, esto se rompe.
2. **Todo lo "alrededor" de la suscripción (bitácora, onboarding, WhatsApp, tracking de hábito) está hardcodeado a la idea de que existe un solo producto suscribible ("Cuerpo autónomo"), en vez de derivarse del producto real.** Confirmado por el fallback de texto y por el `WHATSAPP_GROUP_LINK` global en vez de por-producto.
3. **`Product` no tiene hoy ninguna noción de "modelo de acceso" (pago único vs. suscripción).** Es una decisión que hoy vive implícitamente en el checkout (qué tipo de Stripe Session se crea), no en el producto.
4. **`cursosAdquiridos` no distingue fuente ni vigencia** — sigue siendo cierto, y sigue siendo el lugar correcto para resolverlo (ver v1), ahora confirmado por el usuario: en vez de un campo global, la vigencia de la suscripción de un curso debe vivir en la entrada de `cursosAdquiridos` de ESE curso.
5. **`CoherenceTracking` está keyed solo por `userId`**, asumiendo una única suscripción por usuario — necesita quedar keyed por `(userId, productId)`.

---

## 3. Propuesta de arquitectura

### 3.1 El producto declara su propio modelo de acceso

```js
// productModel.js — mismo patrón que esProgramaTransformacional
esSuscripcion: { type: Boolean, default: false },
```

- Default `false` → **comportamiento actual sin ningún cambio** para todos los cursos existentes (pago único vía `cursosAdquiridos`, tal como está hoy).
- `true` → el curso se vende por suscripción recurrente. El admin, al crear/editar, carga en `cursoConfig.planes.opcionesPago` un `cursoPlanPagoSchema` cuyo `stripePriceId` apunta a un Price recurrente de Stripe — mismo campo, ningún schema nuevo.
- **Toggle en el admin:** en `CreateProductStep1.tsx`/`EditProductStep1.tsx`, un switch "¿Es suscripción?" ubicado junto al bloque de estado inicial (`tipo`, `nombre`, `precio`, `esProgramaTransformacional`) — entre los primeros campos del formulario, como pediste.

### 3.2 Eliminar `user.subscription` — la vigencia vive en `cursosAdquiridos`, por producto

Se retoma y se ajusta la extensión de v1, ahora como el **único** lugar donde vive el estado de suscripción (no una capa adicional a `user.subscription` — su reemplazo):

```
Usuario.cursosAdquiridos[]
  ├─ productoId          (existente)
  ├─ source               (NUEVO: 'compra_unica' | 'suscripcion' | 'manual' | 'beta')
  ├─ status               (NUEVO: 'active' | 'expired' | 'revoked', default 'active')
  ├─ expiresAt            (NUEVO: Date | null)
  ├─ stripeSubscriptionId (NUEVO, solo si source==='suscripcion')
  ├─ onboarding           (NUEVO, opcional — mismo shape que hoy tiene user.subscription.onboarding:
  │                         contratoAceptado, bitacoraBaseProgreso, practicasSemanales, etc.
  │                         Solo se usa/lee cuando source==='suscripcion'. Vive acá porque el
  │                         onboarding es del curso específico, no un concepto global del usuario.)
  └─ ...campos existentes (fechaCompra, metodoPago, transaccionId, monto, moneda, bienvenidaPendiente)
```

- `courseAccess.ts` sigue siendo el único gate: chequea `status === 'active' && (!expiresAt || expiresAt > now)`, sin importar si `source` es `compra_unica`, `suscripcion`, `manual` o `beta`.
- **`subscriptionSchema` se borra de `userModel.js`.** No queda como campo muerto ni deprecado a medias — se elimina, previa migración de los datos vivos (ver Migración).

### 3.3 Webhook de Stripe: generalizado por producto, no hardcodeado a "membership"

- Al crear el Checkout Session de un curso con `esSuscripcion: true`, el `metadata` pasa a incluir `{ productId, type: 'subscription' }` (no `type:'membership'`, no depende de un `planName` de texto libre).
- En `customer.subscription.created/updated/deleted`: leer `subscription.metadata.productId`, buscar el `Product` (para nombre, `invitacionGrupoWhatsapp`, config de onboarding si aplica), y upsertear/expirar la entrada correspondiente de `cursosAdquiridos` de ese usuario para ese `productoId`. Cero strings hardcodeados de nombre de curso.
- `ensureCoherenceTracking(userId, productId)` — se agrega `productId` a la key, para que el tracking de hábito sea por curso-suscripción, no global.

### 3.4 Biblioteca viva: sin modelo nuevo

Como ya existe `visibleInLibrary` en `CourseClass` (y en el embebido), "biblioteca de [curso]" = las clases de ese `productId` con `visibleInLibrary: true`, gateadas por el mismo `courseAccess.ts`. Cualquier curso marcado `esSuscripcion: true` obtiene automáticamente su propia biblioteca en cuanto tenga clases con ese flag — sin tabla ni concepto nuevo.

### 3.5 Compatibilidad para no reescribir 14 archivos de una

Dado el blast radius real de `user.subscription` (sección 1.1.A), se agrega un helper puente:

```ts
// src/lib/resolveProductSubscriptionState.ts
function getSubscriptionEntry(user, productId) {
  return user.cursosAdquiridos?.find(
    e => e.productoId?.toString() === productId?.toString() && e.source === 'suscripcion'
  );
}
```

Cada uno de los ~14 call-sites relevados (bitácora, onboarding, move-crew, crons) se migra para llamar `getSubscriptionEntry(user, cuerpoAutonomoProductId)` en vez de leer `user.subscription` directo — mecánico, sin reescribir la lógica de negocio de cada endpoint, solo el origen del dato. Esto es trabajo real de implementación (no es gratis), pero acota el riesgo: un solo punto de resolución, reemplazado archivo por archivo.

---

## 4. Entidades afectadas

| Entidad | Cambio | Tipo |
|---|---|---|
| `productModel.js` | + `esSuscripcion: Boolean` (default `false`), mismo patrón que `esProgramaTransformacional` | Aditivo |
| `userModel.js` → `cursosAdquiridos[]` | + `source`, `status`, `expiresAt`, `stripeSubscriptionId`, `onboarding` (opcional) | Aditivo, sin migración obligatoria para entradas existentes (defaults) |
| `userModel.js` → `subscriptionSchema` / campo `subscription` | **Eliminar**, previa migración de datos vivos | Remoción (con migración) |
| `src/lib/courseAccess.ts` | Respeta `status`/`expiresAt` | Modificación de lógica |
| `src/lib/userHasCuerpoAutonomo.ts` | Usar `userHasCourseAccess` (con bypass Admin) | Fix de inconsistencia |
| `src/lib/resolveProductSubscriptionState.ts` | Nuevo helper de compatibilidad | Nuevo, chico |
| `ensureCoherenceTracking` / `CoherenceTracking` | Key por `(userId, productId)` en vez de solo `userId` | Modificación de índice/uso |
| `stripe-webhook/route.ts` | Metadata genérica (`productId`, no `planName` de texto), resolver `Product` en vez de hardcodear nombre/WhatsApp | Modificación de lógica |
| `CreateProductStep1.tsx` / `EditProductStep1.tsx` | + toggle `esSuscripcion` junto a los campos iniciales | UI, aditivo |
| ~14 archivos que leen `user.subscription` directo (sección 1.1.A) | Migrar a `resolveProductSubscriptionState` | Modificación mecánica, uno por uno |
| `courseClassProgressModel.js` | Sacar scoping de comentario a "producto gratuito secuencial" | Sin cambio de schema |

**Sin cambios:** `CourseClass` (ya tiene `visibleInLibrary`), `cursoPlanPagoSchema` (ya soporta cualquier `stripePriceId`), `fulfillCoursePurchase.ts` (pago único intacto), jerarquía legacy de cursos.

## 5. Nuevas relaciones necesarias

- **`Product.esSuscripcion`** decide, en el momento de crear el Checkout Session, si `mode` es `payment` o `subscription` — la decisión de negocio vive en el producto, no en un flag de metadata inventado en el momento del checkout.
- **`subscription.metadata.productId` → `Product`** reemplaza `metadata.type==='membership'` + `planName` de texto libre como forma de resolver, desde el webhook, a qué curso corresponde una suscripción de Stripe.
- **`cursosAdquiridos.source`** sigue siendo la relación que evita el `if user bought cuerpoAutonomo` hardcodeado — ahora además evita el `if it's THE membership` hardcodeado del lado de la suscripción.

---

## 6. Flujos de negocio

**Usuario nuevo (curso con `esSuscripcion: true`):** Checkout Stripe con `metadata: {productId, type:'subscription'}` → `customer.subscription.created` → resolver `Product` por `productId` → upsert en `cursosAdquiridos` (`source:'suscripcion', status:'active', expiresAt: currentPeriodEnd, stripeSubscriptionId`) → `ensureCoherenceTracking(userId, productId)` → email de bienvenida usando `Product.nombre`/`Product.invitacionGrupoWhatsapp`.

**Renovación:** `customer.subscription.updated` con `current_period_end` nuevo → refrescar `expiresAt` de esa entrada.

**Cancelación:** `cancel_at_period_end=true` → `status` sigue `active`, `expiresAt` sin tocar (acceso continúa hasta esa fecha). Al llegar la fecha, `updated`/`deleted` → `status:'expired'`.

**Pago fallido:** Stripe reintenta solo (`past_due`) → sin cambios en `cursosAdquiridos` hasta que Stripe defina cancelación real.

**Usuario beta / acceso manual (cualquier curso, no solo suscripción):** push directo a `cursosAdquiridos` con `source:'manual'|'beta'`, `expiresAt:null`.

**Reactivación:** nueva `subscription.created` para el mismo `(usuario, productId)` → upsert (no duplicar) la entrada existente → `status:'active'`, `expiresAt` nuevo → progreso (`CourseClassProgress`) intacto, se retoma donde quedó.

---

## 7. Plan de migración

1. **Cursos existentes:** con `esSuscripcion` default `false`, cero impacto — siguen siendo pago único exactamente como hoy.
2. **Entradas viejas de `cursosAdquiridos`:** con los defaults propuestos, siguen pasando el gate igual que hoy, sin backfill obligatorio.
3. **Migración obligatoria y la más delicada: los usuarios con `user.subscription` viviendo hoy.** Antes de borrar el campo:
   - Confirmar (dato de producción) cuántos usuarios tienen `subscription.active === true` hoy.
   - Script en `scripts/`: por cada uno, resolver el `productId` de Cuerpo Autónomo (único producto suscribible hoy) y crear/actualizar su entrada en `cursosAdquiridos` con `source:'suscripcion'`, copiando `status`/`isCanceled`/`onboarding` desde el `user.subscription` viejo.
   - Migrar, uno por uno, los ~14 archivos relevados en 1.1.A a `resolveProductSubscriptionState`.
   - Recién ahí eliminar `subscriptionSchema`/campo `subscription` de `userModel.js`.
4. **Repetir el hallazgo de v1 como parte del mismo trabajo:** confirmar si hoy los suscriptores activos ya tienen o no acceso al contenido del curso vía `cursosAdquiridos` (el desacople detectado en v1 sigue siendo válido: el webhook nunca tocó `cursosAdquiridos`). El backfill del punto anterior lo resuelve de una — no hace falta un fix aparte.

---

## 8. Plan de implementación por etapas

- **Etapa 0 — Diagnóstico:** cuántos usuarios tienen `user.subscription.active` hoy; confirmar que efectivamente Cuerpo Autónomo es el único producto afectado.
- **Etapa 1 — Modelo de datos:** `esSuscripcion` en `productModel.js`; `source`/`status`/`expiresAt`/`stripeSubscriptionId`/`onboarding` en `cursosAdquiridos`; `courseAccess.ts` actualizado.
- **Etapa 2 — Admin:** toggle `esSuscripcion` en `CreateProductStep1.tsx`/`EditProductStep1.tsx`.
- **Etapa 3 — Checkout + webhook genéricos:** Checkout Session decide `mode` por `Product.esSuscripcion`; webhook resuelve por `metadata.productId`, ya no por `planName`/`type==='membership'` hardcodeado.
- **Etapa 4 — Migración de datos:** backfill de `user.subscription` → `cursosAdquiridos`, ver 7.3.
- **Etapa 5 — Migración de call-sites:** los ~14 archivos, uno por uno, vía `resolveProductSubscriptionState`.
- **Etapa 6 — Eliminación de `user.subscription`:** solo después de 4 y 5 verificados en producción.
- **Etapa 7 — Progreso + biblioteca:** generalizar `CourseClassProgress`, exponer biblioteca (`visibleInLibrary`) en el frontend del curso.
- **Etapa 8 — UX (home "continuar tu camino", etc.):** fuera de alcance de este documento.

---

## Preguntas abiertas

1. **¿Cuántos usuarios tienen `user.subscription.active === true` hoy en producción?** Determina el tamaño real del backfill de la Etapa 4 y si el desacople de v1 es un problema activo ahora mismo.
2. **¿Dónde se crea el Checkout Session de la membresía actual** (el que setea `metadata.type='membership'`)? No localizado todavía — necesario para la Etapa 3.
3. **¿Cuerpo Autónomo es hoy el único producto pensado para `esSuscripcion: true`,** o ya hay un segundo curso candidato? No cambia la propuesta, pero ayuda a priorizar qué tan genérico hace falta que sea el copy de emails/onboarding desde el día uno.
4. **Los 14 archivos relevados en 1.1.A (bitácora, onboarding, move-crew, crons) — ¿siguen todos en uso activo,** o alguno es vestigial y se puede directamente borrar en vez de migrar? Afecta el esfuerzo real de la Etapa 5.

**Estado a la fecha de este documento: implementado.** Todo lo descrito en las secciones 1 a 8 de
arriba fue el análisis que guio la implementación real — ver el "Resumen simple" al principio del
documento para qué se construyó, qué se migró en producción, y qué queda pendiente (los 20 usuarios
a revisar a mano y los 4 endpoints legacy).
