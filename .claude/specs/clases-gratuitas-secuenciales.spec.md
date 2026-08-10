# Spec — Producto de clases gratuitas secuenciales

> Generado por `feature-refinement`. NO contiene código de implementación — es el contrato para
> `feature-implementation`. Decisiones confirmadas por el desarrollador el 2026-08-09.

## 1. Resumen

Nuevo tipo de producto gratuito, evergreen (sin fechas), compuesto por una serie ordenada de
`CourseClass`. Desbloqueo secuencial basado 100% en el comportamiento del usuario: la Clase N (N>1) se
desbloquea cuando el usuario **entra** a la Clase N-1. El desbloqueo es persistente e independiente de
cualquier fecha (lanzamiento, registro, campaña).

- `Product.tipo` nuevo valor: **`clases_gratuitas_secuenciales`**
- Ruta pública dedicada: **`/clases-gratis/[slug]`** y **`/clases-gratis/[slug]/clase/[classId]`**
  (no se reutiliza el dispatcher legacy `/products/[name]` ni se anida bajo `/(curso)/[cursoNombre]`).
- Acceso: **auto-enroll al primer acceso autenticado** (sin paso explícito de "empezar producto").
- Modelo de acceso: **modelo nuevo dedicado** (`ProductAccess`), no se reutiliza
  `User.cursosAdquiridos`.
- Estado `completed`: **reservado en el enum, sin trigger implementado en esta iteración.**

---

## 2. Ambigüedades resueltas durante el refinamiento

| # | Ambigüedad | Resolución |
|---|------------|------------|
| 1 | Naming del tipo de producto y ruta pública | `tipo: 'clases_gratuitas_secuenciales'`; ruta `/clases-gratis/[slug]`. Confirmado por el desarrollador. |
| 2 | ¿Necesita "acceso al producto" explícito un producto gratis? | Sí: auto-enroll automático en el primer acceso autenticado (producto o Clase 1), sin click de "empezar". Confirmado por el desarrollador. |
| 3 | ¿Reusar `User.cursosAdquiridos` o modelo nuevo? | Modelo nuevo dedicado (`ProductAccess`) — evita interferir con `fulfillCoursePurchase.ts` y el flujo de pagos real. Confirmado por el desarrollador. |
| 4 | Disparador y uso del estado `completed` | No se implementa en esta iteración. Campo reservado en el enum del modelo de progreso, sin ningún trigger (no se conecta `onEnded` del player). Confirmado por el desarrollador. |
| 5 | Reordenamiento admin vs. progreso ya otorgado | Los registros de progreso ya creados (`CourseClassProgress`) son inmutables — nunca se borran ni se revocan. La elegibilidad de clases **sin iniciar** se recalcula siempre contra el `order` **actual** de `CourseClass` en el momento del chequeo, nunca contra un order histórico. Confirmado por el desarrollador. Ver §7 "Reordenamiento" para la consecuencia exacta sobre clases insertadas en el medio. |
| 6 (Fase 1, ítem 4 — ALTA, ya decidida sin necesidad de confirmación) | Qué cuenta como "entrar/iniciar" una clase | El backend marca `started` en el momento en que el GET del detalle de la clase confirma y devuelve acceso (pasó el chequeo de desbloqueo) — no cuando el usuario hace click en un popup de "Empezar" ni cuando el video arranca. |

---

## 3. Modelos

### 3.1 `Product` (extensión — `src/models/productModel.js`)

Cambios (aditivos, con default, no rompen documentos existentes — regla de `AGENTS-backend.md` §Cambios de esquema):

```js
tipo: { type: String, enum: ['curso', 'bundle', 'evento', 'programa_transformacional', 'recurso', 'clases_gratuitas_secuenciales'], required: true },
```

Nuevo sub-schema y campo (paralelo a `cursoConfig`, sin heredar su complejidad de landing comercial —
testimonios, preventa, planes de pago no aplican a un producto gratis):

```js
const secuenciaGratuitaConfigSchema = new mongoose.Schema({
  slug: { type: String, trim: true, lowercase: true },
  publicado: { type: Boolean, default: true }, // toggle manual del admin, NUNCA una fecha
}, { _id: false });

// dentro de productSchema:
secuenciaConfig: secuenciaGratuitaConfigSchema,
```

- `precio` sigue siendo `required` en el schema existente — para este tipo se guarda `0` (no se
  relaja el `required`, no hace falta).
