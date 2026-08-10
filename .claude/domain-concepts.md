# Domain Concepts — MMove Course Platform

Leer este archivo antes de trabajar en una feature nueva o un área desconocida del proyecto.

> Documenta el **dominio de negocio** (qué significa cada entidad y cómo se relacionan), a partir de
> `src/models/*.js` y del uso real en `src/app/api/`. Para patrones de código de la capa de backend,
> ver [`backend-architecture.md`](backend-architecture.md); para reglas de proyecto, ver
> [`Agents.MDs/AGENTS.md`](Agents.MDs/AGENTS.md).
>
> **Nota de honestidad:** algunas entidades abajo están descriptas a partir del nombre del modelo y
> uso superficial, no de una lectura completa de cada schema — están marcadas como *(inferido, a
> verificar)*. Antes de asumir un campo/relación específico, leer el modelo real en `src/models/`.

---

## Qué es esta plataforma

Una plataforma de cursos y membresías con UI estilo Netflix. Aloja video en YouTube/Vimeo (oculto) para
lograr acceso tipo Patreon: el contenido solo es accesible con membresía activa o compra puntual. Dos
roles principales:

- **Usuario/Alumno** — consume clases, cursos, mentoría; paga por membresía o producto puntual.
- **Admin** — gestiona contenido, usuarios, planes y pagos desde `src/app/admin`.

---

## Entidades verificadas

### User (`userModel.js`)
Usuario de la plataforma. Tiene un campo `rol` (usado para distinguir Admin — ver
`AGENTS-backend.md` § Autorización manual) y campos de suscripción/VIP (`isVip`,
`subscription.active`, vistos en uso real desde `individualClass/create/route.js`). Relacionado con
`Bill`, `Enrollment`, `MentorshipRequest`.

### IndividualClass (`individualClassModel.js`) — verificado en detalle
Una clase de video individual (no parte de un curso estructurado). Campos clave: `id` (numérico manual
— ver landmine en `AGENTS-backend.md`), `moduleId` (ref a `ClassModule` — filtro principal, ej.
Movimiento/Movilidad/Handbalance), `submoduleSlug`, `isFree`, `visibleInLibrary` (si `false`, la clase
solo aparece en el weekly path hasta que un job la publique), `tags`, `links`, `atachedFiles`, datos de
video de Vimeo (`html`, `link`, `image_base_link`, duración).

### ClassModule (`classModuleModel.js`) — *(inferido, a verificar)*
Módulo/categoría principal de clases (ej. Movimiento, Movilidad, Handbalance) — filtro de nivel
superior sobre `IndividualClass`. Cada módulo tiene un `slug` usado como `type` en las clases.

---

## Entidades por nombre de modelo — agrupadas por área (inferido, a verificar)

### Cursos y clases estructuradas
- `courseModel` — un curso (contenedor de módulos/clases).
- `courseClassModel` — clase perteneciente a un curso (distinto de `IndividualClass`, que es
  standalone).
- `moduleModel` / `moduleClassModel` / `moduleClassCompletionModel` — estructura de módulos dentro de
  un curso y tracking de progreso/completado por clase.
- `virtualClassModel` / `inPersonClassModel` — clases en vivo virtuales o presenciales (agendadas, no
  video on-demand).
- `individualClassUserModel` — relación usuario↔clase individual (probablemente progreso/vistas).
- `lessonModel` — lección (posible sub-unidad de una clase o curso — verificar relación exacta con
  `courseClassModel`).
- `progressModel` — progreso general del usuario (curso/clase).
- `examModel` / `certificateModel` — evaluación y certificado emitido al completar un curso.

### Membresías, planes y pagos
- `planModel` — plan de membresía (con integración Stripe/MercadoPago, ver `productModel` /
  `freeProductModel` para productos puntuales vs. planes recurrentes).
- `productModel` / `productFiltersModel` / `freeProductModel` — productos vendibles (cursos sueltos,
  contenido gratuito).
- `billModel` — factura/registro de cobro.
- `enrollmentModel` — inscripción de un usuario a un curso/producto.
- `promocionModel` — promoción/descuento aplicable a un plan o producto.

### Mentoría
- `mentorshipPlanModel` — plan de mentoría (ver ejemplo real en `scripts/createMentorshipPlans.js`:
  niveles Explorer/Practitioner con precio, intervalo, features, `stripePriceId`).
- `mentorshipRequestModel` — solicitud de mentoría de un usuario.

### Seguimiento y hábito (bitácora / weekly path)
- `weeklyLogbookModel` — bitácora semanal del usuario (ver rutas `src/app/api/bitacora/**` y
  `src/app/bitacora`, `src/app/ruta-semanal`/`weekly-path`).
- `coherenceTrackingModel` — tracking de coherencia/consistencia del usuario (ver
  `src/app/api/coherence/tracking` y `scripts/manageCoherencePoints.js`).
- `scheduledZoomReminderModel` — recordatorios programados de sesiones por Zoom.

### Programas transformacionales y eventos
- `programaTransformacionalUserModel` — participación de un usuario en un programa transformacional
  (ver `src/app/api/events/*-transformational-program`).
- `moveCrewEventModel` — evento de la comunidad "Move Crew" (ver `src/app/api/move-crew-events`).

### Contenido y marketing
- `faqModel` — preguntas frecuentes.
- `reviewModel` — reseñas de usuarios.
- `questionModel` — preguntas de usuarios sobre contenido (con `createAnswer` — ver
  `src/app/api/question`).
- `linkInBioConfigModel` — configuración de la página "link in bio" (ver `src/app/api/link-in-bio`).
- `newsletterUser` — suscriptor de newsletter.
- `brandVoiceModel` — configuración de tono/voz de marca, probablemente usada por los servicios de IA
  (`src/services/ai`) para generar contenido/copy.
- `classFiltersModel` — filtros disponibles para búsqueda de clases.

---

## Relaciones verificadas

```
User
  ├── tiene 0..1 Subscription (membresía activa — subscription.active, isVip)
  ├── genera Bill al pagar
  └── se Enroll-ea en Course/Product

IndividualClass
  ├── pertenece a 1 ClassModule (filtro principal)
  ├── tiene N tags/links/atachedFiles
  └── visibleInLibrary controla si aparece en biblioteca vs. solo weekly path
```

Las relaciones de `Course`/`Module`/`Lesson`/`Progress`/`Certificate` entre sí **no están verificadas
en detalle** — antes de construir una feature que dependa de esa jerarquía, leer los modelos reales.

---

## Notas de dominio importantes

- **Dos vías de acceso a contenido:** compra puntual (Stripe/MercadoPago one-time) o suscripción
  recurrente (membresía) — ver `src/app/api/payments/{oneTimePayment,createSubscription}` y
  `.claude/backend-architecture.md`.
- **La mentoría es un producto separado de la membresía de cursos** — tiene su propio flujo de
  checkout (`src/app/api/mentorship/**`) y sus propios planes (`mentorshipPlanModel`, no `planModel`).
- **El campo `id` numérico manual** en varios modelos (ver `IndividualClass`) convive con `_id` de
  Mongo — no asumir que `id` es único de forma segura bajo concurrencia (landmine documentado en
  `AGENTS-backend.md`).
