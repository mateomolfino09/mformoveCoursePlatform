# Mantenimiento del contexto `.claude/` — MMove Course Platform

> Cómo mantener vivas las skills, los `EVALUATION.md`, los agentes y la documentación después de cada
> implementación, feature o bug. Leer esto cuando un cambio toque reglas, patrones o convenciones del
> proyecto.
>
> Principio rector: **solo se documenta lo que NO se infiere leyendo el código.** Una regla vive en
> **un** lugar canónico; el resto linkea. No duplicar.
>
> ¿Términos nuevos? → [`CONCEPTS.md`](CONCEPTS.md)

---

## Contexto importante: este `.claude/` arrancó sin historial

A diferencia de un framework que acumuló meses de casos reales, esta carpeta se creó de una sola vez
(2026-07-30) a partir de una exploración puntual del código — adaptando la *estructura* de un
framework de otro proyecto (uContact) al stack real de este (Next.js/MongoDB/Stripe/MercadoPago). Eso
significa:

- Varias entidades en `domain-concepts.md` están marcadas *(inferido, a verificar)* — falta
  confirmarlas contra el código real a medida que se trabaja en esas áreas.
- Los `EVALUATION.md` de las skills están vacíos de ejecuciones reales — se pueblan la primera vez que
  cada skill corre de verdad.
- Las reglas en `AGENTS-*.md` reflejan lo observado en 2-3 archivos representativos, no una auditoría
  completa del repo — tratarlas como punto de partida, corregir cuando se descubra que no generalizan.

---

## Modelo mental: dos loops

**Loop A — Documentación** (se dispara cuando cambia *el proyecto*).
Después de cada cambio: ¿esto reveló una regla, landmine o convención no obvia que no está en
`.claude/`? Si sí, actualizar el archivo correspondiente.

**Loop B — Skills + EVALUATION** (se dispara cuando cambia *una regla* o *una skill falla*).
Una skill nunca se edita sola: toda edición a un `SKILL.md` arrastra una edición a su `EVALUATION.md`.

Los validators (`architecture-validator`, `frontend-validator`) se auto-disparan tras cambios
relevantes (ver hook `context-maintenance-reminder.sh`).

---

## Qué hacer según el caso

| Disparador | Loop A — docs | Loop B — skills + EVALUATION |
|---|---|---|
| **Feature nueva** | ¿Patrón/entidad/landmine no obvio? → `AGENTS-*.md` / `domain-concepts.md` / `backend-architecture.md` / `frontend-architecture.md` | Si la regla es chequeable estáticamente → regla en el validator correspondiente + caso en `EVALUATION.md` |
| **Bug encontrado y arreglado** | ¿Nació de un patrón defectuoso repetible? → documentarlo como landmine | ¿El validator debería haberlo atrapado? Falso negativo → ajustar la regla + caso de regresión |
| **Falso positivo** (el validator marcó código correcto) | — | Agregar el patrón a Anti-Patterns del `SKILL.md` + caso "no debe marcar esto" |
| **Se confirma o corrige una entidad de `domain-concepts.md`** | Actualizar la entrada, quitar el marcador *(inferido, a verificar)* | — |
| **Cambió una dependencia** | Fuente de verdad = `package.json`, no hay tabla central | Revisar Anti-Patterns de skills que dependían de la versión vieja |
| **Cambio de esquema de Mongo / endpoint nuevo** | ¿Convención no obvia? → `AGENTS-backend.md` | Ver skill `db-migration` / `endpoint-generator` |

---

## El ritual del `EVALUATION.md`

Al tocar una regla de una skill, en su `EVALUATION.md`:

1. Agregar un caso: *Input → Qué es éxito → Resultado de ejecución → Ajustes*.
2. Ejecutarlo de verdad contra código real del repo (no dejarlo en "Not executed" para siempre).
   Establecer el ground truth a mano antes de mirar el output.
3. Clasificar: detecta violación real (recall) / no inventa errores en código limpio (precisión) /
   suprime un patrón intencional documentado (anti-pattern).
4. Fechar la corrida y actualizar la tabla de skill maturity.
5. Antes de dar por buena la edición al `SKILL.md`, releer los casos existentes y confirmar que siguen
   pasando.

---

## Reglas de oro

- Editar una regla de un `SKILL.md` ⇒ tocar su `EVALUATION.md` en el mismo cambio.
- Una regla entra solo si existe (o se puede crear) un caso de `EVALUATION` que falla sin ella y pasa
  con ella.
- No documentar lo que se infiere del código. Solo reglas no obvias, landmines, excepciones.
- No duplicar: una regla, un lugar canónico; el resto linkea.
- No agregar reglas "por las dudas".
- Si no hay nada que actualizar, declararlo en una línea.

> Nota: **no hay test harness en el repo** (ver [`testing.md`](testing.md)). El equivalente a "el test
> que prueba el cambio" es: build limpio + validación manual + las skills validators.

---

## Dónde vive cada capa del sistema de mantenimiento

| Capa | Dónde | Audiencia | Cuándo dispara |
|---|---|---|---|
| Recordatorio determinístico | Hook `hooks/context-maintenance-reminder.sh` (`settings.json`, PostToolUse) | Harness → agente | Al editar backend o frontend |
| Self-check automático | `SKILL.md` de los validators | Agente | Auto-trigger en cada cambio relevante |
| Directiva siempre-on | `CLAUDE.md` § Non-Negotiable Constraints | Agente | Toda sesión |
| Retrospectiva de proceso | Skill `session-retro` (`/retro`) + reportes en `.claude/retro/` | Agente + Humano | Manual, al cierre de sesión |
| Esta guía | `.claude/MAINTENANCE.md` | Humano | Referencia detallada |