- No se agrega `fechaPublicacion` ni ningún campo de fecha a `secuenciaConfig` — sería una violación
  directa del requerimiento ("no debe depender de fechas de ningún tipo").

### 3.2 `CourseClass` — REUTILIZADO SIN CAMBIOS (`src/models/courseClassModel.js`)

Se reutiliza tal cual. Para este tipo de producto, `timelineIndex` se fija siempre en `0` (no hay
"módulos" — es una lista plana). El campo `order` ya existente es la base del desbloqueo.

### 3.3 `ProductAccess` — NUEVO (`src/models/productAccessModel.js`)

Registro de que un usuario tiene acceso a un producto gratuito (independiente de `cursosAdquiridos`,
que es exclusivo del flujo de pago real).

```js
import mongoose from 'mongoose';

const productAccessSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    grantedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

productAccessSchema.index({ userId: 1, productId: 1 }, { unique: true });
productAccessSchema.index({ userId: 1 });

const ProductAccess =
  mongoose.models.ProductAccess || mongoose.model('ProductAccess', productAccessSchema);
export default ProductAccess;
```

### 3.4 `CourseClassProgress` — NUEVO (`src/models/courseClassProgressModel.js`)

Análogo a `ModuleClassCompletion` (mismo patrón de índice único userId+clase), pero para `CourseClass`
y con estado en vez de solo "completado". La **existencia** de un documento = la clase fue iniciada.

```js
import mongoose from 'mongoose';

const courseClassProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseClass', required: true },
    /** Denormalizado: permite traer todo el progreso de un producto sin joinear por CourseClass. */
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    /**
     * 'completed' está reservado para una iteración futura — NO se setea en esta feature.
     * No conectar ningún evento del player (onEnded) a este valor todavía.
     */
    status: { type: String, enum: ['started', 'completed'], default: 'started' },
    startedAt: { type: Date, default: () => new Date() },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

courseClassProgressSchema.index({ userId: 1, courseClassId: 1 }, { unique: true });
courseClassProgressSchema.index({ userId: 1, productId: 1 });

const CourseClassProgress =
  mongoose.models.CourseClassProgress ||
  mongoose.model('CourseClassProgress', courseClassProgressSchema);
export default CourseClassProgress;
```

No existe estado persistido `not_started`: su ausencia de documento **es** `not_started`. Esto es
deliberado — evita tener que crear filas para todas las clases de todos los usuarios de antemano.

---

## 4. Función de acceso (sin dependencia de fechas)

