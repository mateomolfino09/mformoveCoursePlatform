# Cuerpo Autónomo vs. MadaMove /formacion — comparativa de landing

> Documento de trabajo para decidir qué tocar en la landing de curso (`src/components/PageComponent/Course/*`)
> para acercarla al modelo de venta por llamada de `madamove.org/formacion`.
>
> Fecha del relevamiento: 2026-09-09. La landing de Mada se leyó en vivo; la propia se relevó
> sobre el código de `Course.tsx` y el `cursoConfig` real del producto en producción.

---

## 0. La diferencia de fondo (leer esto antes que la tabla)

No son dos versiones de la misma página: son **dos modelos de venta distintos**.

| | **MadaMove /formacion** | **Cuerpo Autónomo (hoy)** |
|---|---|---|
| Objetivo de la página | Conseguir una **aplicación/llamada** | Conseguir un **pago con tarjeta** |
| Precio en la página | **No aparece nunca** | $49/mes y $147/4 meses, visibles |
| CTA principal | "Aplicar a la Formación" (×3, todos al mismo ancla) | "Quiero un cuerpo libre" → scroll a precios |
| Cómo se cierra | Humano, en la llamada | Checkout de Stripe, self-serve |
| Formato | Cohorte de 16 semanas, con fecha | Suscripción abierta, entrás cuando querés |
| Rol de la llamada | **Es el único camino** | Sección secundaria, enterrada después del precio |

**Consecuencia práctica:** "parecerse a Mada" no es un cambio de maquetado, es mover el eje de la
página de *pagar* a *agendar*. Todo lo demás de este documento sale de esa decisión.

⚠️ **Tensión a resolver antes de implementar:** un funnel con closer (Theo) tiene sentido a partir de
cierto ticket. A $49/mes, el costo por llamada se come el margen rápido. Mada puede permitírselo
porque no publica precio y su formación es de ticket alto. Ver "Decisiones abiertas" (§5).

---

## 1. Estructura comparada, sección por sección

### MadaMove (10 secciones)

| # | Sección | Función | CTA |
|---|---------|---------|-----|
| 1 | Hero | Propuesta de valor + descarte | **Aplicar a la Formación** → `#agenda` |
| 2 | El Fundador | Autoridad (10+ años, 1000+ alumnos, 10+ países) | — |
| 3 | La Metodología | 3 fases numeradas (01/02/03) + 4 pilares ("Nuestros Cimientos") | **Aplicar** |
| 4 | El Equipo | Manu, kinesiólogo (respaldo clínico) | — |
| 5 | La Experiencia | 3 pilares de tranquilidad (Claridad Radical / Comunidad de Pares / En Carne y Hueso) | — |
| 6 | ¿Qué necesitamos de vos? | 3 objeciones frontales: *¿tendré tiempo? ¿materiales? ¿nivel?* | — |
| 7 | El Proceso | Roadmap 16 semanas en 4 bloques | — |
| 8 | El Resultado | Outcomes segmentados por nivel (principiante / intermedio) + 3 fotos | **Aplicar** |
| 9 | Cita de cierre del fundador | Sello de confianza, refuerza la MISMA oferta | — |
| 10 | Footer | Mínimo | — |

### Cuerpo Autónomo (14 bloques, `Course.tsx:136-183`)

| # | Componente | Función | CTA |
|---|-----------|---------|-----|
| 1 | `CourseHero` | Video Vimeo + tagline | `hero.ctaTexto` → **scroll a precios** |
| 2 | `CourseBetweenHeroSection` | Narrativa | — |
| 3 | `CourseFullWidthBanner` | Banda de refuerzo | — |
| 4 | `CourseTestimonials` (video) | Prueba social | — |
| 5 | `CourseHighlightsIntro` | Intro del método | — |
| 6 | `CourseOutcomesHighlights` | 8 outcomes | — |
| 7 | `CourseTestimonials` (escritos) | Prueba social | — |
| 8 | `CourseHighlights` | Timeline del método (4 etapas) | — |
| 9 | `CourseWhatWeTeach` | Disciplinas | — |
| 10 | `CoursePlans` | **Precios + checkout** + `CourseIncludesBlock` | Suscribirme (Stripe) |
| 11 | `CourseScheduleCall` | Llamada 20 min con Nico (cal.com) | Agendar una llamada |
| 12 | `CourseFAQ` | 12 preguntas | — |
| 13 | `CourseCTA` | ⚠️ **Cross-sell a la mentoría** | Ver mentoría |
| 14 | Footer + `PromocionFooter` | — | Scroll a precios |

