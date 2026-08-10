# Backend Context — MMove Course Platform

> Reglas específicas del backend: API routes (`src/app/api/**`), server actions
> (`src/server-actions/**`), modelos de Mongoose (`src/models/**`), servicios externos
> (`src/services/**`), scripts (`scripts/**`).
> Para reglas cross-stack, ver [`AGENTS.md`](AGENTS.md).
> Para reglas de frontend, ver [`AGENTS-frontend.md`](AGENTS-frontend.md).
>
> Este archivo contiene solo información que no se infiere leyendo el código. No agregar: convenciones
> estándar de Next.js/Node, explicaciones de qué es un route handler.

---

## Estructura del backend — capas reales

| Capa | Dónde | Responsabilidad |
|------|-------|------------------|
| Route handlers | `src/app/api/**/route.ts` (o `.js`) | Reciben el request, parsean, delegan, responden con `NextResponse` |
| Server actions | `src/server-actions/**` (ej. `auth/`) | Lógica invocada directo desde componentes de servidor, sin pasar por `fetch` a una API route |
| Modelos | `src/models/*Model.js` | Schemas de Mongoose. Patrón: `mongoose.models.X || mongoose.model('X', schema)` para evitar el error de recompilación en dev/hot-reload |
| Servicios externos | `src/services/{ai,api,email,instagram}/**` | Integraciones con Anthropic/OpenAI/Google AI, Mailchimp/SendGrid/Nodemailer, Instagram |
| Config de conexión | `src/config/connectDB.ts` (verificado) | `connectDB()` se llama a nivel de módulo en varias route handlers actuales — ver Landmines |
| Scripts | `scripts/*.js` | Seeds, backfills, tareas puntuales de datos — no forman parte del build de Next.js |

## Convención real observada en route handlers

Los route handlers existentes (ej. `src/app/api/individualClass/create/route.js`) siguen este patrón:

```js
import connectDB from '.../config/connectDB';
import Model from '.../models/xModel';
import { NextResponse } from 'next/server';

connectDB(); // llamado a nivel de módulo, no dentro del handler

export async function POST(req) {
  try {
    const { field1, field2 } = await req.json();
    // ... validación manual, sin capa de schema de validación (zod/yup) generalizada
    const doc = await new Model({ ... }).save();
    return NextResponse.json({ message: '...' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 401 }); // status codes no siempre semánticos
  }
}
```

**No inventar una capa de validación (zod/yup) si el módulo que estás tocando no la usa** — seguir el
patrón del archivo vecino. Si el proyecto empieza a adoptar una librería de validación de forma
consistente, documentarlo acá.

## Landmines — no modificar sin entender

- **`connectDB()` a nivel de módulo**: varios route handlers llaman `connectDB()` fuera del handler
  (al importar el archivo), no dentro de la función. Esto es el patrón existente — no "corregirlo" a
  una llamada dentro del handler sin verificar que no rompa nada, y no asumir que todos los archivos
  lo hacen igual (revisar el archivo vecino real antes de replicar).
- **Webhooks de Stripe y MercadoPago** (`src/app/api/webhooks/**`): deben responder 2xx rápido
  (Stripe corta a los ~10s) y procesar la lógica pesada en background (`.catch()` sin `await` del
  lado del handler, ver `src/app/api/webhooks/stripe/route.ts`). Verificar siempre la firma
  (`constructStripeEvent` / equivalente MercadoPago) antes de procesar. Un evento puede llegar
  duplicado — la lógica downstream debe tolerar reprocesamiento.
- **Autorización manual, no middleware centralizado por ruta**: la verificación de rol/admin se hace
  dentro de cada handler (ej. `if (user.rol !== 'Admin') return NextResponse.json(...)`), no vía un
  middleware genérico de autorización por API route. Revisar `middleware.ts` en la raíz para lo que sí
  está centralizado (rutas protegidas a nivel Next.js) antes de asumir que un endpoint nuevo queda
  protegido automáticamente.
