---
name: pre-pr-checklist
description: Use this skill when the user wants a quick sanity check before opening a PR or before considering work "done" — triggers like "está listo para PR?", "revisá antes de mergear", "checklist antes de commitear", or invocation via /pre-pr-checklist. This is a lightweight self-review checklist adapted for a repo with no GitHub Projects board, no PR template, and no test harness — do not import process from other projects (story points, Risk fields, project board columns).
---

# Pre-PR Checklist

## Purpose

Chequeo rápido antes de abrir un PR o dar una tarea por terminada. A diferencia de un flujo de
Code Review con GitHub Projects (board, story points, campos de Risk/Priority), este repo no tiene esa
infraestructura — esta skill es deliberadamente liviana: corre chequeos objetivos baratos y da un
resumen, sin mover nada de estado en ningún board.

---

## Alcance (exhaustivo)

Esta skill es de **solo lectura**. No mueve issues, no comenta en el PR, no modifica archivos.

---

## Checks

### 1. Build limpio
```bash
npm run build
```
Falla → **bloqueante**, listar el error.

### 2. Lint
```bash
npm run lint
```
Falla → **advertencia** (no bloqueante salvo que sean errores, no solo warnings).

### 3. Sin secretos ni `.env` en el diff
```bash
git diff origin/{base}...HEAD --name-only
```
Si aparece un `.env` o algo que huela a token/clave hardcodeada → **bloqueante**.

### 4. Sin `console.log` de debug
Buscar en el diff. `console.error`/`console.warn` intencionales están bien. `console.log` suelto →
**advertencia**.

### 5. Regla de inputs visibles
Si el diff toca `<input>`/`<textarea>`/`<select>`/`TextField`/`Select`, correr (o recomendar correr)
`frontend-validator` — la regla F1-F4 es no negociable (ver `CLAUDE.md`).

### 6. Webhooks/pagos tocados
Si el diff toca `src/app/api/webhooks/**` o `src/app/api/payments/**` → recordar correr
`architecture-validator` y verificar manualmente el flujo (no hay test harness).

### 7. Rutas en/es
Si el diff toca una ruta con par conocido (`classes`/`clases`, etc.) sin evidencia de haber verificado
cuál es la activa → **advertencia**, señalando `AGENTS-frontend.md`.

### 8. Descripción del cambio
Preguntar (si no está claro por la conversación) qué cambia y por qué, para usarlo como base del PR
con `create-pr`.

---

## Reporte

```md
## Pre-PR Checklist

| # | Check | Resultado |
|---|-------|-----------|
| 1 | Build | ✅ / ❌ (detalle) |
| 2 | Lint | ✅ / ⚠️ (detalle) |
| 3 | Sin secretos/.env | ✅ / ❌ |
| 4 | Sin console.log de debug | ✅ / ⚠️ |
| 5 | Regla de inputs visibles | ✅ / ⚠️ / N/A |
| 6 | Webhooks/pagos | ✅ / ⚠️ / N/A |
| 7 | Rutas en/es | ✅ / ⚠️ / N/A |

**Veredicto:** Listo para PR / Hay bloqueantes / Hay advertencias — a criterio del desarrollador
```

No preguntar nada por diálogo interactivo — el reporte es texto plano en el chat.

---

## Anti-Patterns

No:

- Mover ningún estado de un board de GitHub Projects — no existe en este repo.
- Exigir story points, campo de Risk, o labels de canal — eso es de otro proyecto.
- Bloquear por falta de tests unitarios — no hay harness (ver `.claude/testing.md`).
- Postear comentarios en el PR — esta skill es de solo lectura/reporte en chat.
