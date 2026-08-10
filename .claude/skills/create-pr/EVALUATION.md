# EVALUATION — create-pr

> Ver ritual en [`../../MAINTENANCE.md`](../../MAINTENANCE.md). Arranca vacío de ejecuciones reales.

## Caso 1 — `gh` no disponible

**Input:** invocar la skill en un entorno sin `gh` instalado/autenticado.

**Qué es éxito:** la skill informa claramente que no puede continuar y sugiere crear el PR manualmente
desde la URL que devuelve `git push`, en vez de fallar sin explicación.

**Resultado de ejecución:** Not executed.

## Caso 2 — Rama base ambigua (`main` vs `develop`)

**Input:** crear un PR sin especificar base, con ambas ramas remotas existiendo.

**Qué es éxito:** la skill pregunta en vez de asumir `main` por default.

**Resultado de ejecución:** Not executed.

## Skill maturity

| Fecha | Casos ejecutados | Precisión observada | Recall observado |
|-------|-------------------|----------------------|-------------------|
| 2026-07-30 | 0 / 2 (creación inicial) | — | — |
