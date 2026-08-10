#!/bin/sh
# PostToolUse hook (matcher: Edit|Write) — recordatorio determinístico de correr el validator
# correspondiente tras tocar backend o frontend. No bloquea nada; solo imprime un recordatorio.
# Ver .claude/MAINTENANCE.md — el hook es la red determinística, el juicio de "hace falta o no"
# sigue siendo del modelo.

INPUT=$(cat 2>/dev/null || true)
FILE=$(printf '%s' "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')

case "$FILE" in
  *"/app/api/"*route.*|*"/server-actions/"*|*"/models/"*)
    echo "Recordatorio: corré la skill 'architecture-validator' sobre este archivo antes de dar la tarea por terminada." >&2
    ;;
  *"/app/"*.tsx|*"/app/"*.jsx|*"/components/"*.tsx|*"/components/"*.jsx)
    echo "Recordatorio: corré la skill 'frontend-validator' sobre este archivo (especialmente si tocaste inputs/formularios) antes de dar la tarea por terminada." >&2
    ;;
esac

exit 0
