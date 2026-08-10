---
name: endpoint-generator
description: Use this skill when the user wants to create, generate, or scaffold a new Next.js API route or server action — including triggers like "crear un endpoint para", "generá la ruta de", "scaffold endpoint", "nuevo endpoint para", "agregar API para". Generates Next.js App Router route handlers (or server actions) with correct structure, Mongoose delegation, and error handling, following the project's existing patterns.
---

# Endpoint Generator

## Purpose

Generar route handlers de Next.js App Router (`src/app/api/**/route.ts`) o server actions
(`src/server-actions/**`) que sigan el patrón real ya establecido en el proyecto:
- Parseo del request, delegación a Mongoose, respuesta con `NextResponse`
- Manejo de errores con try/catch
- Verificación de rol/sesión cuando el endpoint lo requiere
- Sin reinventar una capa de validación que el módulo vecino no usa

---

## Project context files

Antes de generar nada, leer:

- `CLAUDE.md` (raíz)
- `.claude/Agents.MDs/AGENTS.md`
- `.claude/Agents.MDs/AGENTS-backend.md`
- Un route handler existente cercano al feature (ej. `src/app/api/individualClass/create/route.js`
  para endpoints de creación, o el vecino más parecido al que se va a generar)

---

## Inputs

La skill espera:

- El **nombre del recurso/feature** (ej. "planes de mentoría", "inscripción a evento")
- Las **operaciones necesitadas** (ej. "crear, listar, actualizar, eliminar")
- Si el endpoint requiere **autenticación/rol admin**

Si falta alguno, preguntar antes de generar. No asumir qué operaciones hacen falta.

---

## Generation Rules

### Estructura del route handler

Seguir el patrón real observado (verificado contra
`src/app/api/individualClass/create/route.js` y `src/app/api/webhooks/stripe/route.ts`):

```ts
import connectDB from '@/config/connectDB'; // o ruta relativa según convención del vecino
import Model from '@/models/xModel';
import Users from '@/models/userModel';
import { NextResponse } from 'next/server';

connectDB(); // a nivel de módulo — salvo que el vecino más cercano use otro patrón, ver AGENTS-backend.md

export async function POST(req: Request) {
  try {
    const { field1, field2 } = await req.json();

    // Si requiere admin (patrón real observado):
    // const user = await Users.findOne({ email: userEmail });
    // if (user.rol !== 'Admin') {
    //   return NextResponse.json({ error: 'Este usuario no tiene permisos' }, { status: 422 });
    // }

    const doc = await new Model({ field1, field2 }).save();

    return NextResponse.json({ message: '...', data: doc }, { status: 200 });
  } catch (error) {
    console.error('Error en [nombre]:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
```

Reglas:
- Un archivo por operación cuando el proyecto ya sigue ese patrón (`create/route.js`,
  `delete/route.js`, `update/route.js` como subcarpetas), **o** un solo `route.ts` con múltiples
  métodos HTTP (`GET`/`POST`/`PUT`/`DELETE`) — **revisar qué patrón usa el área vecina antes de
  elegir**; no mezclar ambos estilos dentro de la misma feature.
- Delegar la query/mutación de datos al modelo de Mongoose directamente (no hay capa DAO separada en
  este proyecto — es una diferencia real respecto a proyectos con arquitectura en capas).
- Usar `try/catch` siempre; no dejar una promesa sin manejar.
- Devolver códigos de status razonables (200/201 éxito, 400/422 validación, 401/403 auth, 404 no
  encontrado, 500 error de servidor) — mejor que copiar ciegamente el 401 genérico visto en algunos
  endpoints existentes (ese es un ejemplo de status poco semántico, no un patrón a imitar).

### Webhooks (si aplica)

Si el endpoint es un webhook de pago, seguir el patrón de
`src/app/api/webhooks/stripe/route.ts`: verificar firma primero, responder 2xx rápido, procesar en
background con `.catch()` sin bloquear la respuesta.

### Server action (alternativa)

Si el feature se invoca solo desde un Server Component (no necesita ser un endpoint HTTP público),
generar una server action en `src/server-actions/` en vez de un route handler — preguntar al usuario
cuál corresponde si no es obvio por el contexto.

---

## Output Format

La skill genera:

### 1. El route handler (o server action)

`src/app/api/{feature}/{operacion}/route.ts` (o server action equivalente)

### 2. Cambios al modelo (si hacen falta campos nuevos)

Diff propuesto para `src/models/{feature}Model.js` — campos nuevos con `default`, nunca
`required: true` sin default sobre una colección existente.

---

## Workflow

### 1. Leer contexto

Anotar: patrón de endpoints existente, si el área usa subcarpeta-por-operación o métodos HTTP
múltiples, si requiere auth.

### 2. Inspeccionar código existente

Leer un route handler real del área más cercana (o la más parecida) para igualar el estilo.

### 3. Confirmar el plan de generación

Antes de escribir ningún archivo, presentar:

```md
## Generation Plan

**Recurso:** {feature}
**Archivo(s):** src/app/api/{feature}/{operacion}/route.ts
**Requiere auth/rol:** sí/no — [cuál]

| Operación | Método | Ruta | Descripción |
|-----------|--------|------|-------------|
| create | POST | /api/{feature}/create | ... |

**Cambios al modelo:** [ninguno / lista de campos nuevos con default]

Confirmá con "Generar" para proceder.
```

Esperar aprobación.

### 4. Generar después de aprobación

### 5. Self-check

```md
## Self-Check

- [ ] try/catch en el handler
- [ ] Verificación de rol/sesión si corresponde
- [ ] Delegación a Mongoose, sin lógica de negocio compleja mezclada con parsing de request
- [ ] Campos nuevos del modelo con `default`, no `required: true` sin default
- [ ] Status codes semánticos
- [ ] Sin secretos hardcodeados — todo vía `process.env`
- [ ] Si es webhook: firma verificada, respuesta rápida, procesamiento en background
```

---

## Success Criteria

- El endpoint sigue el patrón real del área vecina (subcarpeta vs. métodos múltiples).
- Delega correctamente a Mongoose.
- Maneja errores con try/catch.
- No introduce una capa de validación ajena al estilo del módulo tocado.
- El self-check pasa completo.

---

## Anti-Patterns

No:

- Inventar una arquitectura en capas (DAO/service/controller) que este proyecto no tiene — Next.js API
  routes acá delegan directo a Mongoose.
- Generar sin leer primero un endpoint real del área.
- Agregar zod/yup si el vecino no lo usa (mencionarlo como sugerencia aparte, no imponerlo).
- Saltear la confirmación del plan de generación.
- Dejar un webhook de pago sin verificación de firma.