- **IDs numéricos manuales conviviendo con `_id` de Mongo**: varios modelos (ej. `IndividualClass`)
  mantienen un campo `id: Number` autoincremental calculado a mano (`lastClass[0].id + 1`) además del
  `_id` de Mongo. Es una condición de carrera potencial (dos requests concurrentes pueden calcular el
  mismo `id`) — documentado como landmine conocido, no lo "arregles" de forma oportunista dentro de
  una feature no relacionada; si lo tocás, avisar explícitamente.
- **Envío de emails inline en el handler**: algunos endpoints (ej. creación de clase) disparan envío
  de mails a todos los usuarios confirmados directamente dentro del route handler, con
  `Promise.all` sobre el listado completo de usuarios. Esto no está en background/cola — es
  potencialmente lento y puede timeoutear en Vercel (límite de duración de función). No asumir que
  hay una cola de mails; si se agrega una, documentarlo acá.
- **Modelos huérfanos `moduleModel.js`, `courseModel.js`, `enrollmentModel.js`, `progressModel.js`**:
  cero referencias reales en `src/` (solo aparecen en el caché de graphify). Es un sistema paralelo de
  "Course/Lesson/Enrollment/Progress" que nunca se conectó al flujo real de productos. No usarlos como
  base ni como referencia de implementación para features nuevas de cursos/progreso — el sistema real
  vive en `productModel.js` (`tipo: 'curso'`) + `courseClassModel.js`.
- **`src/lib/courseAccess.ts` depende de fechas**: `canUserAccessCursoContenido` /
  `isCursoContenidoDisponible` están atadas a `cursoConfig.publicado`/`fechaPublicacion`. No reutilizar
  para ningún producto/flujo que deba ser evergreen o "sin fechas" — devuelven bloqueado si no hay
  `cursoConfig`, y comparan contra una fecha de lanzamiento que no todos los tipos de producto tienen.
- **`src/app/api/product/createProduct/route.js` y `updateProduct/route.js` whitelisted por campo**: no
  aceptan el body arbitrariamente — desestructuran explícitamente cada campo y arman un objeto fijo
  antes de `Product.create`/actualizar. Agregar un `tipo` o sub-config nuevo a `productModel.js` NO
  alcanza para que se persista: hay que agregar el campo también en ambos route handlers.

## Cambios de esquema (Mongoose / MongoDB)

No hay sistema de migraciones versionado. Reglas:

- **Agregar un campo**: agregarlo al `Schema` con `default` (nunca `required: true` sin default en un
  campo nuevo sobre una colección con documentos existentes — rompería lecturas/validación en
  documentos viejos si el código empieza a asumir su presencia).
- **Backfill de datos existentes**: script puntual en `scripts/`, siguiendo el estilo de los scripts
  existentes (ver `createMentorshipPlans.js`). Idempotente cuando sea posible (verificar antes de
  insertar/actualizar).
- **Nunca eliminar un campo en uso** sin verificar que ningún componente/endpoint lo lea.
- Ver la skill `db-migration` para el flujo guiado.

## Modelos y relaciones — dónde mirar

Los modelos relevantes al dominio del curso/membresía están en `src/models/`: `userModel`,
`courseModel`, `classModel`/`individualClassModel`/`virtualClassModel`/`inPersonClassModel`,
`moduleModel`/`moduleClassModel`, `planModel`, `productModel`, `mentorshipPlanModel`/
`mentorshipRequestModel`, `enrollmentModel`, `billModel`. Ver `.claude/domain-concepts.md` para el
significado de cada entidad y sus relaciones — no inferirlas solo del nombre del archivo.

## JSON / respuestas

No hay una envoltura de respuesta estandarizada (`{ success, data, error }`) en todos los endpoints —
el formato varía por archivo. Seguir el patrón del endpoint vecino más cercano al que estás tocando en
lugar de inventar un formato nuevo, salvo que se decida estandarizar (en ese caso, documentarlo acá).

---

## Changelog

| Fecha | Cambio | Disparador |
|-------|--------|------------|
| 2026-07-30 | Creación inicial — landmines de `connectDB()` a nivel de módulo, IDs numéricos manuales, emails inline sin cola, y convención real de route handlers, documentados a partir de `individualClass/create/route.js`, `individualClassModel.js` y `webhooks/stripe/route.ts` | Migración de contexto desde Cursor / adaptación del framework `.claude/` de uContact |
