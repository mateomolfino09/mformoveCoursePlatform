---
name: frontend-validator
description: PROACTIVELY use this skill IMMEDIATELY after finishing any implementation that touches `src/app/**/*.tsx`, `src/app/**/*.jsx`, or `src/components/**/*.tsx`/`*.jsx` — before reporting the task complete. Also use it when the user explicitly asks to "revisar el frontend", "validar frontend", "review before commit". Analyzes React/Next.js App Router frontend code (MUI + Tailwind) for the project's form-input-visibility rule, pattern breaches, and code quality issues.
---

# Frontend Validator

## Purpose

Validar que el código de frontend generado por IA o escrito a mano respete la regla no negociable de
inputs visibles y las convenciones del proyecto (App Router, MUI + Tailwind, Redux/Valtio) antes de
que llegue a un commit.

Esta skill no reescribe código automáticamente. Produce un reporte estructurado y espera a que el
usuario decida cómo proceder.

---

## Scope

Esta skill valida archivos de frontend únicamente:

- Páginas y layouts (`src/app/**/*.tsx`, `*.jsx`, excluyendo `src/app/api/**`)
- Componentes (`src/components/**`)

Para route handlers/server actions/modelos, informar que está fuera de alcance y sugerir
`architecture-validator`.

---

## Project context files

Antes de analizar cualquier archivo, leer:

- `CLAUDE.md` (raíz) — regla no negociable de inputs visibles
- `.claude/Agents.MDs/AGENTS.md`
- `.claude/Agents.MDs/AGENTS-frontend.md`

---

## Inputs

- Una ruta de archivo o componente
- Un área (ej. "revisar el checkout de membresía")
- Nada, si se disparó proactivamente — inspeccionar `git diff --name-only HEAD` filtrado a
  `src/app/**/*.tsx`, `*.jsx`, `src/components/**`

---

## Validation Rules

### Regla crítica — inputs con texto visible (la única regla no negociable heredada de Cursor)

| ID | Violación | Señal |
|----|-----------|-------|
| F1 | `<input>`/`<textarea>`/`<select>` sin `text-gray-900`/`text-black` | Falta la clase de color de texto explícita |
| F2 | `<input>`/`<textarea>`/`<select>` sin `bg-white` (o fondo claro explícito) | Riesgo de texto oscuro sobre fondo oscuro heredado |
| F3 | `<input>`/`<textarea>` sin `placeholder:text-gray-500` cuando tiene `placeholder` | Placeholder puede quedar invisible |
| F4 | Componente MUI (`TextField`, `Select`, etc.) que hereda color claro de un tema oscuro sin override de color vía `sx`/clases | Mismo riesgo que F1/F2 pero vía MUI en lugar de HTML nativo |

**Esta es la violación de mayor prioridad de todo el reporte** — es la única regla que el proyecto
tenía documentada explícitamente antes de esta migración (ver `CLAUDE.md` regla 2). Siempre reportarla
como Alta.

### Capa — Componentes / páginas

| ID | Violación | Señal |
|----|-----------|-------|
| C1 | Ruta en/es duplicada tocada sin confirmar cuál es la canónica | Edición de una sección bajo un par conocido (`classes`/`clases`, etc.) sin evidencia de haber verificado cuál está enlazada (ver `AGENTS-frontend.md`) |
| C2 | Mezcla inconsistente de mecanismos de estado | Un componente nuevo introduce un cuarto mecanismo (ej. estado global custom) cuando el área ya usa Redux o Valtio |
| C3 | Falta de verificación de auth/rol en página admin | Página bajo `src/app/admin/**` sin guard de sesión/rol visible en el archivo o su layout |
| C4 | Fetch a API sin manejo de error | `fetch()`/`axios` sin `.catch`/try-catch ni feedback al usuario en caso de fallo |

### Cross-cutting — Code Quality

| ID | Violación | Señal |
|----|-----------|-------|
| CQ1 | Código comentado | Bloques comentados — deben eliminarse |
| CQ2 | `console.log` de debug | Dejado en código de producción |
| CQ3 | Import no usado | — |
| CQ4 | Texto de usuario hardcodeado que debería ser configurable/traducible | Solo si el área ya tiene un patrón de i18n/config — este proyecto no tiene i18n formal, así que esto es Baja, no Alta |

---

## Workflow

### 1. Leer contexto

Leer `CLAUDE.md`, `AGENTS.md`, `AGENTS-frontend.md`.

### 2. Identificar archivos objetivo

Si no se especificaron, usar `git diff --name-only HEAD` filtrado a frontend. Listar y confirmar antes
de leer todos si son muchos.

### 3. Correr validación

Aplicar las reglas. La regla F1-F4 se revisa en **todo** `<input>`/`<textarea>`/`<select>`/`TextField`/
`Select` del archivo, sin excepción — incluso si el resto del archivo no cambió.

### 4. Producir el reporte

```md
## Frontend Validation Report

**Archivo(s) analizados:** ...

---

### Violaciones encontradas

| ID | Severidad | Archivo | Línea (aprox.) | Descripción |
|----|-----------|---------|-----------------|-------------|
| F1 | Alta | AdminProductForm.tsx | ~34 | `<input>` sin `text-gray-900` — texto puede quedar invisible sobre fondo claro |
| C1 | Media | app/clases/page.tsx | ~1 | Editada sin confirmar si `classes` o `clases` es la ruta activa |

---

### Sin violaciones en

- ...

---

### Leyenda de severidad

- Alta — inputs ilegibles (regla no negociable), riesgo de seguridad/auth
- Media — inconsistencia de patrón, riesgo de editar la ruta equivocada
- Baja — estilo, sin impacto funcional

---

### Acciones recomendadas

**F1 — Agregar clases de texto visible:**
```jsx
className="... text-gray-900 bg-white placeholder:text-gray-500"
```

---

### Resumen

- Violaciones altas: N
- Violaciones medias: N
- Violaciones bajas: N

**Veredicto:** Listo para commit / Necesita ajustes antes de commit
```

### 5. Esperar decisión del usuario

No aplicar correcciones automáticamente. Indicar:

```
No se hicieron cambios. Revisá las violaciones de arriba y decime cuáles querés que corrija.
```

---

## Success Criteria

- Todo input/textarea/select/TextField/Select del archivo se revisa contra F1-F4, sin excepción.
- Violaciones de inputs siempre Alta.
- No se modifica código automáticamente.
- El reporte es honesto si no hay violaciones.
- No se valida backend — se redirige a `architecture-validator`.

---

## Anti-Patterns

No:

- Reescribir código sin aprobación.
- Inventar violaciones no listadas.
- Marcar la mezcla MUI+Tailwind como violación — es intencional en este proyecto (ver
  `AGENTS-frontend.md`).
- Exigir i18n/traducción como si fuera regla del proyecto — no lo es todavía.
- Saltear F1-F4 en un componente porque "ya funcionaba antes" — la regla es no negociable para
  cualquier input tocado, nuevo o existente, en el archivo bajo revisión.
