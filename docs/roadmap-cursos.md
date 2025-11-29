## Roadmap Plataforma de Cursos

### Contexto y Propósito
- Integrar la venta y entrega de cursos de acceso vitalicio dentro de la plataforma `mformoveCoursePlatform` basada en Next.js.
- El documento sirve como tablero vivo para organizar avances; iremos marcando hitos y ajustando prioridades conforme progresemos.

### Estado Actual (Noviembre 2025)
- **Stack**: Next.js (App Router), React, TypeScript mixto con JavaScript, Tailwind CSS, Redux Toolkit (`src/redux`), MongoDB vía Mongoose (`src/models`), autenticación propia (`useAuth`, cookies), integración Stripe para pagos de eventos (`src/app/api/payments`), Cloudinary para medios.
- **Entidad `Product`** (`src/models/productModel.js`): centraliza bundles, eventos, recursos. **Nota: aunque el modelo soporta `tipo: 'curso'`, no hay cursos creados actualmente.** Campos clave: VOD en Vimeo (`vimeoGallery` desde formularios), `modules` y `classes` legacy, descuentos, precios múltiples para eventos.
- **Gestión de Cursos**:
  - Formularios admin extensos (`CreateProductStep1.tsx`, `EditProductStep1.tsx`) con soporte a galería Vimeo, imágenes, descuentos, precios escalonados, programas transformacionales.
  - API de creación/edición (`src/app/api/product/createProduct`, `updateProduct`, `addProductModules`); los módulos se guardan como arrays libres sin esquema formalizado.
  - Distribución de contenido por clases individuales (`classModel`, `individualClassModel`) y examenes (`examModel`); flujo actual orientado a workouts/eventos, no a progresión estructurada tipo curso.
- **Entrega de Contenido**: páginas de administración y de usuario para membresías, mentorías y productos individuales; no hay player dedicado ni seguimiento de progreso cumplido.
- **Multimedia**: Videos alojados en Vimeo (showcases) y Cloudinary para imágenes/archivos; scripts de optimización en `scripts/`.
- **Pagos**: Stripe enfocado en eventos (multiple price tiers, promotion codes); productos tipo curso usan precio único sin checkout específico.
- **Observaciones Técnicas**:
  - Coexisten componentes muy largos (>1800 líneas) y lógica mezclada UI/datos; conviene modularizar.
  - Falta tipado consistente (mezcla TS/JS), tests automatizados y documentación formal.

### Riesgos / Oportunidades
- **Modelado**: `Product` está sobrecargado; urge extraer subdocumentos o colecciones dedicadas para cursos (`Course`, `Module`, `Lesson`, `Enrollment`, `Progress`).
- **Escalabilidad**: ausencia de colas/batch jobs para emails, transcodificación o notificaciones; evaluar Redis + BullMQ.
- **Player y DRM**: dependencia fuerte de Vimeo; considerar Mux/Cloudflare Stream si buscamos control granular, subtítulos y métricas.
- **Experiencia de Usuario**: falta de biblioteca de cursos comprados, panel de progreso y certificados.
- **Observabilidad**: inexistencia de monitoreo centralizado; proponer Sentry/Logtail y product analytics.

