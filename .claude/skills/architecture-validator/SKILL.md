---
name: architecture-validator
description: PROACTIVELY use this skill IMMEDIATELY after finishing any implementation that touches `src/app/api/**/route.ts`, `src/app/api/**/route.js`, `src/server-actions/**`, or `src/models/**` — before reporting the task complete. Also use it when the user explicitly asks to "review", "validar", "revisar arquitectura", "code review", or "revisar antes de commitear". Analyzes Next.js/TypeScript backend code (route handlers, server actions, Mongoose models) for architectural violations and code quality issues specific to this project.
---

# Architecture Validator

## Purpose

Validar que el código generado por IA o escrito a mano respete las reglas arquitectónicas y los
estándares de calidad del proyecto antes de que llegue a un commit.

Esta skill no reescribe código automáticamente. Produce un reporte estructurado y espera a que el
usuario decida cómo proceder con cada violación encontrada.

---

## Scope

Esta skill valida archivos de backend únicamente:

- Route handlers (`src/app/api/**/route.ts` / `route.js`)
- Server actions (`src/server-actions/**`)
- Modelos de Mongoose (`src/models/**`)
- Servicios (`src/services/**`)
- Scripts de datos (`scripts/**`)

Para archivos de frontend (componentes React, páginas), la skill debe informar que la validación de
frontend está fuera de su alcance y sugerir `frontend-validator`.

---

## Project context files

Antes de analizar cualquier archivo, leer:

- `CLAUDE.md` (raíz) — restricciones no negociables
- `.claude/Agents.MDs/AGENTS.md` (reglas raíz)
- `.claude/Agents.MDs/AGENTS-backend.md` (reglas de backend)
- `package.json` (versiones de dependencias)

Tratar estos archivos como fuente autoritativa de landmines, convenciones no estándar y reglas
específicas del proyecto. Cualquier regla encontrada ahí prevalece sobre buenas prácticas genéricas.

---

## Inputs

La skill espera uno de:

- Una ruta de archivo (ej. `src/app/api/individualClass/create/route.js`)
- Un área (ej. "revisar los endpoints de payments") — en ese caso inspeccionar todos los archivos de
  esa área
- Nada, si se disparó proactivamente tras una implementación — en ese caso inspeccionar los archivos
  modificados recientemente vía `git diff --name-only HEAD` filtrado a `src/app/api/**`,
  `src/server-actions/**`, `src/models/**`

Si no hay input y no se disparó proactivamente, preguntar al usuario qué archivo o área validar.

---

## Validation Rules

### Capa 1 — Route handlers / Server actions

**Violaciones a detectar:**

| ID | Violación | Señal |
|----|-----------|-------|
| E1 | Falta manejo de errores | Ausencia de `try/catch` alrededor de operaciones async (DB, servicios externos) |
| E2 | Query de Mongo sin filtrar por usuario/tenant cuando corresponde | Un endpoint que debería estar scoped a un usuario devuelve/modifica datos sin verificar ownership |
| E3 | Falta verificación de rol en endpoint admin | Un endpoint bajo un área admin (o que modifica datos sensibles) sin chequeo de `rol`/sesión antes de mutar |
| E4 | Secretos hardcodeados | API keys, tokens, passwords en el código en vez de `process.env` |
| E5 | Webhook sin verificación de firma | Un handler de webhook de pago (Stripe/MercadoPago) que procesa el body sin validar la firma primero |
| E6 | Webhook lento / sin procesamiento en background | Lógica pesada (envío masivo de emails, loops grandes) awaited directamente en un handler de webhook, arriesgando timeout |
| E7 | Respuesta no usa `NextResponse` de forma consistente | Mezcla de formatos de respuesta sin seguir el patrón del archivo vecino (no es error automático — solo señalar como Low si es inconsistente dentro del mismo endpoint) |

### Capa 2 — Modelos de Mongoose

**Violaciones a detectar:**

