#!/bin/bash

# Script de limpieza de caché de Next.js
# Útil cuando hay errores 404 de chunks o problemas de compilación

echo "🧹 Limpiando caché de Next.js..."

# Limpiar carpeta .next
if [ -d ".next" ]; then
  echo "  ✓ Eliminando carpeta .next..."
  rm -rf .next
  echo "  ✓ Carpeta .next eliminada"
else
  echo "  ℹ Carpeta .next no existe"
fi

# Limpiar caché de node_modules si existe
if [ -d "node_modules/.cache" ]; then
  echo "  ✓ Eliminando caché de node_modules..."
  rm -rf node_modules/.cache
  echo "  ✓ Caché de node_modules eliminada"
fi

# Limpiar caché de npm
echo "  ✓ Limpiando caché de npm..."
npm cache clean --force

echo ""
echo "✅ Limpieza completada!"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Reinicia el servidor de desarrollo: npm run dev"
echo "   2. Si el problema persiste, reinicia el servidor con:"
echo "      - Ctrl+C para detener el servidor"
echo "      - npm run dev para iniciar de nuevo"
echo ""

