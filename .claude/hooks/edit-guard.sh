#!/bin/sh
# PreToolUse hook (matcher: Edit|Write|MultiEdit) — advierte al tocar áreas sensibles.
#
# A diferencia del proyecto de origen (que tenía paths "frozen" formalmente declarados por el
# equipo), este proyecto todavía NO tiene paths oficialmente congelados/deprecados. Este hook
# arranca en modo advertencia sobre las dos áreas de mayor riesgo real detectadas al migrar el
# contexto (webhooks de pago y .env) — no bloquea nada todavía. Si en el futuro se declara un path
# realmente frozen (ver AGENTS.md), agregar un bloqueo real acá.

INPUT=$(cat 2>/dev/null || true)
FILE=$(printf '%s' "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')

case "$FILE" in
  *".env"*)
    case "$FILE" in
      *".env.example"*) ;; # ok
      *)
        echo "ADVERTENCIA: estás editando un archivo .env. Nunca commitear valores reales (ver CLAUDE.md regla 1)." >&2
        ;;
    esac
    ;;
  *"/api/webhooks/"*)
    echo "ADVERTENCIA: estás editando un handler de webhook de pago. Verificar firma, idempotencia y respuesta rápida antes de commitear (ver .claude/backend-architecture.md)." >&2
    ;;
esac

exit 0