**Nueva** — `src/lib/freeSequentialAccess.ts`. NO reutilizar `canUserAccessCursoContenido` /
`isCursoContenidoDisponible` de `src/lib/courseAccess.ts`: esas funciones devuelven `false` cuando no
hay `cursoConfig`, y comparan contra `fechaPublicacion` — ambos comportamientos son incompatibles con
la regla "sin fechas" de este producto (era el RIESGO DE BUG #1 identificado en el refinamiento).

Responsabilidades de este archivo:

```ts
type SessionUser = { _id: string | { toString(): string }; rol?: string } | null;

/** Auto-enroll idempotente. Se llama en TODO GET autenticado (producto o clase). */
async function ensureProductAccess(userId: string, productId: string): Promise<void>;
// implementación: ProductAccess.findOneAndUpdate(
//   { userId, productId },
//   { $setOnInsert: { grantedAt: new Date() } },
//   { upsert: true }
// )
// Admin: no necesita fila de ProductAccess — bypass directo por rol, igual que userHasCourseAccess.

/** ¿El usuario puede ver el listado del producto / la Clase 1? */
function canAccessProduct(user: SessionUser): { ok: boolean; reason?: 'no_auth' };
// Solo chequea autenticación. NINGÚN chequeo de fecha ni de "publicado" para el usuario final
// (secuenciaConfig.publicado es un toggle de admin: si es false, el producto directamente no se
// busca/expone — no es un "reason" de bloqueo por usuario, es un 404 a nivel de query).

/** ¿La clase con `order` targetOrder está desbloqueada para este usuario? */
async function isClassUnlocked(
  userId: string,
  productId: string,
  targetOrder: number
): Promise<boolean>;
// Regla: order === MIN(order) del producto -> true (siempre, si hay ProductAccess).
// Si no es la primera: buscar el CourseClass con el mayor `order` estrictamente menor a targetOrder
// dentro de ese productId (recalculado contra el order ACTUAL, nunca cacheado). Si no existe -> true
// (es la primera). Si existe -> unlocked = existe CourseClassProgress(userId, esa clase._id).

function freeSequentialBlockedMessage(reason: 'no_auth' | 'locked'): string;
// 'no_auth' -> 'Iniciá sesión para acceder a este contenido.'
// 'locked'  -> 'Primero tenés que desbloquear esta clase.'
```

---

## 5. Endpoints / route handlers

### 5.1 Reutilizados sin cambios (ya son genéricos, no filtran por `product.tipo`)

Verificado leyendo el código real:

- `POST /api/course-classes` (`src/app/api/course-classes/route.ts`) — crear clase. Ya acepta
  `productId`, `timelineIndex`, `name`, `order`, etc. sin gating por tipo de producto. Se usa enviando
  `timelineIndex: 0`.
- `GET /api/course-classes?productId=…` — listar clases de un producto (uso admin, para poblar el
  formulario de edición/reordenamiento).
- `PATCH /api/course-classes/[id]` — editar una clase, incluido `order` (ya está en el whitelist de
  campos editables). **Este es el mecanismo de reordenamiento del admin** — no hace falta un endpoint
  nuevo de "reorder", el admin actualiza el `order` de cada clase afectada con llamadas PATCH.
- `DELETE /api/course-classes/[id]` — borrar clase.

**NO reutilizable:** `GET /api/course-classes/[id]` (el existente) — hace `if (!product || product.tipo
!== 'curso') return 404` y aplica `canUserAccessCursoContenido` (con su lógica de fechas). Por eso el
detalle de clase para este producto es un endpoint nuevo (§5.2).

### 5.2 Nuevos

**`GET /api/free-sequential/[slug]/contenido`** — `src/app/api/free-sequential/[slug]/contenido/route.ts`

- Auth: pública a nivel de ruta, pero requiere sesión para devolver contenido (ver comportamiento).
- Busca `Product.findOne({ tipo: 'clases_gratuitas_secuenciales', 'secuenciaConfig.slug': slug, activo:
  true })`. Si `secuenciaConfig.publicado === false` y el usuario no es Admin → 404 (igual trato que
  "no existe", no se filtra info de que existe pero no está publicado).
- Si no hay producto → 404.
- Obtiene el usuario de sesión (mismo patrón JWT de `curso/[slug]/contenido/route.ts`:
  `cookies().get('userToken')`, `verify(...)`, `Users.findById(userId).select('rol')`).
- Si no hay usuario → 401 con `{ error: freeSequentialBlockedMessage('no_auth'), reason: 'no_auth' }`.
- Si hay usuario → `ensureProductAccess(userId, product._id)` (auto-enroll idempotente).
- Trae todas las `CourseClass` del producto ordenadas por `order` asc, y todos los
  `CourseClassProgress` del usuario para ese `productId`.
- Devuelve, por clase, en **dos shapes distintos según esté desbloqueada o no** (mitigación del RIESGO
  DE BUG #2 — no filtrar video de clases bloqueadas):

  ```jsonc
  // clase desbloqueada
  { "_id": "...", "order": 1, "name": "...", "description": "...", "videoThumbnail": "...",
    "duration": 300, "materials": [...], "unlocked": true, "status": "started" /* o "completed" */,
    "videoUrl": "...", "videoId": "...", "pdfUrl": "..." }

  // clase bloqueada — SIN videoUrl/videoId/pdfUrl
  { "_id": "...", "order": 2, "name": "...", "description": "...", "videoThumbnail": "...",
    "duration": 300, "unlocked": false, "status": "not_started" }
  ```

**`GET /api/free-sequential/classes/[id]`** — `src/app/api/free-sequential/classes/[id]/route.ts`

- Valida `ObjectId`. Busca `CourseClass`; si no existe → 404.
- Busca su `Product`; si no es `tipo: 'clases_gratuitas_secuenciales'` (o no está publicado y el
  usuario no es Admin) → 404.
- Sin usuario → 401, `{ error: freeSequentialBlockedMessage('no_auth'), reason: 'no_auth' }`.
- Con usuario → `ensureProductAccess(userId, product._id)`.
- `isClassUnlocked(userId, productId, doc.order)`:
  - `false` → **403**, `{ error: freeSequentialBlockedMessage('locked'), reason: 'locked' }`. NUNCA
    incluir `videoUrl`/`videoId`/`pdfUrl` en esta respuesta.
  - `true` → upsert atómico de progreso (mitigación del RIESGO DE BUG #3 — concurrencia):
    ```js
    await CourseClassProgress.findOneAndUpdate(
      { userId, courseClassId: doc._id },
      { $setOnInsert: { productId: product._id, status: 'started', startedAt: new Date() } },
      { upsert: true, new: true }
    );
    ```
    (Depende del índice único `{ userId: 1, courseClassId: 1 }` de §3.4 para ser seguro ante dos
    requests concurrentes — si de todas formas ocurre un `E11000` por una carrera real, tratarlo como
    éxito idempotente: refetch y continuar, no devolver 500.)
  - Devuelve el `CourseClass` completo + `previousClassId`/`nextClassId` (por `order` dentro del mismo
    producto) + `nextUnlocked: boolean` (para que el nav "Clase siguiente →" solo sea clickeable si
    corresponde).

No hace falta un endpoint separado de "marcar progreso" — la escritura ocurre como efecto colateral
idempotente del propio GET de detalle, que es exactamente cuándo el requerimiento dice que debe pasar
("al entrar a una clase").

### 5.3 A extender (no crear desde cero) — creación/edición de producto

`src/app/api/product/createProduct/route.js` y `src/app/api/product/updateProduct/route.js` (mismo
patrón — a confirmar en implementación, no se leyó completo) **NO aceptan campos arbitrarios**: ambos
desestructuran explícitamente el body (`const { nombre, descripcion, tipo, precio, ... } = data`) y arman
un objeto `productoData` con una lista fija de campos antes de `Product.create(...)`. Para que
`secuenciaConfig` se guarde hace falta:

1. Agregar `secuenciaConfig` a la desestructuración de `data`.
2. Agregar `secuenciaConfig: tipo === 'clases_gratuitas_secuenciales' ? secuenciaConfig : undefined` al
   literal `productoData` en la rama `else` de `createProduct/route.js` (la rama `tipo === 'evento' &&
   data.precios` no aplica a este tipo, no hace falta tocarla).
3. Replicar el mismo agregado en `updateProduct/route.js`.

Este tipo de producto **nunca** debe entrar en las ramas de Stripe (`createEventProductWithPrices`,
`createCourseOneTimePayments`) — son exclusivas de `tipo === 'evento'` y `tipo === 'curso'`
respectivamente, y ya están correctamente gateadas por esas comparaciones exactas, así que no requieren
cambios para excluir el nuevo tipo.

---

## 6. Frontend

### 6.1 Público — NUEVO

- `src/app/clases-gratis/[slug]/page.tsx` — página de listado del producto. Server/client component
  que llama a `GET /api/free-sequential/[slug]/contenido`. Sin sesión → redirigir a
  `/iniciar-sesion?redirect=/clases-gratis/[slug]` (confirmar el patrón exacto de `redirect` con el
  `useAuth` hook existente en implementación).
- `src/components/PageComponent/FreeSequential/FreeSequentialProductList.tsx` — NUEVO. Lista de clases
  con estilo visual diferenciado para bloqueadas (mismo título/descripción/número/thumbnail, sin CTA de
  play). Click en clase bloqueada → mensaje inline/toast simple ("Primero tenés que desbloquear esta
  clase"), sin navegar.
- `src/app/clases-gratis/[slug]/clase/[classId]/page.tsx` — NUEVO, wrapper delgado (mismo patrón que
  `src/app/(curso)/[cursoNombre]/contenido/clase/[classId]/page.tsx`).
- `src/components/PageComponent/FreeSequential/FreeSequentialClassPractice.tsx` — NUEVO. Estructuralmente
  espejo de `CourseClassPractice.tsx` (reutilizar `MoveCrewVideoPlayer`, mismo patrón de sidebar +
  nav anterior/siguiente), pero:
  - Sin el banner de CTA de mentoría al final (`isLastClassOfModule` / `MENTORSHIP_CTA`) — no aplica a
    un lead magnet.
  - "Clase siguiente →" deshabilitada/no-link si `nextUnlocked === false` (viene del endpoint de
    detalle).
  - No conectar `onEnded` del player a ningún estado de progreso — decisión #4, `completed` no se
    implementa esta iteración.

### 6.2 Admin — extensión

- `src/components/PageComponent/Products/CreateProductStep1.tsx` (o el selector de tipo que corresponda)
  — agregar `clases_gratuitas_secuenciales` como opción del `<select>` de tipo (con
  `text-gray-900 bg-white`, regla no negociable de `CLAUDE.md`).
- **Recomendación**: no meter esta rama dentro de `CreateProduct.tsx`/`EditProduct.tsx` — esos
  componentes ya están fuertemente acoplados a `curso`/`evento`/`programa_transformacional` y tocar su
  árbol de condicionales para un tipo completamente distinto arriesga romper productos existentes
  (regla explícita: "no romper productos existentes"). Proponer un componente y ruta admin **nuevos y
  aislados**:
  - `src/app/admin/productos/crear-producto/clases-gratis/page.tsx` (NUEVO)
  - `src/components/PageComponent/Products/CreateFreeSequentialProduct.tsx` (NUEVO) — formulario simple:
    `nombre`, `descripcion`, `portada` (reusa upload a Cloudinary existente), `secuenciaConfig.slug`,
    `secuenciaConfig.publicado` (checkbox), `precio` fijo en `0` (no editable, o directamente no se
    manda y se deja el default del backend), y una lista repetible de clases.
  - Para la lista de clases: reutilizar la **forma de campos** de
    `src/components/PageComponent/Products/CursoClaseContenidoFields.tsx` (mismos inputs: nombre, nivel,
    descripciones, URL/ID de Vimeo, duración, thumbnail, PDF, materiales) — como componente nuevo
    `CourseClassFields.tsx` desacoplado de `CursoClaseContenido` (el tipo de `cursoConfig`) y atado
    directamente a los endpoints reutilizados `POST/PATCH/DELETE /api/course-classes` en vez de al
    array embebido de `cursoConfig.contenidoModulos`. Mantener el mismo patrón de clases visibles de
    input (`text-gray-900 bg-white placeholder:text-gray-500`).
  - Reordenamiento: sin librería de drag-and-drop en el proyecto (se verificó — no hay
    `@dnd-kit`/`react-beautiful-dnd` en uso dentro de `Products/`). Seguir el patrón existente más
    simple: input numérico de `order` por clase (ya es como se maneja `order`/`orden` en el resto del
    admin), con botones "▲/▼" opcionales que intercambian valores de `order` entre dos clases
    adyacentes y disparan dos `PATCH` — decisión de UX de implementación, no bloqueante para el spec.
- `src/app/admin/productos/editar-producto/...` — análogamente, una vista de edición nueva y aislada
  para este tipo (no forzarlo dentro de `EditProduct.tsx`).
- `src/components/PageComponent/Products/AllProducts.tsx` / `ProductsFilters.tsx` — agregar el nuevo
  tipo a cualquier filtro/listado de tipos existente (cambio menor, solo para que el producto aparezca
  correctamente listado/filtrable en `/admin/productos`).

---

## 7. Regla exacta de desbloqueo

1. La clase con el `order` mínimo dentro de un `productId` está desbloqueada para cualquier usuario con
   `ProductAccess` (userId, productId) vigente — no depende de ningún progreso previo.
2. Cualquier otra clase (`order` = N) está desbloqueada si y solo si existe un `CourseClassProgress`
   para el usuario en la clase cuyo `order` es el **inmediatamente anterior según el order actual**
   dentro del mismo producto (no el ID consecutivo, no un order histórico).
3. El cálculo es **dinámico**, no se guarda un booleano "unlocked" por clase — se deriva en cada
   request de (a) el `order` actual de todas las `CourseClass` del producto y (b) los
   `CourseClassProgress` existentes del usuario.
4. **Reordenamiento**: si el admin reordena, los `CourseClassProgress` ya creados nunca se tocan ni se
   borran (persistencia garantizada literalmente — nada los revoca). Lo que **sí** puede cambiar es la
   elegibilidad de una clase que el usuario **todavía no había iniciado**: si se inserta una clase nueva
   entre dos que el usuario ya veía como "desbloqueada pero no iniciada", esa clase antigua puede pasar
   a depender de la clase nueva recién insertada. Esto es la consecuencia aceptada y documentada de la
   decisión #5 — no es un bug, es el comportamiento esperado ("siempre clase anterior según order
   actual").

---

## 8. Casos límite — resolución concreta

| # | Caso | Resolución |
|---|------|------------|
| 1 | Usuario nuevo | Solo `order` mínimo desbloqueado (regla §7.1). Requiere `ProductAccess`, que se crea automáticamente en el primer GET autenticado. |
| 2 | Entra directo a URL de Clase 3 sin haber iniciado Clase 2 | `GET /api/free-sequential/classes/[id]` → `isClassUnlocked` = false → 403 con mensaje simple, sin `videoUrl`. El frontend muestra bloqueo, no el player. |
| 3 | Ya desbloqueó Clase 3, pasa mucho tiempo | `CourseClassProgress` no tiene TTL ni depende de fecha — sigue existiendo indefinidamente. Acceso íntegro. |
| 4 | Refresh de página | El estado se recalcula desde el backend en cada GET — no hay `localStorage` ni caché de cliente como fuente de verdad. |
| 5 | Apertura simultánea de dos clases (misma o distinta) | Cada GET de detalle hace su propio `findOneAndUpdate` con `upsert` sobre el índice único `{userId, courseClassId}` — atómico, sin condición de carrera de "leer, decidir en JS, escribir". |
| 6 | Usuario sin autenticación | 401 en ambos endpoints nuevos; el frontend redirige a login/registro antes de mostrar cualquier contenido del producto. |
| 7 | Usuario autenticado sin acceso al producto | No aplica un bloqueo adicional post-login: el acceso se auto-otorga en el mismo request donde se detecta la sesión (decisión #2). No existe un estado "logueado pero sin acceso" para este tipo de producto salvo que `secuenciaConfig.publicado === false` (→ 404, tratado como "no existe" salvo Admin). |
| 8 | Última clase | `nextClassId` es `null` — no se intenta desbloquear nada. UI no muestra "Clase siguiente →". |
| 9 (proactivo) | Filtración de video en clases bloqueadas vía payload | El endpoint de listado (§5.1) omite `videoUrl`/`videoId`/`pdfUrl` para toda clase con `unlocked: false`. El endpoint de detalle nunca devuelve el doc completo si `isClassUnlocked` es `false` (403 sin body de contenido). |
| 10 (proactivo) | Reordenamiento admin con progreso ya otorgado | Ver §7.4 — comportamiento documentado y aceptado, no revoca progreso ya creado, sí puede afectar elegibilidad de clases no iniciadas. |

---

## 9. Qué NO generar / NO tocar

- No recrear `freeProductModel.js` ni reutilizar sus rutas (`/productos/gratis/[name]`,
  `/products/free/[name]`) — es un sistema legacy de un solo video hardcodeado a un componente
  específico (`FreeProducts/Mobility-Articular/Index.jsx`), no genérico.
- No reutilizar ni modificar `moduleModel.js`, `courseModel.js`, `enrollmentModel.js`,
  `progressModel.js` — confirmado que son modelos huérfanos (cero referencias reales en `src/`, solo
  aparecen en el caché de graphify). No son parte del flujo real de la plataforma.
- No tocar `User.cursosAdquiridos`, `fulfillCoursePurchase.ts`, ni ningún handler bajo
  `src/app/api/payments/**` o `src/app/api/webhooks/**` — este producto no involucra pagos ni
  webhooks, y el modelo de acceso es deliberadamente independiente (decisión #3).
- No reutilizar `canUserAccessCursoContenido` / `isCursoContenidoDisponible`
  (`src/lib/courseAccess.ts`) — dependen de `cursoConfig` y de fechas, incompatibles con este producto.
- No implementar ningún job, cron o timer de desbloqueo por días transcurridos — el desbloqueo es
  100% reactivo al comportamiento del usuario (Mailchimp maneja los emails fuera de este repo).
- No conectar el evento `onEnded` del video player a `CourseClassProgress.status` — el estado
  `completed` queda reservado en el enum sin lógica que lo dispare (decisión #4).
- No agregar tests unitarios — no hay test harness en este repo (`CLAUDE.md` regla 5).
- No crear una migración formal — los cambios de schema (`Product.tipo`, `Product.secuenciaConfig`)
  son aditivos con default, no requieren backfill (ver skill `db-migration` si en implementación surge
  la necesidad de un script puntual en `scripts/`, pero no se anticipa ninguno).

---

## 10. Reglas no negociables aplicables (recordatorio)

- Todo `<input>`/`<textarea>`/`<select>` nuevo en el admin: `text-gray-900 bg-white
  placeholder:text-gray-500` (`<select>` sin la clase de placeholder).
- Verificar rol Admin manualmente en cada nuevo handler admin (no hay middleware centralizado) — seguir
  el patrón `requireAdmin()` visto en `src/app/api/course-classes/[id]/route.ts`.
- Antes de tocar `/admin/productos` (canónico, confirmado por `AdminDashboardSideBar.tsx`) vs.
  `/admin/products` (huérfano, no enlazado) — usar siempre el árbol `/admin/productos`.
