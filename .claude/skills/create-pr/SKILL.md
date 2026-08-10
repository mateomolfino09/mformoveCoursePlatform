---
name: create-pr
description: Use this skill when the user wants to create a Pull Request — including triggers like "creá un PR", "abrí un PR", "subí PR", "crear pull request", or invocation via the /create-pr slash command. Runs pre-flight validations and calls `gh pr create` with a clear, honest PR body. This repo has no `.github/pull_request_template.md`, so the body is built from a lightweight generic structure rather than a project template.
---

# create-pr — Creación de Pull Request

## Purpose

Guiar la creación de un Pull Request con validaciones básicas antes de llamar a `gh pr create`. Este
repo **no tiene** `.github/pull_request_template.md` — a diferencia de proyectos con un template
formal, el body se arma con una estructura genérica simple. Si el desarrollador quiere adoptar un
template propio más adelante, esta skill debería actualizarse para leerlo (ver `MAINTENANCE.md`).

---

## Pre-flight Validations

### Bloqueantes

1. **No estar en una rama protegida**
   ```bash
   git branch --show-current
   ```
   Falla si la rama actual es `main`, `master`, o `develop`.
   Mensaje: "No se puede crear un PR desde la rama `{branch}`. Cambiá a tu rama de feature primero."

2. **Hay commits adelante del remoto**
   ```bash
   git status --porcelain=v2 --branch
   ```
   Si `ahead` es 0, avisar que no hay nada para mergear.

3. **La rama tiene tracking remoto**
   ```bash
   git ls-remote --heads origin $(git branch --show-current)
   ```
   Si no se pusheó todavía, pushear (`git push -u origin HEAD`) después de confirmar con el usuario.

4. **`gh` CLI disponible y autenticado**
   ```bash
   gh auth status
   ```
   Si `gh` no está instalado o autenticado, informar al usuario e indicarle que puede crear el PR
   manualmente desde GitHub con la URL que da `git push` — la skill no puede continuar sin `gh`.

### Advertencias (preguntar antes de continuar)

5. **Base branch** — preguntar contra qué rama va el PR si no es obvio (`main` vs `develop` — el repo
   tiene ambas como ramas remotas activas; no asumir).

6. **Artefactos de debug en el diff**
   ```bash
   git diff origin/{base}...HEAD -- . ':(exclude)*.md'
   ```
   Buscar `console.log`, archivos `.env` commiteados. Avisar si aparecen.

7. **Coautoría de Claude en los commits**
   ```bash
   git log origin/{base}..HEAD --format="%H %s"
   ```
   Si algún commit tiene `Co-Authored-By: Claude`, avisar — no reescribir el historial automáticamente
   salvo que el usuario lo pida (a diferencia de un repo con convención estricta de branch-por-issue,
   acá no hay ese proceso formal, así que reescribir historial sin pedirlo es más riesgoso que útil).

---

## Recolección de información

Preguntar en un solo mensaje agrupado:

| Campo | Requerido | Notas |
|-------|-----------|-------|
| **Título del PR** | Sí | Breve, descriptivo. Este repo no tiene convención de idioma documentada — seguir el idioma que use el desarrollador. |
| **Descripción de la solución** | Sí | Qué se cambió y por qué (no repetir el problema si ya está en un issue/conversación). |
| **Issue relacionado** | No | Si existe, se linkea en el body con `Closes #N` o similar. |

---

## PR Body

Sin template propio, usar esta estructura mínima:

```md
## Qué cambia

{descripción de la solución}

## Cómo probarlo

{pasos de verificación manual — este repo no tiene test harness, ver .claude/testing.md}

## Notas

{cualquier consideración: retrocompatibilidad, impacto en pagos/webhooks, rutas en/es tocadas, etc. — omitir si no aplica}
```

No inventar secciones de un template que no existe (Risk/Priority/Changelog/story points — eso es de
otro proyecto, no de este repo).

---

## Preview y ejecución

Mostrar el body completo y el comando exacto antes de correrlo:

```bash
gh pr create \
  --title "{título}" \
  --body "$(cat <<'EOF'
{body}
EOF
)" \
  --base {base}
```

El body nunca debe mencionar a Claude como coautor. Después de crear, mostrar la URL del PR.

---

## Anti-Patterns

No:

- Inventar campos de un template (`pull_request_template.md`) que no existe en este repo.
- Reescribir el historial de commits sin que el usuario lo pida explícitamente.
- Asumir la rama base sin confirmar cuando hay ambigüedad entre `main`/`develop`.
- Crear el PR sin mostrar antes el body completo.