---

## 2. Qué tiene Mada que a Cuerpo Autónomo le falta

| # | Elemento | Por qué importa | Dónde iría |
|---|----------|-----------------|-----------|
| **A** | **CTA de agendar en el hero** | Es literalmente el pedido. Hoy el hero manda a precios; en Mada el primer clic ya es la llamada. | `CourseHero.tsx:273-279` |
| **B** | **CTA repetido a mitad de página** | Mada repite "Aplicar" 3 veces (hero / metodología / resultado). Cuerpo Autónomo tiene **un solo** punto de conversión real (precios) y la llamada aparece una vez, tarde. | Tras `CourseHighlights` y tras `CourseOutcomesHighlights` |
| **C** | **Sección de objeciones tipo "¿qué necesitamos de vos?"** | Mada la pone *antes* del cierre y en tono de "te saco el miedo", no de FAQ legal. El FAQ actual (12 items) mezcla objeciones reales con letra chica (reembolsos, medios de pago). | Nuevo bloque antes de `CourseFAQ`, o partir el FAQ en dos |
| **D** | **Bio del fundador con números** | "10+ años, 1000+ alumnos, 10+ países" hace el trabajo pesado de autoridad. Cuerpo Autónomo no tiene bio de Mateo en la landing. | Nueva sección tras el hero |
| **E** | **Equipo con respaldo clínico** | Mada muestra a Manu (kinesiólogo) — legitima lo terapéutico. Acá hay equipo (Nico y "profesionales invitados" se mencionan en beneficios) pero **no se muestra**. | Nueva sección, o expandir `CourseScheduleCall` |
| **F** | **Roadmap con temporalidad** | "Semanas 1-4 / 5-8 / 9-12 / 13-16" da forma y final. `CourseHighlights` tiene las 4 etapas pero **sin tiempo** — se lee como filosofía, no como plan. | `CourseHighlights` (agregar campo de duración por etapa) |
| **G** | **Outcomes segmentados por nivel** | Mada dice qué logra un principiante vs. un intermedio. Los 8 outcomes actuales son universales y por eso más vagos. | `CourseOutcomesHighlights` / `cursoConfig.outcomes` |
| **H** | **Cierre que refuerza la misma oferta** | Mada cierra con cita del fundador. Cuerpo Autónomo cierra mandando a **otro producto** (mentoría) — fuga de funnel en el último scroll. | `CourseCTA.tsx` |

---

## 3. Qué tiene Cuerpo Autónomo que Mada no (y conviene NO perder)

- **Video de presentación en el hero** — Mada solo tiene foto. Es una ventaja, mantenerlo.
- **Testimonios reales de alumnos** (video + escritos) — Mada solo tiene una cita del propio fundador. Ventaja clara.
- **`cursoConfig` editable desde el admin** — casi todo el copy es data, no código. Mada es una página estática. Cualquier cambio de acá debería seguir viviendo en `cursoConfig`, no hardcodearse.
- **FAQ profundo (12 items)** — más completo que las 3 objeciones de Mada.
- **Bloque "Qué incluye" con acordeón** (`CourseIncludesBlock`) — recién agregado, bien resuelto.

---

## 4. Puntos a tocar, priorizados

### P0 — El pedido concreto

1. **Agendar llamada desde el hero** (`CourseHero.tsx:273-279`).
   Hoy: un botón → `scrollToPlans()`. Propuesta: dos botones — primario **"Agendar una llamada"** (al Calendly) y secundario "Ver planes" (scroll actual), o un solo botón a la llamada si se va all-in al modelo Mada (ver §5).
   El link **no debería hardcodearse**: agregar `hero.ctaLlamadaUrl` + `hero.ctaLlamadaTexto` a `cursoConfig` (`src/types/cursoLanding.ts`, `src/models/productModel.js`, `CursoLandingConfigForm.tsx`, y los handlers `createProduct`/`updateProduct` — ⚠️ este repo **no acepta body arbitrario**, cada campo nuevo se agrega a mano en ambos).

