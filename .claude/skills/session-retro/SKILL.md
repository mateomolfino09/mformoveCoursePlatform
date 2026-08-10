---
name: session-retro
description: Use this skill when the user wants a retrospective of the current working session — including triggers like "retro", "retrospectiva", "qué podemos mejorar de esta sesión", or invocation via the /retro slash command. Analyzes the session's process (not its code) for friction signals and routes improvement proposals into the maintenance system: docs/harness (Channel A), skills + EVALUATION (Channel B), or agent-friendly code refactor proposals (never applied, Channel C).
---

# Session Retro — retrospectiva de proceso

## Purpose

Al final de una sesión, mirar **cómo fue el trabajo** (el proceso, no el resultado) y convertir la
fricción en mejoras durables, ruteadas al sistema de mantenimiento definido en
[`../../MAINTENANCE.md`](../../MAINTENANCE.md):

- **Canal A — docs/harness:** una regla, landmine o convención faltante o mal ubicada en `CLAUDE.md`,
  `AGENTS-*.md`, `WORKFLOWS.md`, `domain-concepts.md`, hooks, settings.
- **Canal B — skills:** una skill nueva que valdría la pena crear, o un cambio de regla en un
  `SKILL.md` existente (siempre arrastrando su `EVALUATION.md`).
- **Canal C — código agent-friendly:** código del proyecto cuya estructura le costó al modelo (un
  route handler gigante, lógica duplicada, nombres ambiguos, la falta de claridad sobre qué ruta en/es
  es la activa). **Solo propuesta — la retro nunca edita código del proyecto.** El output es un texto
  de issue redactado (usable con `/create-issue`).

Lo que esta skill NO cubre:

- Corrección del código producido → `architecture-validator` / `frontend-validator`.
- Mecánica de creación de PR/issue → `create-pr` / `create-issue`.
- Preferencias personales del usuario → la memoria persistente de Claude Code ya las captura.

---

## Allowed Writes (lista exhaustiva)

1. El reporte fechado en `.claude/retro/YYYY-MM-DD-<slug>.md` — siempre se escribe, incluso sin hallazgos.
2. Ediciones aprobadas de Canal A/B a archivos bajo `.claude/` (y `CLAUDE.md`) — solo tras aprobación
   por hallazgo; Canal B siempre en pareja `SKILL.md` + `EVALUATION.md`.

NO debe: editar código fuente del proyecto (`src/`, `scripts/`), correr comandos git mutantes, ni
hacer ningún write en GitHub.

---

## Inputs

- Nada (`/retro`): analiza la conversación actual.
- Alcance en texto libre opcional (`/retro solo lo del checkout`).

---

## Workflow

### Fase 1 — Alcance

Indicar en una línea de qué fue la sesión.

### Fase 2 — Recolectar señales de fricción

| Señal | Ejemplo | Canal candidato |
|-------|---------|-------------------|
| Corrección del usuario | "no, así no", re-explicaciones | A |
| Exploración cara | muchas búsquedas para algo que una línea de doc resolvía (ej. cuál ruta en/es es la activa) | A o B |
| Suposición equivocada | el agente asumió un patrón (ej. capa de validación zod) que el módulo no usa | A |
| Paso improvisado repetible | secuencia que ninguna skill/doc cubre | B |
| Regla existente ignorada | la regla estaba en `.claude/` y no se aplicó | A — mover/podar, no agregar |
| Código hostil al LLM | route handler enorme leído entero, lógica duplicada | C |

### Fase 3 — Cruzar contra `.claude/` antes de proponer

Si ya existe una regla que cubre la señal y fue ignorada, el hallazgo es de **ubicación/visibilidad**
— proponer mover/acortar, nunca duplicar.

### Fase 4 — Umbral de recurrencia

Leer reportes previos en `.claude/retro/`. Primera aparición → solo se **registra**. Recurrencia → se
vuelve **accionable**. Excepción: el usuario declaró una regla durable explícitamente ("siempre X",
"nunca más Y") o la fricción tuvo costo alto.

### Fase 5 — Reporte

```md
# Retro — <fecha> — <de qué fue la sesión>

## Hallazgos accionables
### 1. <título> — Canal A|B|C
- **Qué**:
- **Por qué**:
- **Cómo**:
- **Impacto**:

## Fricciones registradas (1ª aparición)
- ...

## Podas propuestas
- ...

## Sin hallazgos
<si la sesión fue limpia, decirlo en una línea>
```

### Fase 6 — Aplicar con aprobación, una por una

Presentar hallazgos uno a la vez, esperar aprobación antes de tocar nada.

---

## Anti-Patterns

No:

- Inventar hallazgos en una sesión limpia — "sin hallazgos" es un resultado válido.
- Proponer una regla en la primera aparición de una fricción (fuera de la excepción de Fase 4).
- Duplicar una regla que ya existe en `.claude/` — proponer mover/podar en su lugar.
- Editar un `SKILL.md` sin su `EVALUATION.md` en el mismo cambio.
- Editar código fuente del proyecto o aplicar refactors de Canal C.
- Aplicar todos los hallazgos en bloque sin aprobación por hallazgo.
