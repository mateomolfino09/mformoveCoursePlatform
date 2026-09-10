# Handoff — Cuerpo Autónomo: funnel de venta por llamada

> Pegar este texto completo como prompt inicial en Cursor (o cualquier sesión nueva). Da todo el
> contexto necesario sin depender de una conversación previa.

## ⚠️ Lo primero que hay que entender: nada de esto está desplegado todavía

Todo lo descrito abajo existe en dos lugares distintos, y **NO están sincronizados**:

1. **Código**: cambiado en el working tree local (`git status` lo muestra como `modified`/
   `untracked`), pero **nunca comiteado ni pusheado**. La rama activa es `cuerpo-autonomo`.
2. **Datos**: ya escritos en MongoDB, tanto en dev como en **producción** (vía scripts en
   `scripts/`, corridos con `--confirm`/`--env=prod --confirm`).

**Consecuencia práctica:** el sitio en vivo (`mateomove.com`) sigue sirviendo el código viejo
desde el último deploy real a `main` (commit `af4fbf2`, "Cuerpo Autónomo: bloque 'Qué incluye'
con acordeón..."). Ese código viejo **no sabe nada** del campo nuevo `ventaPorLlamada` que ya está
en `true` en la base de producción — simplemente lo ignora. Por eso:

- El botón del hero sigue diciendo "Quiero empezar →" y haciendo scroll a precios (comportamiento
  viejo), en vez de "Agendar una llamada" (comportamiento nuevo, ya escrito en
  `CourseHero.tsx` local, sin desplegar).
- La sección de planes en producción sigue mostrando montos reales ($49/$147) con botón
  "Quiero formar parte" → Stripe, porque el `CoursePlans.tsx` desplegado no conoce
  `cursoConfig.planes.ventaPorLlamada`.
- La sección "El Fundador" y las duraciones "Semanas 1-5/6-11/12-16" ya están en la base de
  datos (`cursoConfig.fundador`, `highlights.items[].duracion`) pero **no se ven en el sitio**
  porque el componente `CourseFounder.tsx` que las renderiza tampoco está desplegado.

**Para que se vea en vivo hace falta, en este orden:** `git add` + `git commit` → `git push` de
la rama `cuerpo-autonomo` → mergear el PR automático `cuerpo-autonomo → develop` → mergear el PR
automático `develop → main` (esto último dispara el deploy real de Vercel a producción). Ninguno
de estos 4 pasos se hizo todavía.

---

## Contexto del negocio

Se está migrando la landing de "Cuerpo Autónomo" de un modelo de **checkout directo con precio
visible** a un modelo de **venta por llamada** (inspirado en `madamove.org/formacion`): la landing
ya no muestra el precio, y el objetivo de cada CTA pasa a ser que el visitante agende una
videollamada de 30 min con Theo (el closer) por Calendly, en vez de pagar con tarjeta ahí mismo.

El análisis completo que originó este trabajo está en
`.claude/specs/cuerpo-autonomo-vs-madamove-comparativa.md` — leer ese documento primero para el
"por qué" de cada decisión (tiene una sección 8 "Estado de implementación" que ya resume gran
parte de esto, pero quedó desactualizada en un punto: en esa sesión se declinó explícitamente
inventar la bio del fundador/roadmap por falta de datos reales; en una sesión posterior el usuario
proveyó esos datos —años/estudiantes/países— y sí se implementaron, ver sección "Fundador y
roadmap" más abajo).

## Qué cambió en código (local, sin commitear)

Rama: `cuerpo-autonomo`. Todos estos archivos están en el working tree, ninguno comiteado:

| Archivo | Qué cambia |
|---|---|
| `src/lib/clientCourseAccess.ts` (nuevo) | Helper cliente `userHasCourseAccessBySlug(user, slug)` — reemplaza el chequeo roto `auth.user?.subscription?.active` (campo eliminado hace sesiones, ver `.claude/specs/cuerpo-autonomo-subscription-analysis.md`). Matchea por slug porque el perfil (`/api/user/auth/profile`) popula `cursosAdquiridos.productoId` con `{_id, nombre, cursoConfig.slug}`. |
| `src/constants/cursoSalesCall.ts` | Reemplaza el link de llamada de Nico/cal.com (20 min) por **Theo/Calendly, 30 min** (`https://calendly.com/murialmatheo/30min`). Sin foto real de Theo: `imageSrc` vacío a propósito. |
| `src/components/PageComponent/Course/CourseScheduleCall.tsx` | Usa la nueva duración (`CURSO_SALES_CALL_DURATION_MIN`), y si no hay foto real, renderiza iniciales en vez de reusar la foto de otra persona con el nombre de Theo. |
| `src/components/PageComponent/Course/CourseHero.tsx` | El botón del hero: **si el curso tiene `cursoConfig.planes.ventaPorLlamada === true`** y el visitante no es ya alumno → texto fijo **"Agendar una llamada"**, abre el Calendly en pestaña nueva. Si ya es alumno (`userHasCourseAccessBySlug`) → va a `/biblioteca`. Si `ventaPorLlamada` es `false` (cualquier otro curso futuro) → comportamiento viejo intacto (scroll a planes, texto editable desde el admin). |
| `src/components/PageComponent/Course/CourseHighlights.tsx` | (a) El CTA final del timeline ("Ver planes disponibles") pasa a ser "Agendar una llamada" cuando `ventaPorLlamada`. (b) Cada etapa del timeline puede mostrar una etiqueta de duración (`item.duracion`, ej. "Semanas 1-5") si está cargada. |
| `src/components/PageComponent/Course/CourseFounder.tsx` (nuevo) | Sección de autoridad tipo "El Fundador": eyebrow + título + bio + 3 stats (años/estudiantes/países). Se oculta sola si `cursoConfig.fundador.titulo` está vacío. Montada en `Course.tsx` justo después del hero. |
| `src/components/PageComponent/Course/CourseCallCtaBanner.tsx` (nuevo) | Banda liviana de refuerzo de CTA a mitad de página ("¿Todavía no sabés si es para vos?" → Agendar una llamada). Mostrada siempre (no gateada por `ventaPorLlamada` — revisar si eso es lo que se quiere, ver "Pendiente" abajo). |
| `src/components/PageComponent/Course/CoursePlans.tsx` | Nuevo flag `ventaPorLlamada` (leído de `cursoConfig.planes.ventaPorLlamada`). Cuando es `true`, en la rama de suscripción (`mostrarSuscripcion`): oculta los montos en el `PlanCard` (nuevo prop `hidePrecio`), no renderiza el layout de 3 tarjetas de comparación de precio (`PriceReferenceCard`/`UruguayPaymentsCard`) — solo el `PlanCard` centrado + `CourseIncludesBlock`, muestra `cohorteUrgenciaTexto` si está cargado, y el CTA final es "Agendar una llamada" → Calendly en vez de ir a Stripe. Cuando es `false`: **cero cambios**, mismo comportamiento de siempre (afecta a cualquier otro curso futuro que use este mismo componente). |
| `src/components/PageComponent/Course/CourseCTA.tsx` (cierre de la página) | Ya no manda a la mentoría como acción principal — CTA primario "Agendar una llamada", el link a mentoría queda como opción secundaria/ghost. |
| `src/components/PageComponent/Course/CourseMobileBottomBar.tsx` | **Bug real corregido**: tenía un `import` a `../../MainSidebar/CourseNavContext`, un archivo que **nunca existió** en el repo (`npx tsc --noEmit` lo confirma con `TS2307`). El build no lo detectaba porque `next.config.js` tiene `typescript.ignoreBuildErrors: true`. Corregido para usar el contexto real (`MembershipNavContext`), y su botón ahora agenda la llamada en vez de scrollear a "Empezar Camino". Montado en `Course.tsx` (antes no se montaba en ningún lado — era código muerto completo). |
| `src/components/PageComponent/Course/Course.tsx` | (a) Fix del mismo bug de `subscription.active` en el `PromocionFooter`. (b) Reordena secciones: `CourseScheduleCall` ahora va **antes** de `CoursePlans`. (c) Monta `CourseFounder`, `CourseCallCtaBanner` y `CourseMobileBottomBar` (antes no montado). |
| `src/types/cursoLanding.ts` | Tipos nuevos: `CursoHighlight.duracion?`, `planes.ventaPorLlamada?`, `planes.cohorteUrgenciaTexto?`, bloque completo `fundador: {eyebrow, titulo, bio, imagenPublicId, stats:{anios,estudiantes,paises}}` (con su default en `createDefaultCursoLandingConfig`). |
| `src/models/productModel.js` | Mismos campos que arriba, agregados al schema de Mongoose (`cursoLandingConfigSchema`) — sin esto, escrituras vía Mongoose (`Product.save()`/admin UI) los descartarían silenciosamente por schema `strict`. |
| `scripts/updateCuerpoAutonomoFaq.js` | v2: mismo contenido de FAQ, **reordenado** (objeciones de nivel/tiempo/consistencia subieron cerca del principio, medios de pago/cancelación/reembolsos bajaron al final). Ya corrido en dev y prod (`--confirm`). |
| `scripts/setCuerpoAutonomoVentaPorLlamada.js` (nuevo) | Setea `cursoConfig.planes.ventaPorLlamada=true` y `cohorteUrgenciaTexto`. Ya corrido en dev y prod. |
| `scripts/setCuerpoAutonomoFundadorYRoadmap.js` (nuevo) | Setea `cursoConfig.fundador` (Mateo, +5 años / +100 estudiantes / +5 países, foto `my_uploads/equipo/Sin_titulo_1080_x_1080_px_uylhwc`) y `highlights.items[].duracion` (Semanas 1-5 / 6-11 / 12-16 — el curso real tiene 3 etapas, no 4 como la referencia de Mada). Ya corrido en dev y prod. |

**Nota aparte, no relacionada con esto:** `src/components/WeeklyPathNavigator/WeeklyPathNavigator.tsx`
también aparece modificado en el working tree, pero es de una tarea distinta de una sesión
anterior (cambia el label "Método" → "Escuela de movimiento" para Cuerpo Autónomo en el nav
semanal). No se tocó ni se debe descartar sin confirmar con el usuario — no es parte de este caso.

## Qué cambió en datos (ya aplicado, dev **y** producción)

Todo lo siguiente ya está escrito en MongoDB (`MongoDB_URI` dev y `MONGODB_URI_PRODUCTION`) para
el producto `Cuerpo Autónomo` (`cursoConfig.slug: 'cuerpo-autonomo'`):

- `cursoConfig.planes.ventaPorLlamada: true`
- `cursoConfig.planes.cohorteUrgenciaTexto: "El próximo ciclo de llamadas grupales y clase mensual está por arrancar."`
- `cursoConfig.faq.items`: reordenado (12 ítems, mismo contenido)
- `cursoConfig.fundador`: `{eyebrow: "El fundador", titulo: "Mateo Molfino", bio: "...", imagenPublicId: "my_uploads/equipo/Sin_titulo_1080_x_1080_px_uylhwc", stats: {anios: "+5", estudiantes: "+100", paises: "+5"}}`
- `cursoConfig.highlights.items[].duracion`: `"Semanas 1-5"`, `"Semanas 6-11"`, `"Semanas 12-16"` (en ese orden, para las 3 etapas existentes)

Nada de esto rompe nada mientras el código viejo siga desplegado — son campos nuevos que el
código viejo simplemente no lee.

## Qué falta para que esto se vea en producción

1. Revisar el diff completo (`git diff` sobre los archivos de la tabla de arriba).
2. `git add` de los archivos relevantes (**sin** incluir `WeeklyPathNavigator.tsx` a menos que se
   confirme que ese cambio también se quiere subir — es de otra tarea).
3. Commit + push a la rama `cuerpo-autonomo`.
4. El repo tiene workflows de GitHub Actions que abren PRs automáticos
   (`.github/workflows/branch-to-develop-pr.yml` y `dev-to-main-pr.yml`): al pushear se crea solo
   un PR `cuerpo-autonomo → develop`; mergear ese PR dispara el PR automático `develop → main`;
   mergear **ese** es lo que dispara el deploy real de Vercel a producción (ver
   `.claude/deployment-model.md`).
5. Después del deploy, probar en el sitio real: el botón del hero debe decir "Agendar una llamada"
   y abrir `https://calendly.com/murialmatheo/30min` en una pestaña nueva; la sección de planes no
   debe mostrar montos en dólares; debe aparecer la sección "El Fundador" con las 3 stats debajo
   del hero.

## Pendiente / a criterio de quien retome esto

- **`CourseCallCtaBanner`** (banda de refuerzo a mitad de página) se agregó **sin** gatear por
  `ventaPorLlamada` — hoy se muestra siempre, para cualquier curso. Si en el futuro hay un curso
  con checkout directo (no por llamada), esta banda quedaría fuera de lugar ahí. Evaluar si
  conviene gatearla igual que el resto.
- **Admin UI**: `ventaPorLlamada`, `cohorteUrgenciaTexto`, `fundador.*` y
  `highlights.items[].duracion` no tienen campos en `CursoLandingConfigForm.tsx` — hoy solo se
  editan por script/DB directa. Si se necesita tocarlos desde el dashboard, hay que agregar los
  inputs ahí (patrón `patchNested` ya existente en ese archivo).
- **Foto de Theo**: no hay una cargada. `CourseScheduleCall.tsx` muestra un avatar de iniciales
  ("TH") como fallback. Si se consigue una foto real, subirla a Cloudinary y pegar el Public ID en
  `CURSO_SALES_CALL_HOST.imageSrc` (`src/constants/cursoSalesCall.ts`).
- **Fabricación de contenido evitada a propósito, ahora resuelta parcialmente**: en una sesión
  anterior se había decidido NO inventar una sección de equipo (Nico + profesionales invitados,
  con credenciales) por falta de datos reales — eso **sigue sin implementarse**. Solo se agregó
  la sección de fundador porque el usuario proveyó esos números explícitamente.
