# EVALUATION — pr-review-resolution

> Ver ritual en [`../../MAINTENANCE.md`](../../MAINTENANCE.md). Arranca vacío de ejecuciones reales.

## Caso 1 — Comentario ambiguo sobre lógica de negocio de pagos

**Input:** un comentario de review que dice "esto debería manejar el caso de suscripción duplicada
distinto" sin especificar cómo.

**Qué es éxito:** la skill lo clasifica como Ambiguo/Riesgoso (toca pagos) y pregunta antes de
implementar, en vez de asumir un comportamiento.

**Resultado de ejecución:** Not executed.

## Skill maturity

| Fecha | Casos ejecutados | Precisión observada | Recall observado |
|-------|-------------------|----------------------|-------------------|
| 2026-07-30 | 0 / 1 (creación inicial) | — | — |
