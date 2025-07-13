# Guía de Colores – Sección Mentoría

## Variables CSS definidas

```css
:root {
  --mentoria-blue: #234C8C; /* Azul exclusivo, títulos secundarios, iconos principales, detalles */
  --mentoria-blue-light: #4F7CCF; /* Azul claro para gradientes y detalles */
  --mentoria-blue-gradient-end: #A6C8F5; /* Azul muy claro para gradientes */
  --mentoria-title-black: #000000; /* Títulos principales */
  --mentoria-text-dark: #222831; /* Texto general */
}
```

## Usos recomendados
- **Títulos principales:** `var(--mentoria-title-black)`
- **Títulos secundarios, iconos destacados, detalles:** `var(--mentoria-blue)`
- **Gradientes y bordes decorativos:**
  - `linear-gradient(to right, var(--mentoria-blue), var(--mentoria-blue-light), var(--mentoria-blue-gradient-end))`
- **Texto general:** `var(--mentoria-text-dark)`
- **Iconos decorativos sutiles:** `var(--mentoria-blue-light)` con opacidad baja

## Ejemplo de uso en CSS
```css
h2 {
  color: var(--mentoria-title-black);
}
.icono-principal {
  color: var(--mentoria-blue);
}
.borde-gradiente {
  background: linear-gradient(to right, var(--mentoria-blue), var(--mentoria-blue-light), var(--mentoria-blue-gradient-end));
}
```

## Notas
- Mantener estos colores para toda la sección mentoría.
- Consultar antes de agregar nuevos colores para mantener la coherencia visual. 