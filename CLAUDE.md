# Video Stream (MMove Course Platform)

> Este es el **punto de entrada**: se carga automáticamente en cada sesión. Contiene el resumen
> ejecutivo del proyecto y las restricciones no negociables. El resto del contexto (reglas por capa,
> skills, agentes, docs de dominio) vive en `.claude/` y se carga bajo demanda — ver
> [`.claude/README.md`](.claude/README.md).

Plataforma de cursos con UI/UX estilo Netflix. Aloja videos en YouTube/Vimeo (ocultos) para lograr
un comportamiento tipo Patreon (acceso por membresía/pago).

## Stack

- **Framework:** Next.js 13 (App Router, carpeta `src/app`), TypeScript + JavaScript mixto.
- **DB:** MongoDB + Mongoose / driver `mongodb`, auth con `@next-auth/mongodb-adapter`.
- **Auth:** NextAuth (Google OAuth + credenciales).
- **Pagos:** Stripe y MercadoPago (checkout, suscripciones, webhooks).
- **Email:** Nodemailer / SendGrid / Mailgen, integración Mailchimp (marketing + transactional).
- **Media:** Cloudinary (imágenes), YouTube/Vimeo (video).
- **State:** Redux Toolkit + Valtio.
- **UI:** MUI + Tailwind CSS + componentes propios en `src/components`.
- **IA:** SDKs de Anthropic, OpenAI y Google Generative AI ya incluidos como dependencias (revisar uso real en `src/services/ai`).
- **Deploy:** Vercel (ver `vercel.json` — incluye cron jobs).

## Estructura

- `src/app` — rutas (App Router). Hay grupos de rutas en inglés y español para las mismas secciones (ej. `classes`/`clases`, `events`/`eventos`, `products`/`productos`, `privacy`/`privacidad`) — **confirmar antes de asumir cuál es la activa/canónica** (ver `.claude/frontend-architecture.md`).
- `src/app/admin` — panel de administración.
- `src/app/api` — API routes (route handlers).
- `src/models` — modelos de Mongoose.
- `src/server-actions` — server actions (incluye `auth`).
- `src/services` — integraciones externas (ai, api, email, instagram).
- `src/redux`, `src/valtio`, `src/contexts` — manejo de estado.
- `src/lib`, `src/helpers`, `src/utils` — utilidades.
- `scripts/` — scripts de mantenimiento/migración (ej. `createMentorshipPlans.js`, `seedCourses.js`).

## Comandos

```
npm run dev              # desarrollo
npm run build             # build de producción
npm run lint               # next lint
npm run eslint             # eslint sobre src
npm run format             # prettier --write .
npm run seed:courses       # seed de cursos
npm run migrate:mentorship # migración de estudiantes de mentoría (ver .claude/testing.md — verificar que el script exista antes de asumirlo)
```

## Variables de entorno

Ver `.env.example` para la lista completa. Claves principales: `MONGODB_URI`, `GOOGLE_CLIENT_ID/SECRET`, `NEXTAUTH_SECRET`, `STRIPE_SECRET_KEY` + webhook secrets, `MERCADO_PAGO_ACCESS_TOKEN`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, credenciales de email/SendGrid, reCAPTCHA.

---

## Non-Negotiable Constraints

> Restricciones que Claude siempre respeta, en cualquier sesión, sin excepción. Si una de estas reglas
> cambia, se edita **acá** — nunca se copia a otro archivo.

| # | Regla |
|---|-------|
| 1 | **Nunca commitear valores reales de `.env`.** Hay variables opcionales de producción (`MONGODB_URI_PRODUCTION`, etc.) que deben vivir solo en el servidor (Vercel). |
| 2 | **Formularios: texto siempre visible.** Todo `<input>`, `<textarea>` y `<select>` (admin o público) debe llevar clases explícitas: texto `text-gray-900` (o `text-black`), fondo `bg-white`, y `placeholder:text-gray-500` en input/textarea. Ver detalle abajo y en `.claude/Agents.MDs/AGENTS-frontend.md`. |
| 3 | **Rutas duplicadas en/es.** Antes de tocar una sección con par en/es (`classes`/`clases`, `events`/`eventos`, `products`/`productos`, `privacy`/`privacidad`, etc.), verificar cuál está realmente enlazada/activa — no asumir. Ver `.claude/frontend-architecture.md`. |
| 4 | **Webhooks de pago (Stripe/MercadoPago) no se tocan a la ligera.** Cambios en `src/app/api/webhooks/**` o en los handlers de checkout/suscripción requieren entender el flujo completo primero (idempotencia, verificación de firma) — ver `.claude/backend-architecture.md`. |
| 5 | **No hay test harness en este repo.** No proponer "agregar tests unitarios" como acción — no hay framework que los aloje. Ver `.claude/testing.md`. |
| 6 | **MongoDB no tiene migraciones formales.** Los cambios de esquema se gestionan vía scripts en `scripts/` (Mongoose es schemaless en la práctica) — ver la skill `db-migration` y `.claude/Agents.MDs/AGENTS-backend.md`. |

### Formularios: texto siempre visible (detalle)

En este proyecto es común que los inputs hereden color de texto claro (blanco) y queden ilegibles sobre fondos claros del admin.

```jsx
className="... text-gray-900 bg-white placeholder:text-gray-500"
```

Para `<select>` no hace falta `placeholder:text-gray-500`, pero sí `text-gray-900 bg-white`.

---

## Dónde vive cada tipo de información

| Tipo | Dónde | Por qué |
|------|-------|---------|
| Restricciones no negociables | Este archivo | Se carga en cada sesión |
| Reglas cross-stack | `.claude/Agents.MDs/AGENTS.md` | Bajo demanda; aplica a todo el repo |
| Reglas de backend (API routes, Mongoose, webhooks) | `.claude/Agents.MDs/AGENTS-backend.md` | Bajo demanda al tocar backend |
| Reglas de frontend (App Router, MUI/Tailwind, Redux/Valtio) | `.claude/Agents.MDs/AGENTS-frontend.md` | Bajo demanda al tocar frontend |
| Conceptos de negocio (User, Course, Membership, Mentorship…) | `.claude/domain-concepts.md` | Referencia del dominio |
| Patrones de API routes / server actions / pagos / auth | `.claude/backend-architecture.md` | Al tocar backend |
| Patrones de App Router / rutas en-es / componentes | `.claude/frontend-architecture.md` | Al tocar frontend |
| Modelo de deploy (Vercel, cron, env) | `.claude/deployment-model.md` | Referencia de runtime |
| Estado de testing | `.claude/testing.md` | No hay harness en el repo |
| Validación recurrente de patrones | Skills en `.claude/skills/` | Se activan por trigger |
| Spec de una feature | `.claude/specs/` (si se elige guardar) | Persiste entre sesiones |

> **Punto de entrada:** este archivo se carga automáticamente en cada sesión. Para el resto —
> agentes, skills, docs de dominio — ver [`.claude/README.md`](.claude/README.md).

---

## Notas

- Migrado desde Cursor (`.cursor/rules/form-inputs-visible-text.mdc`).
- Estructura `.claude/` inspirada en un framework de context engineering portado de otro proyecto
  (uContact) el 2026-07-30 y adaptado desde cero a este stack (Next.js/MongoDB/Stripe/MercadoPago) —
  no asumir que ninguna convención de aquel proyecto (Java, jQuery, GitHub Projects, story points)
  aplica acá. Este repo **no tiene** `.github/` (sin PR templates, sin issue templates, sin project
  board) ni `gh` CLI configurado — las skills relacionadas con PRs/issues están simplificadas para
  reflejar esa realidad.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
