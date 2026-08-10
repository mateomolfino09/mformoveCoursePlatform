---
name: test-case-generator
description: Use this skill ON DEMAND when the user wants manual QA test cases for a feature, PR, or bug fix — triggers like "casos de prueba para", "generá casos de prueba", "test cases for", "cómo probar esto". Produces MANUAL QA test cases (role-aware: Usuario/Alumno vs. Admin) for this course/membership platform. Does NOT generate automated/unit tests — this repo has no test harness. Do not auto-trigger; invoke only when explicitly asked.
---

# Test Case Generator

## Purpose

Generar **casos de prueba manuales de QA** para una feature, PR, o bug de esta plataforma, listos para
pegar en un issue o usar como guía de verificación manual.

- **Solo manual.** Este repo no tiene test harness (ver `.claude/testing.md`) — nunca genera tests
  automatizados/unitarios ni asume que existe un framework para alojarlos.
- **Consciente del rol** — cada caso se corre como **Usuario/Alumno** o **Admin**.
- **Concreto** — pasos derivados de la feature/issue real, sin inventar labels de UI que no existen.

Esta skill es **solo a pedido**. No se auto-dispara.

---

## Project context files

Antes de generar, leer:

- `CLAUDE.md` (raíz)
- `.claude/domain-concepts.md` — vocabulario de entidades y roles reales del dominio
- `.claude/testing.md` — confirma que no hay harness (el plan es siempre manual)

---

## Inputs

- Un número de PR/issue (si `gh` está disponible y hay GitHub configurado)
- Una descripción en texto libre de la feature/bug

Si no se da ninguno, preguntar.

---

## Reglas

1. **Pasos numerados.**
2. **Sin pasos de login/navegación básica**, salvo que la feature sea justamente sobre eso (ej. login
   con Google, onboarding).
3. **Agrupar lo común** (rol, precondición compartida) en una sección `## Común a todos los casos` en
   vez de repetirlo por caso.
4. **Solo precondiciones no obvias** en "Requerimientos para probar" — no listar "el usuario está
   logueado" si es obvio.
5. **`Configuración previa` solo si hace falta un setup específico de la feature** (ej. activar un
   flag). Si no, omitir la sección.
6. **Sin tests automatizados, nunca.**
7. **Sin UI inventada** — no nombrar botones/labels exactos que no se conocen; describir la acción
   funcionalmente.
8. **Salida en español, markdown, inline** — encabezado fijo `# Casos de prueba`.

---

## Vocabulario del dominio (ver `.claude/domain-concepts.md` para el detalle)

- **Roles:** Usuario/Alumno (consumidor de contenido, comprador), Admin (panel de administración).
- **Flujos típicos a cubrir:** compra de curso (Stripe/MercadoPago), suscripción a membresía, alta de
  mentoría, bitácora semanal (weekly logbook), onboarding, inscripción a evento (move-crew-events),
  acceso a clase individual/grupal/presencial.

---

## Output template

```markdown
# Casos de prueba

## Requerimientos para probar (precondiciones)
- Rol necesario: [Usuario/Alumno / Admin]
- Datos de prueba: [cuenta, curso/plan de prueba, tarjeta de test de Stripe/MercadoPago, etc.]
(No listar precondiciones obvias.)

## Configuración previa
(SOLO si la feature requiere setup específico. Si no, OMITIR.)

## Común a todos los casos
- Rol: [..]

## Casos de prueba
### CP-01 — [título]
1. [acción]
- Resultado esperado: [observable]

### CP-02 — [caso negativo/edge]
1. [acción]
- Resultado esperado: [...]
```

---

## Workflow

1. Leer contexto (`CLAUDE.md`, `domain-concepts.md`, `testing.md`).
2. Resolver el input (PR/issue vía `gh`, o texto libre).
3. Derivar el/los rol(es) involucrados.
4. Separar precondiciones (Requerimientos) de configuración específica.
5. Generar, en orden: Requerimientos → Configuración previa (si aplica) → Común a todos los casos →
   Casos de prueba (camino feliz + negativos/edge relevantes, especialmente para flujos de pago:
   webhook duplicado, pago rechazado, suscripción ya activa).
6. Mostrar inline. No escribir archivo por default.
7. Si el input fue un issue/PR y `gh` está disponible, ofrecer postear los casos como comentario —
   nunca sin confirmación.

---

## Anti-Patterns

No:

- Proponer tests automatizados o implicar que existe un harness.
- Agregar pasos de login/navegación salvo que la feature sea sobre eso.
- Inventar labels de UI no confirmados.
- Repetir rol/precondición en cada caso cuando son idénticos.
- Postear el comentario sin confirmación del usuario.
