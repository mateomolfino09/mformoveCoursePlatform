# Guía de uso de Claude Code — MMove Course Platform

Esta carpeta contiene la configuración de Claude Code adaptada a este proyecto. Es el punto de partida
para entender cómo trabaja el asistente en este repositorio.

> Esta estructura se adaptó el 2026-07-30 desde el framework `.claude/` de otro proyecto (uContact —
> Java/jQuery/GitHub Projects) a este stack (Next.js/MongoDB/Stripe/MercadoPago). Este repo **no
> tiene** `.github/` (sin PR templates, sin issue templates, sin project board) — las skills
> relacionadas con PRs/issues están simplificadas a propósito. Ver `.claude/CONCEPTS.md` § "este
> `.claude/` arrancó sin historial" antes de asumir que todo acá está tan probado como en un framework
> maduro.

---

## 1. Qué es esta carpeta `.claude/`

Le da contexto a Claude para que trabaje siguiendo las reglas y convenciones específicas de este
proyecto. Sin ella, Claude respondería como un asistente genérico; con ella, sabe qué patrones usar
(Next.js App Router, Mongoose sin capa DAO, webhooks de Stripe/MercadoPago), qué archivos requieren
cuidado extra, y cuándo pedir confirmación.

Dentro de `.claude/` hay cinco tipos de cosas:

| Tipo | Qué es | Ejemplo |
|------|--------|---------|
| **Reglas del proyecto** | Restricciones que Claude siempre respeta | Inputs con texto visible; no tocar webhooks sin entender idempotencia |
| **Agentes** | Flujos especializados para tareas grandes | `feature-refinement`, `feature-implementation` |
| **Skills** | Capacidades puntuales, automáticas o a pedido | `architecture-validator`, `frontend-validator`, `endpoint-generator` |
| **Specs** | Documentos de diseño del agente de refinamiento | `.claude/specs/mi-feature.spec.md` |
| **Docs de contexto** | Conocimiento de dominio y arquitectura, bajo demanda | `domain-concepts.md`, `backend-architecture.md` |

---

## 2. Context engineering, en corto

Organizar la información que recibe Claude para que siga las convenciones del proyecto sin
repetírselas en cada mensaje. Parte se carga siempre (`CLAUDE.md` en la raíz), parte bajo demanda
según lo que se esté tocando (ej. `AGENTS-backend.md` al tocar un route handler).

> Definiciones de *context engineering*, *harness*, *skill*, *EVALUATION*, *landmine*, *drift*, etc.,
> con ejemplos de este proyecto → [`CONCEPTS.md`](CONCEPTS.md).

---

## 3. Cómo elegir el flujo correcto

| Tamaño | Flujo recomendado | Cuándo aplica |
|--------|--------------------|----------------|
| **Chico** (1-2 archivos, bien definido) | Directo — pedirle a Claude que implemente | "Agregar validación de campo vacío al form de contacto" |
| **Mediano** (3-5 archivos, un área) | Directo con plan explícito | "Crear endpoint para listar planes de mentoría" |
| **Grande** (multi-área, ambiguo) | `feature-refinement` → `feature-implementation` | "Agregar un nuevo método de pago" |
| **Riesgoso** (toca pagos, esquema de Mongo, rutas en/es) | `feature-refinement` siempre | "Cambiar el flujo de checkout de membresía" |

---

## 4. Uso directo sin agentes

Para tareas chicas o medianas, hablar con Claude directo — las reglas de `AGENTS.md` aplican igual.

```
Validá la arquitectura de src/app/api/mentorship/createSubscription/route.ts

Creá un endpoint para listar los planes de mentoría activos

Resolvé los comentarios del PR 12
/resolve-pr 12

¿En qué modelo vive la relación usuario-membresía?
```

---

## 5. Agentes disponibles

### `feature-refinement` — Analizar antes de codear

Analiza el requerimiento sin escribir código: detecta ambigüedades, explora el codebase, verifica
conflictos con AGENTS.md, produce un spec.

**Invocar:** *«usá el agente feature-refinement para: \<requerimiento\>»* (por nombre, no con `@`).

### `feature-implementation` — Implementar a partir de un spec

Recibe el spec y lo implementa completo, por lotes, pidiendo confirmación.

**Invocar:** *«usá feature-implementation con el spec @.claude/specs/\<feature\>.spec.md»*.

---

## 6. Skills disponibles

