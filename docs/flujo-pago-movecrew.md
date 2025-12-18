# Análisis del Flujo de Pago y Permisos de Move Crew

## Resumen Ejecutivo

Este documento describe el flujo completo desde que un usuario hace clic en "Quiero unirme" en Move Crew hasta que obtiene permisos de membresía, incluyendo el manejo de usuarios no autenticados.

**IMPORTANTE:** El flujo de pago ahora se procesa completamente mediante webhooks de Stripe. La página de success solo muestra un mensaje de confirmación y NO procesa ningún pago.

## Flujo Completo

### 1. Inicio del Proceso de Pago

**Ubicación:** `src/components/PageComponent/MoveCrew/MoveCrewPlans.tsx`

**Proceso:**
- Usuario hace clic en el botón "Quiero unirme" de un plan
- Se ejecuta `handleSelect(plan)`

**Verificación de Autenticación:**
```typescript
if (!auth.user) {
  state.loginForm = true; // Abre el modal de login
  return;
}
```

Si el usuario **NO está logueado:**
- Se abre el modal de login (`state.loginForm = true`)
- El usuario debe iniciar sesión antes de continuar
- Una vez logueado, puede volver a hacer clic en el botón

Si el usuario **SÍ está logueado:**
- Se procede con el proceso de pago

### 2. Creación de Sesión de Pago

**Dos flujos posibles según el proveedor:**

#### A. Flujo Stripe (provider === "stripe")
1. Se llama a `/api/payments/stripe/createPaymentURL`
2. El endpoint crea una sesión de checkout en Stripe
3. Se guarda un `planToken` en cookies (expira en 5 días)
4. Se redirige al usuario a la URL de checkout de Stripe

**Archivos relevantes:**
- `src/app/api/payments/stripe/createPaymentURL/route.js`
- `src/app/api/payments/stripe/createCheckoutSession.ts`

#### B. Flujo dLocal (provider !== "stripe")
1. Se llama a `/api/payments/createPaymentToken`
2. Se genera un token de pago
3. Se guarda un `planToken` en cookies
4. Se redirige al usuario a `https://checkout.dlocalgo.com/validate/subscription/{plan_token}?external_id={userId}`

**Archivos relevantes:**
- `src/app/api/payments/createPaymentToken/route.js`

### 3. Pago Exitoso y Webhook

**Redirección después del pago:**
- **Stripe:** `/payment/success` (sin parámetros)
- **dLocal:** Redirección externa, luego callback a `/payment/success`

**IMPORTANTE:** El procesamiento del pago NO se hace en la página de success. Todo se procesa mediante webhooks de Stripe.

**Webhook de Stripe:**
- **Endpoint:** `/api/payments/stripe/stripe-webhook`
- **Eventos procesados:**
  1. `checkout.session.completed` - Se registra cuando se completa el checkout
  2. `customer.subscription.created` - **Evento principal que procesa la membresía**
  3. `customer.subscription.updated` - Actualiza el estado de la suscripción
  4. `customer.subscription.deleted` - Elimina la suscripción

**Proceso del Webhook:**
1. Cuando se completa el checkout, Stripe envía `checkout.session.completed`
2. Stripe crea la suscripción y envía `customer.subscription.created`
3. El webhook verifica si `subscription.metadata.type === 'membership'`
4. Si es membresía, llama a `createStripeSubscription(email)`
5. Se actualiza `user.subscription.active = true`
6. El usuario obtiene permisos automáticamente

**Archivo del webhook:** `src/app/api/payments/stripe/stripe-webhook/route.ts`

### 4. Página de Success (Solo Visualización)

**Componente:** `src/components/PageComponent/MembershipActions/Success.tsx`

**Proceso:**
- **NO procesa ningún pago**
- Solo muestra un mensaje de confirmación al usuario
- Actualiza el usuario localmente para reflejar cambios del webhook
- Permite navegar al home

**Nota:** El procesamiento real se hace en el webhook, que puede tardar unos segundos en completarse.

### 5. Creación de Suscripción en Backend (vía Webhook)

**Función:** `createStripeSubscription(email)` 
**Ubicación:** `src/app/api/payments/createSubscription/createStripeSubscription.ts`

**Proceso:**
1. Se busca el usuario por email
2. Se verifica la suscripción más reciente en Stripe usando `getLatestSubscriptionByEmail`
3. Se suscribe al usuario a Mailchimp
4. Se actualiza `user.subscription` con los datos de Stripe:
   ```javascript
   user.subscription = latestSub; // Incluye active: true/false
   user.freeSubscription = null;
   await user.save();
   ```

**Metadata en Stripe:**
- Al crear la sesión de checkout, se agrega metadata:
  ```javascript
  metadata: {
    email: user.email,
    type: 'membership',
    planId: planId
  }
  ```
- Esta metadata se propaga a la suscripción mediante `subscription_data.metadata`

#### B. dLocal
1. Se obtienen las suscripciones del plan desde la API de dLocal
2. Se selecciona la suscripción más reciente
3. Se crea un objeto de suscripción con:
   ```javascript
   {
     id: subToAdd?.id,
     planId: subToAdd.plan.id,
     subscription_token: subToAdd.subscription_token,
     status: subToAdd?.status,
     active: subToAdd?.active, // ← Permiso clave
     // ... otros campos
   }
   ```
4. Se actualiza `user.subscription` y se guarda

### 6. Otorgamiento de Permisos

**Modelo de Usuario:** `src/models/userModel.js`

**Campo clave:** `user.subscription.active`

**Estructura de subscription:**
```javascript
subscription: {
  id: string,
  planId: string,
  subscription_token: string,
  status: string,
  active: boolean, // ← Este campo otorga permisos
  isCanceled: boolean,
  // ... otros campos
}
```

