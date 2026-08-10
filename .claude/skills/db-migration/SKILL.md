---
name: db-migration
description: Use this skill when the user wants to add a field, change a Mongoose schema, backfill existing documents, or write a data migration script — triggers like "agregar un campo a", "migrar datos de", "backfill", "cambio de schema", "nuevo campo en el modelo". Generates or validates a Mongoose schema change plus, when needed, a backfill script in `scripts/`, following the project's real (informal) migration convention.
---

# DB Migration

## Purpose

Este proyecto usa MongoDB + Mongoose **sin sistema de migraciones versionado** (a diferencia de un
proyecto SQL con `Database/Updates/N.sql`). Esta skill formaliza el proceso real que ya existe de
forma implícita: cambiar el `Schema` de Mongoose de forma retrocompatible, y cuando hace falta
backfillear documentos existentes, generar un script puntual en `scripts/` siguiendo el estilo de los
scripts reales del repo.

No ejecuta nada contra la base de datos. Produce el diff del schema (y el script de backfill si
corresponde) y espera aprobación.

---

## Background — por qué estas reglas

- Mongoose es schemaless a nivel de MongoDB: el `Schema` es una capa de validación de la aplicación,
  no una migración de base de datos real. Agregar un campo al `Schema` no actualiza los documentos
  existentes — solo afecta lecturas/escrituras futuras.
- Si el código empieza a **asumir** que un campo nuevo existe (ej. `doc.priority > 0`) en documentos
  viejos que no lo tienen, eso rompe en runtime — de ahí la regla de nunca usar `required: true` sin
  `default` en un campo agregado a una colección con datos existentes.
- Cuando hace falta que los documentos **existentes** tengan el campo poblado (no solo los nuevos),
  hace falta un script de backfill — no hay otra forma en este proyecto.

---

## Project context files

Antes de generar, leer:

- `.claude/Agents.MDs/AGENTS-backend.md` § Cambios de esquema
- El modelo de Mongoose objetivo en `src/models/`
- Un script de `scripts/` existente (ej. `createMentorshipPlans.js`) para igualar el estilo

---

## Inputs

- El **cambio de schema** deseado (ej. "agregar campo `priority` opcional a `IndividualClass`")
- Si hace falta **backfill** de documentos existentes, y con qué valor/lógica

Si no está claro si hace falta backfill, preguntar — no asumir.

---

## Generation rules

- **Campos nuevos:** siempre con `default` explícito (o `required: false` sin default si el campo
  debe quedar ausente/null en documentos viejos y el código lo maneja como opcional en todos lados).
  Nunca `required: true` sin `default` sobre una colección con documentos existentes.
- **Nunca eliminar un campo del schema** sin antes verificar (grep) que ningún endpoint/componente lo
  lea. Si hay que eliminarlo, primero dejar de usarlo en el código, después quitarlo del schema en un
  cambio separado.
- **Renombrar un campo** requiere mantener ambos (viejo + nuevo) durante una transición, con el script
  de backfill copiando el valor, y recién después de confirmar que nada lee el viejo, eliminarlo.
- **Scripts de backfill:** en `scripts/`, standalone (no dependen del ciclo de build de Next.js),
  siguiendo el estilo de conexión/desconexión de Mongo de los scripts existentes. Deben ser
  **idempotentes cuando sea posible** (verificar antes de sobreescribir, ej. `if (!doc.priority)
  doc.priority = ...`).
- **Nunca ejecutar el script** — la skill lo genera, el desarrollador decide cuándo correrlo.

---

## Workflow

### 1. Leer contexto y el modelo objetivo

Confirmar el estado actual del schema y si la colección tiene datos en producción (preguntar si no es
obvio).

### 2. Presentar el plan (STOP para aprobación)

```md
## Migration Plan

**Modelo:** src/models/{modelo}Model.js
**Cambio:** agregar campo `priority: { type: Number, default: 0 }`
**Retrocompatible:** sí (default, no required)
**¿Hace falta backfill?:** no / sí — script en scripts/backfill{Feature}.js

Confirmá con "Generar" para escribir los archivos.
```

Esperar aprobación.

### 3. Generar después de aprobación

Editar el `Schema` de Mongoose y, si corresponde, escribir el script de backfill en `scripts/`.

### 4. Self-check

```md
## Self-Check

- [ ] Campo nuevo con `default` o explícitamente opcional — nunca `required: true` sin default sobre
      colección existente
- [ ] Ningún campo eliminado sin verificar que no se lee en el código
- [ ] Si hay backfill: script idempotente, no se ejecutó automáticamente
- [ ] Cambio documentado en `AGENTS-backend.md` si introduce una convención nueva (no solo un campo)
```

---

## Success Criteria

- El cambio de schema es retrocompatible.
- El script de backfill (si existe) sigue el estilo real de `scripts/`.
- Nada se ejecuta sin aprobación explícita del desarrollador.
- El plan se presenta y aprueba antes de escribir cualquier archivo.

---

## Anti-Patterns

No:

- Agregar `required: true` sin `default` a un campo nuevo sobre una colección con datos existentes.
- Eliminar o renombrar un campo en un solo paso sin transición.
- Ejecutar el script de backfill vos mismo.
- Inventar un sistema de versionado de migraciones (`N.sql`-style) que este proyecto no tiene — Mongo
  no funciona así acá.
