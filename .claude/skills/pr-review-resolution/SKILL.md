---
name: pr-review-resolution
description: Use this skill when the user wants to review, address, implement, resolve, or apply Pull Request review comments — including triggers like "resolver comentarios del PR", "aplicar feedback del review", "atender comentarios", "resolver PR <n>", or invocation via /resolve-pr. Applies a context-aware workflow with explicit plan-before-code approval. Only processes unresolved comments.
---

# PR Review Orchestrator

## Purpose

Resolver comentarios de un Pull Request de forma segura: leer contexto antes de codear, separar
hechos de suposiciones, proponer un plan y esperar aprobación, implementar, verificar, y responder cada
comentario individualmente en GitHub.

Este repo no tiene GitHub Projects ni campos de proceso formal (Risk/story points) — a diferencia de
un proyecto con ese tooling, esta skill se limita a los comentarios de código en sí.

---

## Inputs

- Un número de PR o URL.
- Un bloque de comentarios pegado a mano si `gh` no está disponible.

Si no se provee ninguno, preguntar. No adivinar el PR a partir de la rama actual sin confirmar.

---

## Reglas centrales

1. No implementar antes de entender el contexto.
2. No asumir intención del reviewer, reglas de negocio, o comportamiento esperado.
3. Inspeccionar el código afectado y `.claude/Agents.MDs/*.md` antes de proponer cambios.
4. Si algo es ambiguo o riesgoso (ej. toca pagos/webhooks), preguntar antes de implementar.
5. Proponer un plan y esperar aprobación explícita antes de tocar archivos.
6. Cambios acotados a lo que pide el comentario — evitar refactors no relacionados.
7. **No hay test harness en este repo** (ver `.claude/testing.md`) — verificar con `npm run build` +
   validación manual, nunca prometer/agregar tests unitarios que no tienen dónde vivir.
8. Los mensajes de commit describen el cambio concreto, no "atender comentarios de PR".
9. Después de pushear, responder cada comentario resuelto individualmente en GitHub con una
   explicación específica (qué cambió, por qué, en qué commit) — nunca un comentario genérico único.

---

## Workflow

### 1. Identificar comentarios

```bash
gh api graphql -f query='
query {
  repository(owner: "{owner}", name: "{repo}") {
    pullRequest(number: {pr_number}) {
      reviewThreads(first: 100) {
        nodes {
          isResolved
          isOutdated
          comments(first: 20) { nodes { databaseId path line body author { login } } }
        }
      }
    }
  }
}' --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved == false and .isOutdated == false)'

gh pr diff {pr_number}
```

`{owner}`/`{repo}` se obtienen de `git remote -v` (este repo: `mateomolfino09/mformoveCoursePlatform`).

Si `gh` no está disponible, pedir al usuario que pegue los comentarios.

Resumir:

```md
## Comentarios encontrados

| # | Área/Archivo | Resumen | Clasificación |
|---|--------------|---------|----------------|
| 1 | ... | ... | Accionable / Ambiguo / Riesgoso / Ya resuelto |
```

### 2. Armar el paquete de contexto

Inspeccionar archivos afectados, `.claude/Agents.MDs/AGENTS*.md`, y si el cambio toca pagos/webhooks,
`.claude/backend-architecture.md`.

### 3. Separar hechos de suposiciones

```md
## Hechos, suposiciones e incertidumbres

### Confirmado por el código o contexto
- ...
### Suposiciones
- ...
### Preguntas para el usuario
1. ...
```

Si hay una pregunta que afecta la implementación: parar y preguntar.

### 4. Proponer plan (STOP)

```md
## Plan propuesto

### Comentarios a resolver
| # | Comentario | Enfoque de resolución |
### Archivos que van a cambiar
### Riesgos

Confirmá para implementar.
```

### 5. Implementar tras aprobación

Cambios acotados, siguiendo el patrón existente del archivo tocado.

### 6. Verificar

```bash
npm run build
npm run lint
```
Y validación manual del flujo afectado. No inventar corridas de test que no existen en este repo.

### 7. Commit, push, responder comentarios

```bash
git add [archivos]
git commit -m "fix: <descripción concreta del cambio>"
git push
```

Para cada comentario resuelto:

```bash
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments/{comment_id}/replies \
  -f body="Corregido en el commit <hash>. <qué cambió y por qué>."
```

Nunca un comentario genérico único resumiendo todo.

---

## Anti-Patterns

No:

- Implementar antes de leer el contexto.
- Inventar reglas de negocio no documentadas.
- Prometer o agregar tests unitarios — no hay harness (ver `.claude/testing.md`).
- Responder con un solo comentario genérico en vez de uno por hilo.
- Asumir campos de proceso (Risk, story points, project board) que este repo no tiene.