### 7. Verificación de Permisos en la Aplicación

Los permisos se verifican en varios lugares usando:

```typescript
auth.user?.subscription?.active
```

**Ejemplos de uso:**

1. **Acceso a clases:**
   - `src/components/CarouselClassesThumbnail.tsx` (línea 90)
   ```typescript
   {(auth.user && ((auth?.user?.subscription?.active || auth?.user?.rol === "Admin" || auth?.user?.isVip) || c.isFree))
   ```

2. **Perfil de usuario:**
   - `src/components/PageComponent/Profile/Profile.tsx` (línea 125)
   ```typescript
   {auth?.user?.subscription?.active || auth?.user?.isVip ? (
     // Mostrar contenido de membresía
   ) : (
     // Mostrar opción de suscribirse
   )}
   ```

3. **Validación de suscripción:**
   - `src/app/api/payments/validateSubscription/route.js`
   ```javascript
   if(user.subscription.active) {
     return NextResponse.json({ success: true, subscription: user.subscription });
   }
   ```

## Puntos Importantes

### 1. Modal de Login
- Se controla mediante `state.loginForm` (valtio)
- Ubicación del estado: `src/valtio/index.js`
- Componente: `src/components/PageComponent/Login/LoginModal.tsx`
- Se muestra automáticamente cuando `state.loginForm = true`

### 2. Tokens y Cookies
- `planToken`: Se guarda en cookies después de crear la sesión de pago
- Expiración: 5 días
- Se usa para vincular el pago con el usuario después del redirect

### 3. Actualización del Estado del Usuario
- Después de crear la suscripción, se actualiza `auth.user` con `setUser(data.user)`
- Esto actualiza automáticamente todos los componentes que dependen de `auth.user`

### 4. Integración con Mailchimp
- Todos los usuarios con suscripción activa se suscriben automáticamente a Mailchimp
- Función: `subscribeUserToMailchimp(user, hashedEmail)`

## Flujo Visual

```
Usuario hace clic en "Quiero unirme"
         ↓
¿Usuario logueado?
    ↓           ↓
   NO          SÍ
    ↓           ↓
Abrir modal   Crear sesión de pago
de login      (con metadata: type='membership')
    ↓              ↓
Esperar      Redirigir a Stripe
login             ↓
    ↓         Usuario paga en Stripe
    └──────────────┘
         ↓
   Stripe envía webhook:
   checkout.session.completed
         ↓
   Stripe crea suscripción
         ↓
   Stripe envía webhook:
   customer.subscription.created
         ↓
   Webhook verifica metadata.type === 'membership'
         ↓
   Webhook llama a createStripeSubscription()
         ↓
   Actualizar user.subscription.active = true
         ↓
   Usuario redirigido a /payment/success
         ↓
   Página muestra mensaje de éxito
   (NO procesa nada, solo muestra)
         ↓
   Usuario tiene permisos de membresía
```

## Cambios Implementados (Webhook-based)

### Antes (Flujo Antiguo)
- La página de success procesaba el pago usando `external_id` y `planToken`
- El usuario tenía que esperar en la página mientras se procesaba
- Dependía de parámetros en la URL

### Ahora (Flujo con Webhooks)
- ✅ El webhook procesa todo automáticamente
- ✅ La página de success solo muestra confirmación
- ✅ No se usa `external_id` en la URL
- ✅ El procesamiento es asíncrono y más confiable
- ✅ Si el usuario cierra la página, el webhook igual procesa el pago

## Recomendaciones

1. **Mejora sugerida:** Después de que el usuario se loguea desde el modal, podría redirigirse automáticamente al proceso de pago en lugar de requerir que haga clic nuevamente.

2. **Validación:** Considerar agregar validación para evitar que usuarios con suscripción activa puedan suscribirse nuevamente (ya existe en `createPaymentURL` línea 27-29).

3. **Manejo de errores:** Mejorar el feedback visual cuando hay errores en el proceso de pago.

4. **Webhooks:** Para Stripe, considerar usar webhooks para actualizar el estado de la suscripción automáticamente en lugar de depender solo del redirect.

## Archivos Modificados en esta Implementación

### Primera Fase (Pago Directo)
1. `src/components/PageComponent/MoveCrew/MoveCrewPlans.tsx`
   - Agregada verificación de autenticación
   - Agregada lógica para abrir modal de login
   - Agregada lógica de pago directo (Stripe y dLocal)
   - Agregado estado de carga durante el proceso

### Segunda Fase (Webhook-based)
2. `src/app/api/payments/stripe/createCheckoutSession.ts`
   - Agregado metadata `type: 'membership'` y `planId`
   - Agregado metadata en `subscription_data` para propagar a la suscripción
   - Removido `external_id` de la URL de success
   - Cambiado `cancel_url` a `/move-crew`

3. `src/app/api/payments/stripe/createPaymentURL/route.js`
   - Actualizado para pasar `planId` a `createCheckoutSession`

4. `src/app/api/payments/stripe/stripe-webhook/route.ts`
   - Agregado manejo de `checkout.session.completed` para membresías
   - Mejorado manejo de `customer.subscription.created` con verificación de metadata
   - Agregada lógica para identificar membresías mediante `metadata.type === 'membership'`
   - Agregado logging para debugging

5. `src/components/PageComponent/MembershipActions/Success.tsx`
   - **Removida toda la lógica de procesamiento de pago**
   - Solo muestra mensaje de confirmación
   - Actualiza usuario localmente para reflejar cambios del webhook
   - Simplificado el código eliminando estados innecesarios