| ID | Violación | Señal |
|----|-----------|-------|
| M1 | `required: true` sin default en campo nuevo sobre colección existente | Riesgo de romper documentos viejos — ver `AGENTS-backend.md` § Cambios de esquema |
| M2 | Falta guard de recompilación | Modelo exportado sin el patrón `mongoose.models.X \|\| mongoose.model('X', schema)` |
| M3 | Lógica de negocio dentro del schema/modelo | Validaciones complejas de negocio (no de forma/tipo) que deberían vivir en el route handler o server action |

### Cross-cutting — Code Quality

Aplicado a todos los archivos:

| ID | Violación | Señal |
|----|-----------|-------|
| CQ1 | Código comentado | Cualquier bloque de código comentado — debe eliminarse |
| CQ2 | `console.log` de debug dejado en código de producción | Distinto de `console.error` intencional en manejo de errores |
| CQ3 | `any` sin justificación en TypeScript | Uso de `any` donde un tipo concreto es razonable y el archivo vecino ya tipa |
| CQ4 | Mutación directa de estado compartido/singleton sin sincronización | Riesgo de condición de carrera (ver landmine de IDs numéricos manuales en `AGENTS-backend.md`) |
| CQ5 | Import de un modelo/servicio con ruta relativa incorrecta o inconsistente con el resto del archivo | — |

---

## Workflow

### 1. Leer archivos de contexto

Leer `CLAUDE.md`, `AGENTS.md`, `AGENTS-backend.md`. Anotar landmines o convenciones no estándar que
afecten la validación.

### 2. Leer el/los archivo(s) objetivo

Leer el/los archivo(s) especificados. Si se pidió un área, listar los archivos primero y confirmar con
el usuario antes de leerlos todos.

### 3. Correr la validación

Aplicar todas las reglas de las capas relevantes. Recolectar cada violación encontrada.

### 4. Producir el reporte

```md
## Architecture Validation Report

**Archivo(s) analizados:** ...
**Capa(s):** route handler / server action / modelo

---

### Violaciones encontradas

| ID | Severidad | Archivo | Línea (aprox.) | Descripción |
|----|-----------|---------|-----------------|-------------|
| E5 | Alta | webhooks/mercadopago/route.ts | ~20 | No se verifica la firma antes de procesar el evento |
| M1 | Media | courseModel.js | ~45 | Campo nuevo `required: true` sin default sobre colección existente |

---

### Sin violaciones en

- ...

---

### Leyenda de severidad

- Alta — riesgo de seguridad, de datos, o de dinero (pagos)
- Media — problema de calidad, degrada mantenibilidad o compatibilidad hacia atrás
- Baja — sugerencia de estilo, sin impacto estructural

---

### Acciones recomendadas

Para cada violación Alta, una corrección concreta:

**E5 — Verificar firma del webhook:**
...

---

### Resumen

- Violaciones altas: N
- Violaciones medias: N
- Violaciones bajas: N

**Veredicto:** Listo para commit / Necesita ajustes antes de commit
```

### 5. Esperar decisión del usuario

Después de entregar el reporte, no aplicar ninguna corrección automáticamente.

Indicar claramente:

```
No se hicieron cambios. Revisá las violaciones de arriba y decime cuáles querés que corrija.
```

---

## Success Criteria

- Se leyeron los archivos de contexto antes de analizar cualquier archivo.
- Cada violación está clasificada por capa y severidad.
- El reporte incluye la ubicación específica (archivo + línea aproximada).
- Los problemas de seguridad/pagos siempre se marcan Alta.
- No se modifica código automáticamente — el usuario decide qué corregir.
- El reporte es honesto: si no hay violaciones, lo dice claramente.

---

## Anti-Patterns

No:

- Reescribir o corregir código sin aprobación explícita del usuario.
- Inventar violaciones que no están en las reglas de validación.
- Saltear la lectura de AGENTS.md antes de validar.
- Marcar como violación un patrón documentado como intencional (ej. `connectDB()` a nivel de módulo,
  IDs numéricos manuales ya conocidos como landmine — señalarlos solo si la feature los agrava, no
  como violación nueva).
- Validar archivos de frontend — redirigir a `frontend-validator`.
- Exigir una capa de validación (zod/yup) como si fuera obligatoria cuando el módulo tocado no la usa
  (ver `AGENTS-backend.md`).