2. **Unificar a qué Calendly apuntan las llamadas.**
   Hoy `CURSO_SALES_CALL_BOOKING_URL` = `https://cal.com/yoguinico-move/mmove` (Nico, 20 min, cal.com).
   El link nuevo del closer es `https://calendly.com/murialmatheo/30min` (Theo, 30 min, Calendly).
   **Son dos personas, dos plataformas y dos duraciones distintas.** Hay que decidir si Theo reemplaza a Nico, o si conviven (ej. Nico = consulta blanda, Theo = llamada de cierre). Si Theo reemplaza: actualizar también `CURSO_SALES_CALL_HOST` (nombre, bio, foto) — hoy dice Nico.

### P1 — Estructura tipo Mada

3. **Subir `CourseScheduleCall` antes de `CoursePlans`** (`Course.tsx:162-165`) — hoy la llamada aparece después del precio; en un funnel de llamada va antes.
4. **Cerrar con la propia oferta, no con la mentoría** (`CourseCTA.tsx`) — reemplazar el cross-sell por un cierre que repita el CTA de llamada. La mentoría puede quedar como link chico en el footer.
5. **CTA intermedio repetido** — un bloque de "agendar" tras el timeline del método y otro tras outcomes.

### P2 — Contenido que falta

6. Sección **fundador con números** (Mateo: años, alumnos, países).
7. Sección **equipo** (Nico + profesionales invitados + respaldo clínico si lo hay).
8. **Duración por etapa** en `CourseHighlights` (darle forma de proceso con principio y fin).
9. **Outcomes por nivel** en vez de universales.
10. Partir el FAQ: *objeciones* (tiempo / nivel / materiales) arriba y en tono cálido, *letra chica* (reembolsos, medios de pago) abajo.

---

## 5. Decisiones abiertas (necesito tu respuesta)

1. **¿Se saca el precio de la landing?** Es lo que hace Mada y es la mitad de por qué su página funciona así. Pero Cuerpo Autónomo hoy vende self-serve a $49/mes con checkout directo — sacarlo mata la compra por impulso. Opciones: (a) precio visible + llamada como alternativa, (b) precio oculto y todo por llamada, (c) precio visible solo en el plan mensual y llamada para el de 4 meses. SI, ELIMINA LOS PRECIOS PERO CONSERVA EL BLQOUE DE PLANES QUE ME GUSTA POR LAS DUDAS
2. **¿Theo reemplaza a Nico en la llamada, o conviven?** (ver punto 2 arriba). SI
3. **¿El CTA del hero es solo llamada, o llamada + planes?** Mada es 100% llamada. Dos botones diluyen pero no rompen la compra directa. SOLO LLAMADA
4. **¿Se mantiene la suscripción abierta o se pasa a cohortes?** El "16 semanas con fecha" de Mada genera urgencia real; la suscripción abierta no. Es cambio de producto, no de landing — solo lo listo porque es de dónde sale buena parte de la fuerza de la página de Mada. SI. HACE UNA URGENCIA SIMILAR

---

## 6. Bugs encontrados de paso (no son parte del pedido, pero conviene saberlos)

| # | Qué | Dónde | Impacto |
|---|-----|-------|---------|
| 1 | `auth.user?.subscription?.active` — el campo `user.subscription` **se eliminó** del modelo en la migración a suscripción por curso. Siempre es `undefined`. | `CourseHero.tsx:59` y `Course.tsx:174` | El hero **nunca** manda al suscriptor a `/biblioteca`, lo manda a ver precios aunque ya pague. Y el `PromocionFooter` se le muestra a suscriptores activos. |
| 2 | `CourseMobileBottomBar.tsx` no está importado en ningún lado — código muerto completo. | `src/components/PageComponent/Course/CourseMobileBottomBar.tsx` | No hay barra CTA fija en móvil, pese a que el admin deja editar `navegacion.ctaBarraMovil` y `CursoProductDetails` lo muestra como si existiera. Mada tampoco tiene sticky bar, así que no es urgente — pero el campo del admin miente. |

