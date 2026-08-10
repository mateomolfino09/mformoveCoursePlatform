#!/bin/sh
# PreToolUse hook (matcher: Bash) — bloquea commits peligrosos antes de que se ejecuten.
# Adaptado de un framework de otro proyecto: acá NO hay convención de rama-por-issue ni
# co-authored-by prohibido por settings — este hook se limita a lo genuinamente riesgoso:
# secretos commiteados y commits directos a ramas protegidas.
#
# Lee el comando propuesto desde stdin (JSON con { tool_input: { command: "..." } }) si está
# disponible; si no, no bloquea (fail-open) — este hook es una red de seguridad adicional, no la
# única línea de defensa.

INPUT=$(cat 2>/dev/null || true)
CMD=$(printf '%s' "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1)

case "$CMD" in
  *"git commit"*)
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
    case "$CURRENT_BRANCH" in
      main|master)
        echo "BLOQUEADO: no se permite 'git commit' directo en la rama '$CURRENT_BRANCH'. Creá una rama de feature primero." >&2
        exit 1
        ;;
    esac

    # Secretos / .env en staging
    STAGED=$(git diff --cached --name-only 2>/dev/null)
    echo "$STAGED" | grep -qE '(^|/)\.env($|\.[a-zA-Z]+$)' && [ "$(echo "$STAGED" | grep -E '(^|/)\.env($|\.[a-zA-Z]+$)')" != "" ] && {
      # Permitir .env.example explícitamente
      REAL_ENV=$(echo "$STAGED" | grep -E '(^|/)\.env($|\.[a-zA-Z]+$)' | grep -v '\.env\.example$')
      if [ -n "$REAL_ENV" ]; then
        echo "BLOQUEADO: hay un archivo .env en el commit ($REAL_ENV). Nunca commitear valores reales de .env (ver CLAUDE.md regla 1)." >&2
        exit 1
      fi
    }
    ;;
esac

exit 0
