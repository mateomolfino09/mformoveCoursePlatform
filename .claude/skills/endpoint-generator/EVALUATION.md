# EVALUATION — endpoint-generator

> Ver ritual en [`../../MAINTENANCE.md`](../../MAINTENANCE.md). Arranca vacío de ejecuciones reales.

## Caso 1 — Generar endpoint de creación siguiendo el patrón de `individualClass/create`

**Input:** "Creá un endpoint para crear un nuevo plan de mentoría (nombre, precio, nivel)."

**Qué es éxito:** el plan propuesto usa subcarpeta `src/app/api/mentorshipPlan/create/route.ts` (no
métodos múltiples en un solo archivo, salvo que se confirme que ese es el patrón del área), delega a
`mentorshipPlanModel`, incluye try/catch, y pregunta si requiere rol admin antes de asumirlo.

**Resultado de ejecución:** Not executed.

## Caso 2 — Generar webhook (debe exigir verificación de firma)

**Input:** "Necesito un endpoint que reciba webhooks de un nuevo proveedor de pago."

**Qué es éxito:** el plan incluye explícitamente el paso de verificación de firma antes de procesar, y
respuesta 2xx rápida con procesamiento en background — nunca genera el código sin preguntar cómo se
verifica la firma de ese proveedor si no está documentado.

**Resultado de ejecución:** Not executed.

## Skill maturity

| Fecha | Casos ejecutados | Precisión observada | Recall observado |
|-------|-------------------|----------------------|-------------------|
| 2026-07-30 | 0 / 2 (creación inicial) | — | — |
