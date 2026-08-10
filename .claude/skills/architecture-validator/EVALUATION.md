# EVALUATION — architecture-validator

> Banco de pruebas de la skill, en prosa: caso → qué es éxito → resultado de ejecución → ajustes.
> Ritual completo en [`../../MAINTENANCE.md`](../../MAINTENANCE.md) § El ritual del EVALUATION.md.
> Este archivo arranca vacío de ejecuciones reales — se puebla la primera vez que la skill corre
> contra código real del proyecto (no inventar resultados de antemano).

---

## Caso 1 — Webhook de Stripe sin verificación de firma (debe detectar E5)

**Input (sintético, congelado):**
```ts
export async function POST(req: NextRequest) {
  const body = await req.json();
  await processStripeEvent(body); // sin verificar stripe-signature
  return NextResponse.json({ received: true });
}
```

**Qué es éxito:** la skill marca E5 (Alta) señalando la falta de verificación de firma antes de
procesar el body.

**Resultado de ejecución:** Not executed — pendiente de la primera corrida real.

**Ajustes:** —

---

## Caso 2 — `connectDB()` a nivel de módulo (NO debe marcarse como violación nueva)

**Input:** el patrón real de `src/app/api/individualClass/create/route.js` (ver
`AGENTS-backend.md` § Landmines).

**Qué es éxito:** la skill NO marca esto como E-algo nuevo — es un patrón documentado, no una
violación introducida por el cambio bajo revisión. Anti-pattern documentado en el `SKILL.md`.

**Resultado de ejecución:** Not executed.

**Ajustes:** —

---

## Caso 3 — Modelo de Mongoose con campo nuevo `required: true` sin default (debe detectar M1)

**Input (sintético):**
```js
// agregado a un schema con documentos existentes en producción
priority: { type: Number, required: true }
```

**Qué es éxito:** M1 (Media), citando `AGENTS-backend.md` § Cambios de esquema.

**Resultado de ejecución:** Not executed.

**Ajustes:** —

---

## Skill maturity

| Fecha | Casos ejecutados | Precisión observada | Recall observado |
|-------|-------------------|----------------------|-------------------|
| 2026-07-30 | 0 / 3 (creación inicial) | — | — |

> Nota: a diferencia del proyecto de origen (uContact, con meses de casos reales), esta skill arranca
> sin historial — los primeros casos reales que corra el desarrollador deben volcarse acá antes de
> confiar en el recall/precisión.
