# Backend Architecture — MMove Course Platform

> Patrones de código de API routes, server actions, auth y pagos. Para reglas (qué está permitido/
> prohibido), ver [`Agents.MDs/AGENTS-backend.md`](Agents.MDs/AGENTS-backend.md). Este archivo es
> **conocimiento** (cómo está construido), no reglas.

---

## Capas reales (no hay arquitectura en capas formal tipo DAO/Service/Controller)

```
Request → route handler (src/app/api/**/route.ts|js)
            ├── parsea el body/query
            ├── verifica rol/sesión manualmente si hace falta
            ├── llama directo al modelo de Mongoose (sin capa DAO intermedia)
            └── responde con NextResponse
```

A diferencia de arquitecturas backend tradicionales con capas separadas, acá el route handler habla
directo con Mongoose. Esto es una decisión de diseño real del proyecto, no una carencia a "corregir".

## Auth (NextAuth)

- `src/server-actions/auth/` contiene la configuración/lógica de NextAuth (Google OAuth + credenciales,
  adapter `@next-auth/mongodb-adapter`).
- `middleware.ts` en la raíz centraliza qué rutas requieren sesión a nivel Next.js — pero la
  verificación de **rol** (Admin vs. usuario normal) se hace dentro de cada route handler
  individualmente (ver landmine en `AGENTS-backend.md`). No asumir que un endpoint nuevo bajo
  `src/app/api/**` queda protegido por rol solo por estar en una carpeta de admin.

## Pagos — Stripe

- Config central: `src/app/api/payments/stripe/stripeConfig.ts` (verificado).
- Checkout: `src/app/api/payments/**` (`createSubscription`, `oneTimePayment`, `createPlan`, etc.).
- Webhook: `src/app/api/webhooks/stripe/route.ts` — patrón verificado:
  1. Lee el body como texto (`req.text()`), no como JSON, porque la verificación de firma de Stripe
     necesita el payload crudo.
  2. Verifica la firma vía `constructStripeEvent(stripe, body, signature)` — si falla, 400 inmediato.
  3. Responde `{ received: true }` con 200 **antes** de terminar de procesar — la lógica pesada
     (`processStripeEvent`) corre con `.catch()` sin bloquear la respuesta (Stripe corta la conexión a
     los ~10s).
  4. Switch por `event.type` (`checkout.session.completed`, `payment_intent.succeeded`, ...).
  5. Hay un segundo endpoint de mentoría con su propio webhook (`src/app/api/mentorship/stripe`) —
     **no asumir que todos los eventos de Stripe pasan por el mismo handler**; confirmar cuál endpoint
     está configurado en el dashboard de Stripe para el evento que estás depurando/extendiendo.

## Pagos — MercadoPago

- `src/app/api/payments/**` también maneja MercadoPago (ver `MERCADO_PAGO_ACCESS_TOKEN`,
  `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` en `.env.example`).
- Mismo principio que Stripe: verificar autenticidad del webhook antes de procesar, responder rápido,
  tolerar reintentos/duplicados.
- MercadoPago y Stripe conviven como proveedores alternativos — al tocar lógica de checkout, confirmar
  para cuál proveedor es el cambio; no asumir que una corrección en el flujo de Stripe aplica
  automáticamente al de MercadoPago (son integraciones independientes).

## Email

- `src/services/email/emailService` (usado en el webhook de Stripe) centraliza el envío — usarlo en
  vez de llamar a Nodemailer/SendGrid/Mailchimp directo desde un route handler nuevo, salvo que el
  área que estés tocando ya lo haga distinto (ver el patrón real en el archivo vecino).
- Mailchimp también se usa directo en algunos handlers (ver `individualClass/create/route.js`) para
  notificaciones masivas — sin cola, corre inline (ver landmine en `AGENTS-backend.md`).

## IA

`src/services/ai/` integra Anthropic, OpenAI y Google Generative AI. Antes de agregar una llamada de
IA nueva, revisar si ya existe un wrapper/servicio ahí para el proveedor que necesitás, en vez de
instanciar el SDK directo en el route handler.

## Instagram

`src/services/instagram/` + `src/app/api/instagram/**` — integración con webhooks de Instagram
(mensajería automatizada, generación de contenido). Área relativamente aislada del resto del dominio
de cursos/pagos.

## Cron jobs

`src/app/api/cron/**` (`event-reminder`, `weekly-logbook`, `transformational-programs`,
`publish-curso-landings`) — disparados por Vercel Cron (ver `vercel.json` y
[`deployment-model.md`](deployment-model.md)), no por un scheduler propio.

---

## Changelog

| Fecha | Cambio | Disparador |
|-------|--------|------------|
| 2026-07-30 | Creación inicial a partir de `webhooks/stripe/route.ts`, `individualClass/create/route.js` y la estructura de `src/app/api` | Migración de contexto desde Cursor / adaptación del framework `.claude/` de uContact |
