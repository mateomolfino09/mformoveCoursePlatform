# Workflows — MMove Course Platform

> Tarea → qué skill/agente/doc usar. Este archivo es un **router, no un libro de reglas**: las reglas
> reales viven en los validators y los `AGENTS.md` (linkeados) y no se duplican acá.

---

## Router de tareas

| Tarea | Usar |
|-------|------|
| Nuevo endpoint / API route | Skill `endpoint-generator` → `architecture-validator` (self-check). Reglas: `Agents.MDs/AGENTS-backend.md`. |
| Nueva feature de frontend | Seguir `Agents.MDs/AGENTS-frontend.md` + [`frontend-architecture.md`](frontend-architecture.md) → `frontend-validator` (self-check). |
| Cambio de esquema Mongo / campo nuevo | Skill `db-migration`. |
| Cambio en pagos (Stripe/MercadoPago) | Leer [`backend-architecture.md`](backend-architecture.md) § Pagos primero → implementar → `architecture-validator`. |
| Bug fix | Diagnóstico: `.claude/COGNITIVE_SCHEMAS.md` § Al diagnosticar un bug → validator de la capa afectada. |
| PR con comentarios de review | `/resolve-pr <n>` (skill `pr-review-resolution`). |
| Crear un PR nuevo | `/create-pr` (skill `create-pr`) — sin template propio, body genérico. |
| Chequeo rápido antes de abrir PR | `/pre-pr-checklist` (skill `pre-pr-checklist`) — build, lint, secretos, regla de inputs, pagos, rutas en/es. |
| Crear un issue | `/create-issue` (skill `create-issue`) — sin template propio. |
| Generar casos de prueba manuales (issue/PR/feature) | Skill `test-case-generator` (a pedido). |
| Feature grande / ambigua / riesgosa (ej. toca pagos + rutas en/es + esquema) | `feature-refinement` → `feature-implementation` (pedir por nombre, no con `@`). |
| Tarea chica / mediana y bien definida | Ir directo — no hace falta agente. |
| Retrospectiva de sesión | `/retro` (skill `session-retro`). |

Backend se auto-revisa con `architecture-validator`, frontend con `frontend-validator` — ambos se
auto-disparan tras un cambio relevante. Sus checklists de reglas no se repiten acá.

---

## Procedimientos específicos del proyecto (no documentados en otro lado)

### Elegir el área correcta primero

Antes de cualquier cambio de backend, confirmar:
- ¿Es un route handler nuevo o modifica uno existente? → ver si el área usa subcarpeta-por-operación o
  métodos HTTP múltiples en un solo archivo (revisar el vecino, no asumir).
- ¿Toca pagos? → confirmar Stripe o MercadoPago, y si es webhook, leer
  `backend-architecture.md` § Pagos antes de tocar nada.
- ¿Toca una ruta con par en/es? → confirmar cuál está activa antes de editar.

### Cambios de esquema de Mongo

Regla central: `Agents.MDs/AGENTS-backend.md` § Cambios de esquema. El cómo concreto: skill
`db-migration` — campo nuevo con `default`, nunca `required: true` sin default sobre colección
existente; backfill vía script en `scripts/` cuando haga falta poblar documentos viejos.

### Verificar antes de dar por terminado

1. `npm run build` pasa.
2. `npm run lint` sin errores nuevos.
3. Si tocó backend: correr `architecture-validator`.
4. Si tocó frontend: correr `frontend-validator` (especial atención a inputs/formularios).
5. Validación manual del flujo — no hay test harness (ver `testing.md`).