### Roadmap Fases
1. **Fase 0 – Descubrimiento y Setup (Semana 1)**
   - Auditoría de rutas `src/app/api` y formularios admin.
   - Inventario de dependencias reales (Stripe, Vimeo, Cloudinary, Auth).
   - Definición de KPIs iniciales (ventas por curso, retención, finalización).
   - Decisión sobre herramientas auxiliares (Prisma vs seguir con Mongoose, Redis, Mux).

   **Backlog Fase 0**
   - [x] Mapear endpoints críticos vinculados a `Product` (`create`, `update`, `addProductModules`, `view`, `getProducts`).
   - [x] Documentar cómo se autentica y autoriza hoy (hooks, middleware, roles almacenados en `userModel`).
   - [x] Inventariar colecciones y esquemas Mongoose relevantes (`Product`, `Class`, `IndividualClass`, `Exam`, `Plan`, `Mentorship`).
   - [x] Registrar integraciones externas y credenciales necesarias (Stripe keys, Vimeo showcases, Cloudinary presets, email provider).
     - Pendiente: consolidar owners/bóveda de secretos antes de movernos a Fase 1.
   - [x] Levantar flujo actual de creación de curso desde la UI (`CreateProductStep1`) y puntos de dolor.
   - [N/A] Extraer datos de cursos existentes (productos con `tipo: 'curso'`) y evaluar consistencia de campos (`modules`, `classes`, `paymentLinks`). **Nota: No hay cursos creados en `Product`; podemos empezar desde cero con el nuevo modelo.**
   - [x] Establecer KPIs base y requerimientos de reporting (ventas por curso, alumnos activos, completitud).
   - [x] Decidir herramientas adicionales para escalabilidad (Redis/BullMQ, Prisma, Mux/Cloudflare Stream) y formar recomendación.
   - [x] Generar resumen ejecutivo con hallazgos y recomendaciones para validar en reunión de planificación.

   **Mapa de endpoints `Product` (avance)**
   - `POST /api/product/createProduct`: creación de productos multiformato (curso, bundle, evento, recurso). Maneja uploads (Cloudinary), validación de rol admin, integración Stripe para eventos con múltiples precios y cupones, persistencia en `Product`.
   - `PUT /api/product/updateProduct`: edición de productos existentes. Soporta multipart, actualiza imágenes/archivos, sincroniza precios y cupones en Stripe (eventos), controla permisos admin y normaliza datos según `tipo`.
   - `PUT /api/product/addProductModules`: acopla módulos y clases a un producto existente (uso legacy). Actualiza campos `modules`, `classes` y opcionalmente `descuento`.
   - `GET /api/product/viewProduct/[productId]`: obtiene un producto por ID desde MongoDB, sin controles de acceso adicionales ni proyección; devuelve documento completo.
   - `GET /api/product/getProducts`: lista todos los productos sin filtros; deshabilita caché (`fetchCache: 'force-no-store'`, `revalidateTag('products')`).

   **Autenticación y Autorización (avance)**
   - **Login** (`POST /api/user/auth/login`): valida credenciales con bcrypt, firma JWT con `NEXTAUTH_SECRET` (30 días) y lo guarda en `user.token`. La respuesta expone `token`; el frontend lo almacena en cookie (`userToken`).
   - **Inicio de sesión en frontend** (`useAuth.signIn`): guarda cookie `userToken`, consulta perfil y setea contexto `AuthContext`.
   - **Perfil** (`GET /api/user/auth/profile`): toma `userToken` de cookies (requiere que la request incluya cookie), verifica JWT y devuelve documento `User` sin password.
   - **Roles**: definidos en `userModel` (`rol` string, default `'User'`). Los endpoints críticos (`createProduct`, `updateProduct`) validan que `user.rol === 'Admin'`. No hay lógica diferenciada para instructores todavía.
   - **Middleware** (`src/middleware.ts`): protege rutas `/account`, `/admin`, `/products`, `/payment`; verifica cookie `userToken` usando `jose.jwtVerify`. Redirige a `/login` si falta o es inválido.
   - **Persistencia de sesión**: cookies gestionadas en el cliente con `js-cookie` (caducidad 5 días en `useAuth`). JWT almacena `userId`.
   - **Recursos desprotegidos**: la mayoría de rutas API no verifican encabezado `Authorization`; dependen de llamadas desde el frontend autenticado (cookie). No existe helper centralizado para roles a excepción de checks manuales.

   **Inventario de esquemas Mongoose (avance)**
   - **`Product`** (`productModel.js`): documento monolítico que abarca bundles, eventos, programas transformacionales y recursos descargables. Aunque el esquema soporta `tipo: 'curso'`, **no hay cursos creados actualmente**. Campos potenciales para cursos incluirían galerías Vimeo, imágenes, `modules`, `classes` legacy, descuentos, `paymentLinks`, y estructuras anidadas complejas para programas transformacionales (semanas, sesiones, comunidad).
   - **`Class`** (`classModel.js`): clases genéricas referenciadas por productos y programas; almacena metadata básica (nombre, `class_code`, `image_url`, métricas simples) y arrays de archivos/enlaces. Orientado a workouts individuales.
   - **`IndividualClass`** (`individualClassModel.js`): clases con video embebido y atributos detallados (duración total, nivel, tipo, tags, recursos, HTML embed). Sirve como unidad de contenido reproducible con `link` y `html`.
   - **`Exam`** (`examModel.js`): evaluaciones con preguntas múltiples y respuestas; campos `quantityOfQuestions`, `approvalMin`, arrays de `questions` con opciones y `correctAnswerIndex`. Útil para quizzes dentro de cursos.
   - **`Plan`** (`planModel.js`): planes de suscripción (dLocal) con frecuencia, montos, URLs de callbacks, tokens. Relación con membresías recurrentes existentes.
   - **`MentorshipPlan`** (`mentorshipPlanModel.js`): planes de mentoría (CommonJS) con niveles (`explorer`, `practitioner`, `student`), precios asociados a Stripe y campos legacy (`price`, `dlocalPriceId`). Indica coexistencia de modelos híbridos y necesidad de estandarizar exportaciones.
   - Observación: los esquemas no contemplan aún roles de instructor ni enrolamientos formales. Como no hay cursos existentes, podemos diseñar el nuevo modelo (`Course`, `Module`, `Lesson`, `Enrollment`, `Progress`) desde cero sin preocuparnos por compatibilidad con datos legacy.

   **Integraciones y credenciales (en progreso)**
   - Stripe: claves secretas en `stripeConfig`, creación de productos/precios (`payments/stripe`). Se usan promotion codes, payment links y webhooks para eventos; falta un flujo dedicado para cursos.
   - Cloudinary: uploads directos desde API (`upload_preset`), carpetas (`productos/imagenes`, `productos/recursos`, `productos/pdfPresentacion`). Variables `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, presets y auth se utilizan en múltiples rutas.
   - Vimeo: showcase IDs consultados vía `/api/vimeo` y `/api/product/getVimeoShowCase`; requiere `VIMEO_ACCESS_TOKEN`.
   - Mailchimp Transactional: envío de emails (`helpers/sendEmail.ts`) con `MAILCHIMP_TRANSACTIONAL_API_KEY`. Hay flujos legacy con Mailchimp Marketing (`apikey` en rutas de registro/newsletter).
   - dLocal: planes/membresías (`payments/dlocalConfig.ts`, `planModel`) con `DLOCAL_API_KEY`, `DLOCAL_SECRET_KEY`.
   - Otros: scripts e integraciones con Instagram/Meta (`src/services/instagram`), reCAPTCHA (providers en hooks), almacenamiento local (S3 no presente aún).
   - Pendiente: consolidar lista definitiva de credenciales, su uso y responsables para garantizar disponibilidad antes de avances de Fase 1.

   **Flujo UI de creación de cursos (`CreateProductStep1.tsx`)**
   - Componente cliente con ~1800 líneas que centraliza el formulario para todos los tipos de `Product`. Maneja múltiples estados (nombre, descripción, precio, moneda, galería Vimeo, imágenes, descuentos, horarios).
   - Para `tipo === 'curso'`: exige `vimeoGallery` válido (fetch a `/api/vimeo`), selección de imágenes de portada y galería, carga de diploma opcional, validaciones mínimas de nombre ≥5 caracteres y descripción ≥20.
   - Genera arrays de precios escalonados solo si es evento/programa; para cursos utiliza `price` único y `paymentLink` manual (legacy).
   - Formulario incluye secciones de programas transformacionales (semanas, sesiones en vivo, comunidad) que complican la UX cuando solo se requiere un curso simple.
   - Al enviar (`handleSubmitLocal`): construye objetos para descuento, ubicaciones, semanas/sesiones y llama a prop `handleSubmit` con lista extensa de parámetros; no hay tipado fuerte ni separación por tipo de producto.
   - Usa `react-dropzone` y manejos propios de `File` arrays; no se suben archivos desde el frontend (se envían al backend para Cloudinary).
   - Puntos de dolor: tamaño y complejidad del componente, duplicación de lógicas según `tipo`, validaciones dispersas, ausencia de steps específicos para cursos y falta de vista previa del temario. Necesario refactorizar en Fase 1/2 para mejorar mantenibilidad y experiencia.

   **KPIs y reporting propuesto**
   - Conversión por curso: visitas → checkout → compra (Stripe).
   - Ventas unitarias: revenue total, descuentos aplicados, tasa de devolución.
   - Activación y retención: alumnos activos últimos 30 y 90 días, porcentaje de lecciones completadas, tiempo medio hasta completar.
   - Engagement de contenido: visualizaciones por lección, uso de descargas, participación en Q&A/comentarios.
   - Satisfacción: rating/NPS post-curso, tickets de soporte asociados.
   - Funnel de upsells: compras adicionales tras finalizar un curso, conversión a bundles o mentorías.

   **Recomendaciones tecnológicas**
   - **Persistencia**: mantener Mongo/Mongoose corto plazo; diseñar nuevas colecciones (`Course`, `Module`, `Lesson`, `Enrollment`, `Progress`, `Certificate`). Evaluar Prisma en fase posterior si buscamos tipado y migraciones controladas (requiere refactor amplio).
   - **Colas y tareas**: incorporar Redis + BullMQ para emails, notificaciones, drip content y procesamiento pesado.
   - **Video**: considerar Mux o Cloudflare Stream para streaming adaptativo, métricas y protección; Vimeo se mantiene como plan B.
   - **Autenticación**: reforzar JWT actual con refresh tokens y permisos por rol, o evaluar NextAuth/Auth0 para multi-rol (admin, instructor, alumno).
   - **Búsqueda**: indexar cursos con Algolia o Meilisearch para filtros avanzados y autocompletado.
   - **Observabilidad**: integrar Sentry/Datadog para errores, Logtail/ELK para logs y una herramienta BI (Metabase/Looker Studio) para dashboards KPI.

   **Guía de tecnologías recomendadas (explicación simple)**
   
   **1. Redis + BullMQ (Colas de tareas) - OPCIONAL**
   - **¿Qué es?** Redis es una base de datos en memoria súper rápida. BullMQ es un sistema de colas que usa Redis para gestionar trabajos en segundo plano.
   - **¿Para qué sirve?** 
     - Enviar emails sin bloquear la aplicación (confirmación de compra, recordatorios, notificaciones).
     - Procesar videos pesados sin que el usuario espere (transcodificación, generación de thumbnails).
     - Programar tareas automáticas (desbloquear lecciones según fecha, enviar contenido drip).
     - Evitar que la app se cuelgue cuando hay muchas operaciones pesadas.
   - **Ejemplo práctico**: Un usuario compra un curso → en lugar de esperar a que se envíe el email de bienvenida, la app responde rápido y el email se envía en segundo plano.
   - **Costo**: 
     - **GRATIS**: Redis local (si hosteas en tu servidor) o Upstash Free tier (10k comandos/día)
     - **Alternativa sin costo**: Usar MongoDB como cola simple (menos eficiente pero gratis) o enviar emails de forma asíncrona con `setTimeout`/`setImmediate` (suficiente para volúmenes bajos)
   - **Recomendación**: Solo implementar si envías >100 emails/día o procesas muchos videos. Para empezar, puedes enviar emails de forma asíncrona sin Redis.

   **2. Mux o Cloudflare Stream (Plataforma de video) - NO PRIORITARIO**
   - **¿Qué es?** Servicios especializados en alojar y reproducir videos online con características avanzadas.
   - **¿Para qué sirve?**
     - Streaming adaptativo (el video se ajusta a la velocidad de internet del usuario).
     - Protección contra descargas no autorizadas (DRM, tokens temporales).
     - Métricas detalladas (cuánto tiempo vio cada alumno, en qué parte se quedó).
     - Subtítulos automáticos y transcripciones.
     - Mejor calidad que Vimeo para casos de uso educativos.
   - **Ejemplo práctico**: Un alumno ve una lección → Mux registra que completó el 80% y se quedó en el minuto 15. La próxima vez, el player puede empezar desde ahí.
   - **Costo**: Mux ~$0.01-0.05 por minuto de video procesado + almacenamiento. Cloudflare Stream similar.
   - **Recomendación**: **MANTENER VIMEO** que ya tienes. Es suficiente para empezar y no tiene costo adicional. Solo considerar Mux/Cloudflare si necesitas métricas muy detalladas o DRM avanzado (probablemente no necesario al inicio).

   **3. NextAuth.js (Autenticación mejorada) - RECOMENDADO (GRATIS)**
   - **¿Qué es?** Sistema open source que maneja login, registro, permisos y seguridad de usuarios de forma profesional.
   - **¿Para qué sirve?**
     - Login con Google/Facebook/Apple sin programar todo desde cero.
     - Gestión de roles (admin, instructor, estudiante) con permisos granulares.
     - Refresh tokens (el usuario no tiene que loguearse cada vez que expira la sesión).
     - Protección automática contra ataques comunes (CSRF, XSS).
     - Multi-factor authentication (2FA) si lo necesitas después.
   - **Ejemplo práctico**: Un instructor quiere editar su curso → NextAuth verifica que tiene rol "instructor" y permite el acceso. Un estudiante intenta acceder → se bloquea automáticamente.
   - **Costo**: **GRATIS** (NextAuth.js es open source). Auth0 tiene plan gratuito pero NextAuth es suficiente y no requiere servicio externo.
   - **Recomendación**: **IMPLEMENTAR PRIMERO**. Mejora significativamente la seguridad y gestión de roles sin costo adicional.

   **4. Meilisearch o MongoDB Text Search (Motor de búsqueda) - OPCIONAL**
   - **¿Qué es?** Servicios que indexan tus cursos y permiten búsquedas instantáneas y super inteligentes.
   - **¿Para qué sirve?**
     - Búsqueda rápida de cursos por título, descripción, instructor, categoría.
     - Autocompletado mientras el usuario escribe (como Google).
     - Filtros avanzados (precio, duración, nivel, rating) sin afectar performance.
     - Búsqueda con errores tipográficos (si escriben "yoga" como "yoga", igual encuentra resultados).
     - Resultados ordenados por relevancia.
   - **Ejemplo práctico**: Un usuario escribe "meditación" en el buscador → antes de terminar, ya aparecen sugerencias. Al buscar, encuentra cursos de meditación, mindfulness y relajación en milisegundos.
   - **Costo**: 
     - **GRATIS**: MongoDB Text Search (ya lo tienes, suficiente para empezar con <1000 cursos)
     - **GRATIS**: Meilisearch self-hosted (open source)
     - **~$25/mes**: Meilisearch Cloud si prefieres no hostearlo
     - **~$40/mes**: Algolia (solo si Meilisearch no es suficiente)
   - **Recomendación**: **Empezar con MongoDB Text Search** (gratis, ya lo tienes). Solo agregar Meilisearch si tienes >1000 cursos o necesitas búsqueda muy avanzada.

   **5. Sentry (Monitoreo de errores) - RECOMENDADO (GRATIS)**
   - **¿Qué es?** Herramienta que detecta, registra y te alerta cuando algo falla en tu aplicación.
   - **¿Para qué sirve?**
     - Saber inmediatamente cuando un usuario tiene un error (antes de que te lo reporte).
     - Ver el contexto completo del error (qué usuario, qué acción, qué navegador).
     - Detectar patrones (si 50 usuarios tienen el mismo error, es un bug crítico).
     - Alertas por email/Slack cuando algo importante falla.
     - Historial de errores para debugging.
   - **Ejemplo práctico**: Un usuario intenta comprar un curso y falla el pago → Sentry te envía un email con el error exacto, el ID del usuario y los pasos que hizo. Tú lo arreglas antes de que más usuarios lo experimenten.
   - **Costo**: **GRATIS hasta 5k eventos/mes** (suficiente para empezar). Luego ~$26/mes solo si superas ese límite.
   - **Recomendación**: **IMPLEMENTAR PRIMERO**. Es crítico para detectar bugs y el plan gratuito es generoso para empezar.

   **6. MongoDB para logs (Gestión de logs) - ALTERNATIVA GRATIS**
   - **¿Qué es?** Usar tu base de datos MongoDB existente para guardar logs estructurados.
   - **¿Para qué sirve?**
     - Ver todos los logs en un solo lugar (colección `logs` en MongoDB).
     - Buscar logs por usuario, fecha, tipo de acción con queries simples.
     - Alertas básicas (puedes crear un script que revise logs cada X tiempo).
     - Análisis de comportamiento (qué rutas se usan más, qué endpoints son lentos).
   - **Ejemplo práctico**: Quieres saber cuántos usuarios compraron cursos ayer → haces una query en MongoDB: `db.logs.find({action: "compra_exitosa", fecha: "2025-11-09"})`
   - **Costo**: **GRATIS** (usa MongoDB que ya tienes)
   - **Alternativas**: Logtail (gratis hasta 1GB/mes, luego ~$20/mes) o ELK Stack (open source pero más complejo de mantener)
   - **Recomendación**: **Empezar con MongoDB para logs** (gratis, simple). Solo considerar Logtail si necesitas búsqueda muy avanzada o >1GB de logs/mes.

   **7. Looker Studio (Dashboards y BI) - RECOMENDADO (GRATIS)**
   - **¿Qué es?** Herramienta de Google que crea gráficos y reportes visuales de tus datos de negocio.
   - **¿Para qué sirve?**
     - Ver métricas clave en tiempo real (ventas hoy, cursos más vendidos, alumnos activos).
     - Gráficos automáticos (ventas por mes, tasa de completitud de cursos, revenue por instructor).
     - Reportes personalizados sin escribir código SQL.
     - Compartir dashboards con tu equipo o inversores.
   - **Ejemplo práctico**: Abres Looker Studio y ves un dashboard con: "Este mes vendiste 50 cursos por $5,000. El curso más popular es 'Yoga para Principiantes' con 20 ventas. 80% de los alumnos completaron al menos el 50% del curso."
   - **Costo**: **GRATIS** (Looker Studio es completamente gratis de Google)
   - **Alternativa**: Metabase self-hosted (gratis pero requiere servidor) o Metabase Cloud (~$85/mes)
   - **Recomendación**: **Usar Looker Studio** (gratis, fácil de conectar con MongoDB, suficiente para dashboards básicos). Solo considerar Metabase si necesitas funcionalidades muy avanzadas.

   **Plan de implementación con presupuesto bajo (priorizado por costo)**
   
   **✅ FASE 1 - 100% GRATIS (implementar primero - costo $0/mes)**
   1. **NextAuth.js** (GRATIS) - Mejorar autenticación y roles sin costo adicional
   2. **Sentry** (GRATIS hasta 5k eventos/mes) - Monitoreo de errores críticos
   3. **Looker Studio** (GRATIS) - Dashboards básicos de Google conectado a MongoDB
   4. **Vimeo** (ya lo tienes) - Mantener para videos, es suficiente para empezar
   5. **MongoDB Text Search** (GRATIS) - Búsqueda de cursos usando índices de MongoDB
   6. **MongoDB para logs** (GRATIS) - Guardar logs estructurados en colección dedicada
   7. **Mailchimp Transactional** (ya lo tienes) - Emails asíncronos sin colas adicionales
   
   **⏸️ FASE 2 - Solo si es necesario (evaluar después de Fase 1)**
   - **Redis + BullMQ**: Solo si envías >100 emails/día o procesas muchos videos
     - Opción gratis: Redis local o Upstash Free tier
     - Alternativa: Emails asíncronos con `setTimeout` (suficiente para volúmenes bajos)
   - **Meilisearch**: Solo si MongoDB Text Search no es suficiente (>1000 cursos)
     - Opción gratis: Meilisearch self-hosted
     - Opción paga: Meilisearch Cloud ~$25/mes
   
   **🚫 FASE 3 - NO implementar a menos que el negocio escale significativamente**
   - **Mux/Cloudflare Stream**: Solo si Vimeo no cumple necesidades específicas (DRM avanzado, métricas muy detalladas)
   - **Algolia**: Solo si Meilisearch no es suficiente (~$40/mes)
   - **Metabase Cloud**: Solo si Looker Studio no cubre necesidades avanzadas (~$85/mes)
   - **Logtail**: Solo si MongoDB logs no son suficientes y necesitas >1GB/mes (~$20/mes)
   
   **💰 Resumen de costos estimados**
   - **Fase 1**: $0/mes (todo gratis)
   - **Fase 2 (si es necesario)**: $0-25/mes (solo si implementas Meilisearch Cloud)
   - **Fase 3 (solo si escala)**: $40-150/mes (solo si realmente lo necesitas)
   
   **🎯 Recomendación final**: Empezar con Fase 1 (100% gratis). Solo agregar herramientas de Fase 2 cuando el volumen de usuarios/operaciones lo justifique. Evitar Fase 3 a menos que sea absolutamente necesario.

   **Resumen ejecutivo Fase 0**
   - `Product` concentra múltiples dominios; se requiere separar cursos en un modelo especializado con enrolamientos y progreso. **Ventaja: no hay cursos existentes, podemos diseñar el modelo desde cero sin migración de datos.**
   - UI y APIs mezclan flujos de curso/evento/programa, provocando deuda técnica y mala UX; urge modularizar formularios y endpoints.
   - Autenticación sirve para admin vs usuario, pero falta gobierno de roles (instructor/estudiante) y verificación sistemática en APIs.
   - Integraciones críticas (Stripe, Cloudinary, Vimeo, Mailchimp, dLocal) están vigentes; falta gestión centralizada de credenciales y seguimiento de estado.
   - No existe reporting de KPIs ni monitoreo operativo; debemos instrumentar métricas, dashboards y monitorización de errores.

   **Mejoras prioritarias sugeridas**
   1. Diseñar esquema `Course` modular desde cero (sin migración de datos legacy).
   2. Refactorizar creación/edición de cursos en steps claros con validaciones específicas y tipado fuerte.
   3. Implementar enrolamientos y seguimiento de progreso con player dedicado y gating por lección.
   4. Centralizar control de roles/permisos en middleware reutilizable y proteger APIs sensibles.
   5. Configurar pipeline de comunicaciones (emails, notificaciones) sobre colas con plantillas versionadas.
   6. Adoptar observabilidad y dashboards para los KPIs definidos.

2. **Fase 1 – Fundaciones Técnicas (Semanas 2–3)**
   - [x] Diseñar modelo dedicado desde cero: `Course`, `Module`, `Lesson`, `Enrollment`, `Progress`, `Certificate`, `Review`.
   - [x] Crear esquemas Mongoose con índices, métodos y hooks (archivos creados en `src/models/`).
   - [x] Crear seeders iniciales para testing (datos de ejemplo) - `scripts/seedCourses.js`.
   - [ ] Servicios de almacenamiento multimedia asegurado (firmas S3/Cloudinary, política de expiración).
   - [ ] Roles y permisos: `admin`, `instructor`, `estudiante` con middleware central.
   - [ ] Integrar NextAuth.js para mejorar autenticación (Fase 1 - gratis).
   - [ ] Integrar Sentry para monitoreo de errores (Fase 1 - gratis).

   **Modelos creados (Fase 1 - Completado)**
   - **`Course`** (`courseModel.js`): Curso principal con información completa (precio, instructor, categoría, métricas, SEO). Incluye métodos para actualizar métricas automáticamente.
   - **`Module`** (`moduleModel.js`): Módulos dentro de un curso con orden y configuración de desbloqueo secuencial.
   - **`Lesson`** (`lessonModel.js`): Lecciones individuales con soporte para video, texto, quiz, descargas y enlaces. Incluye tracking de duración.
   - **`Enrollment`** (`enrollmentModel.js`): Inscripciones de usuarios a cursos con información de pago, acceso y progreso general. Método para actualizar porcentaje de completitud.
   - **`Progress`** (`progressModel.js`): Progreso detallado por lección (tiempo visto, completitud, quiz). Métodos para actualizar progreso de video y marcar como completado.
   - **`Certificate`** (`certificateModel.js`): Certificados de finalización con generación automática de números y códigos de verificación únicos.
   - **`Review`** (`reviewModel.js`): Reseñas y ratings de cursos con moderación y hooks para actualizar métricas del curso automáticamente.
   
   **Características implementadas:**
   - Índices optimizados para búsquedas y queries frecuentes
   - Métodos de instancia para actualizar métricas relacionadas
   - Hooks pre/post para mantener consistencia de datos
   - Validaciones y constraints de integridad
   - Soporte para text search en MongoDB (índices de texto)
   - Virtuals para cálculos derivados (descuentos, duraciones formateadas)

   **Seeder creado (`scripts/seedCourses.js`) - ✅ FUNCIONANDO**
   - Crea usuarios de prueba (instructor, estudiante, admin) con contraseña `demo1234`
   - Genera un curso completo con 3 módulos y 8 lecciones (113 minutos de contenido)
   - Crea inscripción y progreso de ejemplo (13% completado)
   - Incluye reseña de 5 estrellas y actualiza métricas automáticamente
   - Comandos disponibles:
     - `npm run seed:courses` - Ejecuta el seeder (mantiene datos existentes)
     - `npm run seed:courses:fresh` - Limpia datos previos y crea nuevos
   - **Estado**: Probado y funcionando correctamente. Crea datos completos en MongoDB.

3. **Fase 2 – MVP Estudiante (Semanas 4–6)**
   - Catálogo público filtrable con datos de cursos.
   - Ficha de curso con temario, instructor, testimonios.
   - Checkout Stripe para cursos (pago único, webhooks → `Enrollment`).
   - Área alumno: biblioteca, player, progreso, descargas, bloqueo por lección.
   - Emails transaccionales básicos (compra, desbloqueo, recordatorios).

4. **Fase 3 – Panel Instructor y Administración (Semanas 7–9)**
   - Builder modular para cursos (drag & drop módulos/lecciones, uploads).
   - Gestión de alumnos inscritos, métricas de engagement.
   - Panel admin para aprobar cursos, moderar reseñas, controlar descuentos.

5. **Fase 4 – Monetización Extendida y Engagement (Semanas 10–12)**
   - Ratings, reseñas públicas, Q&A por lección.
   - Cupones y bundles centrados en cursos.
   - Programa de afiliados y referidos.
   - Certificados automáticos y automatización de emails según progreso.

6. **Fase 5 – Escalabilidad y Growth (Continuo)**
   - Optimización performance (ISR, caché Redis, edge).
   - Internacionalización y localización de contenido.
   - Accesibilidad AA, modo offline parcial, app móvil/React Native.
   - Observabilidad: Sentry, métricas negocio, pruebas de carga.

### Próximos Pasos Inmediatos
- **Fase 0 completada**: no hay cursos existentes, podemos diseñar el modelo desde cero sin migración de datos.
- Formalizar owners y almacenamiento seguro de credenciales (Stripe, Vimeo, Cloudinary, Mailchimp, dLocal).
- Validar KPIs y mejoras prioritarias con stakeholders; ajustar alcance de Fase 1 según feedback.
- Definir arquitectura objetivo de modelo `Course` y comenzar implementación de esquemas Mongoose.

> Actualizado el 9 de noviembre de 2025. Mantener sincronizado con las sesiones de planificación semanales.

