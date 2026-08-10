# Thinking Checklists — MMove Course Platform

> Checklists mentales livianas para abordar código, bugs y features desconocidas. **Capturan el
> proceso, no las reglas.** Las reglas reales viven en las skills validadoras y en los `AGENTS.md`
> (linkeados abajo); este archivo no las re-codifica, para evitar drift.

---

## Antes de modificar un archivo desconocido

1. **¿Qué capa es?** → route handler/server action (`src/app/api/**`, `src/server-actions/**`) /
   modelo de Mongoose (`src/models/**`) / componente/página (`src/app/**`, `src/components/**`).
   Reglas por capa: [`Agents.MDs/AGENTS-backend.md`](Agents.MDs/AGENTS-backend.md),
   [`Agents.MDs/AGENTS-frontend.md`](Agents.MDs/AGENTS-frontend.md).
2. **¿Toca pagos?** → Stripe o MercadoPago, y si es un webhook — ver
   [`backend-architecture.md`](backend-architecture.md) y el landmine de idempotencia/firma en
   `AGENTS-backend.md`.
3. **¿Toca una ruta con par en/es?** → confirmar cuál está activa antes de tocar — ver
   [`frontend-architecture.md`](frontend-architecture.md) § inventario de rutas.
4. **¿Sigue el patrón correcto?** → route handler delega a Mongoose sin capa DAO intermedia; modelo
   nuevo usa el guard `mongoose.models.X || mongoose.model(...)`; componente sigue el mecanismo de
   estado que ya usa el área (Redux/Valtio/Context).
5. **¿Qué landmines toca?** → `AGENTS-backend.md` / `AGENTS-frontend.md` § Landmines.

## Al diagnosticar un bug

1. Reproducir el comportamiento (manualmente — no hay test harness, ver `testing.md`).
2. Aislar la capa: ¿es el route handler, el modelo, o el componente?
3. Si toca pagos: verificar primero si es un problema de idempotencia (evento duplicado) antes de
   asumir que es lógica de negocio.
4. Arreglar, y verificar con `npm run build` + validación manual del flujo.
5. Si el bug reveló un patrón defectuoso repetible, documentarlo como landmine en el `AGENTS-*.md`
   correspondiente.

## Al planificar una feature / evaluar impacto

Pensar en: **capas afectadas** (backend/frontend/ambas), **contratos** (¿es un endpoint nuevo o
modifica uno existente que algo más ya consume?), **pagos** (¿toca Stripe/MercadoPago? — máximo
cuidado), **rutas en/es** (¿hay ambigüedad de cuál tocar?), **esquema de Mongo** (¿campo nuevo
retrocompatible? — ver skill `db-migration`), y **ambigüedades sin resolver**. Para features grandes o
ambiguas, usar el agente `feature-refinement` — corre este análisis formalmente y produce un spec.

## Al revisar un route handler/server action o un componente

Correr la skill validadora de esa capa — es el checklist canónico, no revisar reglas de memoria:
- Backend → `architecture-validator` (manejo de errores, auth manual, secretos, retrocompatibilidad
  de schema, webhooks).
- Frontend → `frontend-validator` (regla de inputs visibles — prioridad máxima, rutas en/es, manejo
  de estado consistente).

---

El objetivo: entender QUÉ toca un cambio antes de escribir la primera línea — y recurrir a las skills
validadoras y los `AGENTS.md` para las reglas reales en vez de confiar en la memoria.
