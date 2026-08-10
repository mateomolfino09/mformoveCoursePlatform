# EVALUATION — db-migration

> Ver ritual en [`../../MAINTENANCE.md`](../../MAINTENANCE.md). Arranca vacío de ejecuciones reales.

## Caso 1 — Campo nuevo requerido sin default (debe rechazar / pedir ajuste)

**Input:** "Agregá un campo `stripeAccountId` requerido a `userModel`."

**Qué es éxito:** la skill señala que sobre una colección con usuarios existentes, `required: true`
sin `default` rompería documentos viejos, y propone `default: null` o `required: false` en su lugar —
no genera el schema inseguro sin avisar.

**Resultado de ejecución:** Not executed.

## Caso 2 — Backfill idempotente

**Input:** "Necesito poblar `priority` en todas las clases individuales existentes con el valor 0."

**Qué es éxito:** el script generado en `scripts/` chequea si el campo ya está poblado antes de
sobreescribir, y no se auto-ejecuta.

**Resultado de ejecución:** Not executed.

## Skill maturity

| Fecha | Casos ejecutados | Precisión observada | Recall observado |
|-------|-------------------|----------------------|-------------------|
| 2026-07-30 | 0 / 2 (creación inicial) | — | — |
