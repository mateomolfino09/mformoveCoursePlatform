# Conceptos — Context & Harness Engineering (MMove Course Platform)

> Glosario para entender el vocabulario que usan `CLAUDE.md`, los `AGENTS.md`, las skills, los
> agentes y la guía de mantenimiento. Cada término trae un ejemplo de este proyecto.

---

## Fundamentos

### Context engineering
La práctica de **organizar toda la información que recibe el modelo** para que trabaje de forma
coherente y predecible en un proyecto. Incluye reglas, ejemplos, patrones y herramientas.
*Acá:* es la razón de existir de toda la carpeta `.claude/`.

### Harness
El "arnés" alrededor del modelo: archivos, triggers y skills que controlan *qué* información ve el
agente y *cuándo*.
*Acá:* el harness es lo que hace que Claude corra `frontend-validator` solo al tocar un `.tsx` con
inputs, sin que se lo pidas.

### Context window / token budget
El modelo tiene capacidad de atención limitada. *"Deletion beats padding"*: borrar lo irrelevante rinde
más que agregar. *Acá:* por eso los docs se cargan bajo demanda, no todos de una.

### Progressive disclosure
Cargar información en capas: primero lo liviano, expandir solo cuando hace falta.
*Acá:* `CLAUDE.md` (siempre) → `AGENTS-backend.md` (al tocar backend) → `backend-architecture.md`
(al tocar pagos/webhooks específicamente).

---

## Artefactos de `.claude/`

### `CLAUDE.md`
El único archivo que se carga automáticamente en cada sesión. Resumen ejecutivo + reglas no
negociables (incluida la regla de inputs visibles, la única que ya existía antes de esta migración).

### `AGENTS.md` (y `AGENTS-backend.md` / `AGENTS-frontend.md`)
Reglas del proyecto que no se infieren del código: landmines, convenciones, patrones obligatorios.

### Skill
Una capacidad puntual que hace una sola cosa bien. Carpeta con un `SKILL.md`.
*Acá:* `architecture-validator` revisa route handlers/modelos; `frontend-validator` revisa
componentes (con foco en la regla de inputs visibles).

### Doc suelto (`.md`) vs Skill — *saber* vs *hacer*
Un `.md` suelto (`domain-concepts.md`, `backend-architecture.md`…) es **conocimiento** — pasivo, solo
entra en contexto si algo lo apunta. Una skill es un **procedimiento** — se auto-registra y puede
auto-dispararse por trigger.

### Agente (subagente)
Flujo de trabajo con contexto propio para tareas grandes. *Acá:* `feature-refinement` analiza sin
codear; `feature-implementation` implementa después.

### `EVALUATION.md`
Banco de pruebas de una skill, en prosa. Equivalente a un test suite pero para una skill basada en
prompt.

### Spec
Documento de diseño que produce `feature-refinement`. Vive en `.claude/specs/`.

### Hook
Comando que el harness ejecuta de forma determinística ante un evento, configurado en `settings.json`.
*Acá:* `context-maintenance-reminder.sh` recuerda correr el validator tras editar backend/frontend.

---

## Validación y medición

### Ground truth
La respuesta correcta establecida a mano de antemano, contra la cual se compara el output del agente.

### Falso positivo / falso negativo
Falso positivo: marca como error algo que está bien (erosiona confianza). Falso negativo: no detecta
un error real (más peligroso — falsa sensación de seguridad).

### Auto-trigger (skill PROACTIVE)
Una skill que se activa sola al cumplirse su condición. *Acá:* los validators se auto-disparan tras
tocar `src/app/api/**`, `src/server-actions/**`, `src/models/**` (backend) o `src/app/**/*.tsx`,
`src/components/**` (frontend).

### Anti-pattern (en un `SKILL.md`)
Lista explícita de lo que la skill NO debe marcar. *Acá:* no marcar `connectDB()` a nivel de módulo
como violación nueva — es el patrón existente documentado.

---

## Conceptos del proyecto

### Landmine
Punto frágil o contraintuitivo donde un cambio inocente rompe algo no obvio. *Acá:* el campo `id`
numérico manual conviviendo con `_id` de Mongo; las rutas duplicadas en/es; los webhooks de pago sin
cola/reintento propio.

### Drift
Cuando el código evoluciona pero la documentación queda vieja. *Acá:* especialmente relevante porque
este `.claude/` se creó de una sola vez (2026-07-30) a partir de una exploración puntual del código —
no tiene meses de uso real detrás como el framework de origen. Revisar y corregir a medida que se usa.

### Single source of truth / DRY
Cada regla vive en un solo lugar canónico; el resto linkea. *Acá:* las restricciones no negociables
viven solo en `CLAUDE.md`; las versiones de dependencias viven solo en `package.json`.

### Measurement-driven
Agregar una regla solo si se puede demostrar que sirve con un caso real, no por intuición. **Este
`.claude/` arrancó sin ese historial** (a diferencia del proyecto de origen) — tratarlo como punto de
partida a refinar con `session-retro`, no como verdad ya probada.

---

## Ver también

- Cómo mantener todo esto al día → [`MAINTENANCE.md`](MAINTENANCE.md)
- Router tarea → skill/agente/doc → [`WORKFLOWS.md`](WORKFLOWS.md)
- Guía de uso general → [`README.md`](README.md)
