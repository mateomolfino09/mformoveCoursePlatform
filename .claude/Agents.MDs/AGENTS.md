# Project Context — MMove Course Platform (Root)

> Este es el `AGENTS.md` **raíz**. Contiene reglas que aplican a todo el repo (convenciones
> cross-stack, políticas de proyecto).
>
> Para reglas de backend, ver [`AGENTS-backend.md`](AGENTS-backend.md).
> Para reglas de frontend, ver [`AGENTS-frontend.md`](AGENTS-frontend.md).
>
> Este archivo contiene solo información que **no se puede inferir leyendo el código**. No agregar:
> detalles de stack ya cubiertos en `CLAUDE.md`, convenciones estándar de Next.js/JS, descripciones
> de estructura de carpetas. Actualizar este archivo (o el que corresponda) cuando se descubra una
> regla o landmine no obvia. Cada entrada del changelog debe indicar **qué la disparó**.

---

## Cross-Stack Rules (aplican a backend Y frontend)

### Rutas duplicadas en inglés y español

Hay grupos de rutas en `src/app` que existen en dos idiomas para la misma sección: `classes`/`clases`,
`events`/`eventos`, `products`/`productos`, `privacy`/`privacidad`, `library`/`biblioteca`,
`contact`/`contacto`, `terminos`/`terms` (verificar el par exacto al tocar cada sección). **Antes de
modificar cualquiera de estas rutas, confirmar cuál está realmente enlazada desde la navegación /
usada en producción** — no asumir que la versión en inglés o en español es la canónica sin
verificarlo (grep de `href`/`Link` hacia la ruta). Ver detalle en
[`AGENTS-frontend.md`](AGENTS-frontend.md).

### No modificar sin entender el flujo de pagos

`src/app/api/webhooks/**`, `src/app/api/payments/**`, `src/payments/**` y los handlers de
checkout/suscripción (Stripe y MercadoPago) manejan dinero real de clientes. Antes de tocarlos:
- Entender el flujo completo (creación → webhook → actualización de estado en Mongo).
- Verificar idempotencia: un webhook puede llegar más de una vez.
- Los webhooks deben responder 2xx rápido y procesar en background si la lógica es pesada (patrón ya
  usado en `src/app/api/webhooks/stripe/route.ts`).

Ver [`AGENTS-backend.md`](AGENTS-backend.md) y `.claude/backend-architecture.md`.

### MongoDB — no hay migraciones formales

Mongoose es schemaless en la práctica: no existe un sistema de migraciones versionado como en SQL. Los
cambios de esquema (agregar/renombrar campos, backfill) se resuelven con scripts puntuales en
`scripts/` (ver `createMentorshipPlans.js`, `seedCourses.js` como referencia de estilo) o cambios
directos al `Schema` de Mongoose con default para no romper documentos existentes. Ver la skill
`db-migration` y [`AGENTS-backend.md`](AGENTS-backend.md) § Cambios de esquema.

### Variables de entorno

Ver `.env.example` en la raíz para la lista completa y `CLAUDE.md` § Non-Negotiable Constraints regla
1. Nunca commitear un `.env` con valores reales. Las variables de producción
(`MONGODB_URI_PRODUCTION`, etc.) solo viven en el servidor (Vercel / panel del proyecto).

### Versiones de dependencias

No hay tabla central de versiones. La fuente de verdad es `package.json` en la raíz (proyecto Next.js
único, a diferencia de proyectos multi-paquete). No introducir nuevas dependencias sin revisar
alineación con lo ya usado (ej. no agregar una segunda librería de fechas si ya hay una en uso) y no
inventar números de versión.

### Commits y control de versiones

- **Este repo no tiene `.github/`**: no hay `pull_request_template.md`, no hay `ISSUE_TEMPLATE/`, no
  hay GitHub Projects/board, y `gh` CLI no está configurado en el entorno de trabajo. No asumir ni
  replicar convenciones de otro proyecto (story points, campos de Risk/Priority, labels de canal,
  etc.) — las skills de PR/issue de este repo están simplificadas a propósito.
- El historial usa ramas por feature/fix con prefijos (`feature/`, `fix/`, `bugfix/`, `hotfix/`,
  `test/`) y la rama principal es `main` (ver `git branch -a`). `develop` también existe como rama
  remota — confirmar con el desarrollador cuál es la base activa antes de abrir una rama si no es
  obvio por el contexto de la tarea.
- No hay convención documentada de idioma para mensajes de commit — el historial real mezcla español
  e inglés libremente. Preferir mensajes descriptivos y concretos (qué cambió, no "fix" a secas); no
  forzar un idioma si el desarrollador no lo pide.
- **No incluir atribución de coautoría de Claude en los commits** salvo pedido explícito.

---

## Changelog

| Fecha | Cambio | Disparador |
|-------|--------|------------|
| 2026-07-30 | Creación inicial, portado y adaptado desde el framework `.claude/` de otro proyecto (uContact — Java/jQuery/GitHub Projects) a este stack (Next.js/MongoDB/Stripe/MercadoPago), sin `.github/` ni `gh` CLI | Pedido del usuario de migrar de Cursor a Claude Code y tener reglas/contexto organizado |
