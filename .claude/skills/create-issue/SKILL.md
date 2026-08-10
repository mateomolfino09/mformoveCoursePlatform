---
name: create-issue
description: Use this skill when the user wants to create a GitHub issue — including triggers like "creá un issue", "reportar un bug", "nuevo issue", or invocation via the /create-issue slash command. This repo has no `.github/ISSUE_TEMPLATE/`, so the skill collects a small generic set of fields (type, description, repro steps if a bug) before calling `gh issue create`.
---

# create-issue — Creación de issue

## Purpose

Guiar la creación de un issue de GitHub. Este repo **no tiene** `.github/ISSUE_TEMPLATE/` — la skill
usa una estructura genérica en vez de parsear templates inexistentes.

---

## Pre-flight

1. **`gh` CLI disponible y autenticado**
   ```bash
   gh auth status
   ```
   Si no está disponible, informar y ofrecer redactar el texto del issue igual para que el usuario lo
   pegue manualmente en GitHub.

2. **Chequeo de duplicados** — preguntar: "¿Ya buscaste si existe un issue similar abierto?" antes de
   continuar.

---

## Paso 1 — Tipo de issue

Preguntar (u ofrecer inferir del pedido del usuario): **Bug**, **Feature**, o **Mejora**.

## Paso 2 — Campos

| Campo | Requerido | Notas |
|-------|-----------|-------|
| Título | Sí | Descriptivo, formato libre (sin convención documentada en este repo) |
| Descripción | Sí | Qué pasa / qué se pide |
| Pasos para reproducir | Solo si es Bug | Numerados |
| Comportamiento esperado vs. actual | Solo si es Bug | — |
| Área afectada | No | Ej. "checkout de membresía", "panel admin", "bitácora" — ayuda a ubicar el código relacionado |

## Paso 3 — Imágenes

Si hay screenshots relevantes disponibles en la sesión, ofrecer incluirlas. `gh issue create` no puede
subir archivos locales — si la imagen no está hosteada, avisar al usuario que tendrá que arrastrarla
manualmente al issue en GitHub después de creado (GitHub la hostea automáticamente al soltarla en el
editor web).

## Paso 4 — Preview y confirmación

Mostrar título, body completo, y el comando `gh issue create` exacto. Pedir confirmación antes de
ejecutar.

```bash
gh issue create \
  --title "{título}" \
  --body "$(cat <<'EOF'
{body}
EOF
)"
```

---

## Anti-Patterns

No:

- Inventar campos de un `ISSUE_TEMPLATE` que no existe en este repo.
- Crear el issue sin confirmación explícita.
- Intentar subir imágenes locales vía `gh` (no lo soporta) — avisar la limitación en vez de fingir que
  funcionó.