- **`architecture-validator`** — valida route handlers/server actions/modelos (errores, auth manual,
  secretos, retrocompatibilidad de schema, webhooks). Auto-trigger tras tocar `src/app/api/**`,
  `src/server-actions/**`, `src/models/**`.
- **`frontend-validator`** — valida componentes/páginas, con foco en la regla de inputs visibles.
  Auto-trigger tras tocar `src/app/**/*.tsx`/`.jsx`, `src/components/**`.
- **`endpoint-generator`** — genera un route handler/server action siguiendo el patrón real del área.
- **`db-migration`** — genera/valida un cambio de schema de Mongoose + script de backfill si hace
  falta.
- **`pr-review-resolution`** (`/resolve-pr`) — resuelve comentarios de un PR con contexto real.
- **`create-pr`** (`/create-pr`) — crea un PR con body genérico (sin template propio en este repo).
- **`create-issue`** (`/create-issue`) — crea un issue con estructura genérica.
- **`pre-pr-checklist`** (`/pre-pr-checklist`) — chequeo liviano de solo lectura antes de abrir un PR.
- **`test-case-generator`** — a pedido, genera casos de prueba manuales de QA en español.
- **`session-retro`** (`/retro`) — retrospectiva de proceso al cierre de sesión.

> Cuándo crear una skill nueva: solo si hay un patrón de validación/generación recurrente que se va a
> usar más de 3 veces. Conocimiento de dominio va en `AGENTS.md`/`domain-concepts.md`, no en una
> skill.

---

## 7. Dónde vive cada tipo de información

| Tipo | Dónde | Por qué |
|------|-------|---------|
| Restricciones no negociables | `CLAUDE.md` (raíz) | Se carga en cada sesión |
| Reglas cross-stack | `.claude/Agents.MDs/AGENTS.md` | Bajo demanda |
| Reglas de backend | `.claude/Agents.MDs/AGENTS-backend.md` | Bajo demanda al tocar backend |
| Reglas de frontend | `.claude/Agents.MDs/AGENTS-frontend.md` | Bajo demanda al tocar frontend |
| Conceptos de negocio | `.claude/domain-concepts.md` | Referencia de dominio |
| Patrones de backend (API routes, pagos, auth) | `.claude/backend-architecture.md` | Al tocar backend |
| Patrones de frontend (App Router, rutas en/es) | `.claude/frontend-architecture.md` | Al tocar frontend |
| Modelo de deploy (Vercel) | `.claude/deployment-model.md` | Referencia de runtime |
| Estado de testing | `.claude/testing.md` | No hay harness en el repo |
| Validación recurrente | Skill en `.claude/skills/` | Se activa por trigger |
| Spec de una feature | `.claude/specs/` (si se elige guardar) | Persiste entre sesiones |

---

## Estructura de la carpeta `.claude/`

```
.claude/
├── Agents.MDs/
│   ├── AGENTS.md                     # Reglas cross-stack
│   ├── AGENTS-backend.md             # Backend: route handlers, Mongoose, pagos
│   └── AGENTS-frontend.md            # Frontend: App Router, MUI/Tailwind, inputs
├── agents/
│   ├── feature-refinement.md
│   └── feature-implementation.md
├── skills/
│   ├── architecture-validator/
│   ├── frontend-validator/
│   ├── endpoint-generator/
│   ├── db-migration/
│   ├── pr-review-resolution/
│   ├── create-pr/
│   ├── create-issue/
│   ├── pre-pr-checklist/
│   ├── test-case-generator/
│   └── session-retro/
├── commands/
│   ├── resolve-pr.md
│   ├── create-pr.md
│   ├── create-issue.md
│   ├── pre-pr-checklist.md
│   └── retro.md
├── retro/                            # Reportes fechados de retrospectivas
├── hooks/
│   ├── git-commit-guard.sh
│   ├── edit-guard.sh
│   └── context-maintenance-reminder.sh
├── settings.json
├── specs/                            # Specs generados por feature-refinement
├── CONCEPTS.md
├── COGNITIVE_SCHEMAS.md
├── MAINTENANCE.md
├── WORKFLOWS.md
├── domain-concepts.md
├── backend-architecture.md
├── frontend-architecture.md
├── deployment-model.md
├── testing.md
└── README.md
```

> **Punto de entrada:** `CLAUDE.md` en la raíz del repositorio se carga automáticamente en cada
> sesión.