---

## 7. Resumen en una línea

Mada vende una **conversación**; Cuerpo Autónomo vende un **botón de pago**. El cambio de fondo es
mover la llamada del puesto 11 al puesto 1 y decidir qué pasa con el precio — el resto
(fundador, equipo, roadmap con semanas, objeciones cálidas) es relleno de autoridad que ya tenés
disperso y solo hay que ordenar.

---

## 8. Estado de implementación (2026-09-09)

**Hecho, en código y en datos (dev + producción):**

- Hero: CTA único → agenda la llamada (Calendly de Theo); si el usuario ya tiene acceso al curso,
  va a `/biblioteca` en vez de agendar. Arregla de paso el Bug 1 (§6).
- Llamada de venta: reemplazado Nico/cal.com por **Theo/Calendly, 30 min** en
  `src/constants/cursoSalesCall.ts` — usado por hero, `CourseScheduleCall`, `CourseMobileBottomBar`
  y `CourseCTA`. Sin foto real de Theo: se renderiza un avatar de iniciales en vez de reusar la
  foto de otra persona.
- Orden de secciones: `CourseScheduleCall` ahora va **antes** de `CoursePlans` (Bug 1 no incluye
  esto, es P1 punto 3).
- Nuevo `CourseCallCtaBanner` — refuerzo de CTA a mitad de página (P1 punto 5), entre
  `CourseHighlights` y `CourseWhatWeTeach`.
- `CourseCTA` (cierre) ya no manda a la mentoría como acción principal — repite "Agendar una
  llamada"; la mentoría queda como link secundario.
- Precio oculto en la sección de planes, con el bloque de planes conservado (selector
  Mensual/Oferta, `CourseIncludesBlock`) — nuevo flag `cursoConfig.planes.ventaPorLlamada`
  (default `false`, **no afecta otros cursos**). Activado en Cuerpo Autónomo vía
  `scripts/setCuerpoAutonomoVentaPorLlamada.js`.
- Urgencia tipo cohorte: `cursoConfig.planes.cohorteUrgenciaTexto` (texto libre, opcional) —
  **presentacional únicamente**, no hay backend de cohortes/fechas de cierre reales (eso sigue
  siendo cambio de producto, no de landing, tal como se marcó en §5).
- FAQ reordenado (P2 punto 10): objeciones (nivel, tiempo, consistencia) subieron justo después
  de las 2 preguntas de orientación; medios de pago/cancelación/reembolsos bajaron al final.
  Mismo contenido, sin texto nuevo — `scripts/updateCuerpoAutonomoFaq.js` (v2).
- Bug 2 (§6) resuelto: `CourseMobileBottomBar` tenía un import roto a un contexto que nunca
  existió (`CourseNavContext` → no hay tal archivo; el real es `MembershipNavContext`). Corregido
  y montado en `Course.tsx` (oculto cuando hay `PromocionFooter` activo, como decía el comentario
  original del archivo). Su CTA ahora también agenda la llamada.

**Deliberadamente NO implementado (fabricación de contenido, no falta de tiempo):**

- Sección de fundador con números (D) y sección de equipo (E): requieren datos reales (años de
  experiencia, cantidad de alumnos, países, credenciales del equipo) que no tengo — inventarlos
  sería una afirmación de marketing falsa sobre el negocio.
- Roadmap con semanas (F) y outcomes segmentados por nivel (G): el producto es una suscripción
  abierta, no una cohorte de 16 semanas — fabricar un cronograma semanal falso contradiría cómo
  funciona realmente el curso. Si en algún momento se decide pasar a cohortes reales (decisión 4
  de §5, hoy solo resuelta a nivel de copy de urgencia), ahí sí correspondería este contenido.

**Pendiente de que el usuario decida/entre manualmente:**

- Admin UI: `ventaPorLlamada` y `cohorteUrgenciaTexto` no tienen campo en
  `CursoLandingConfigForm.tsx` todavía — hoy se editan solo por script/DB directa. Si se necesita
  tocarlos desde el dashboard, hay que agregar los inputs (siguiendo el patrón `patchNested`
  existente).
