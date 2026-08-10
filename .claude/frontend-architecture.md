# Frontend Architecture — MMove Course Platform

> Patrones de código del frontend. Para reglas, ver
> [`Agents.MDs/AGENTS-frontend.md`](Agents.MDs/AGENTS-frontend.md). Este archivo es conocimiento, no
> reglas.

---

## App Router — grupos de rutas reales

```
src/app/
├── (curso)/          # grupo de layout compartido para el área de curso
├── (membership)/      # grupo de layout compartido para membresía
├── (user)/            # grupo de layout compartido para área de usuario
├── admin/              # panel de administración — separado del sitio público
├── api/                # route handlers
├── dev/                # utilidades de desarrollo — no exponer como feature de producción
└── ... rutas públicas, varias con par en inglés/español (ver más abajo)
```

## Rutas duplicadas en inglés/español — inventario a confirmar

Pares detectados en `src/app` (confirmar cuál está activa antes de tocar cualquiera — ver
`AGENTS-frontend.md`):

| Español | Inglés |
|---------|--------|
| `clases` | `classes` |
| `eventos` | `events` |
| `productos` | `products` |
| `privacidad` | `privacy` |
| `biblioteca` | `library` |
| `contacto` | `contact` |
| `categoria-clases` | `classes-category` |
| `horario-clases` | `classes-schedule` |
| `elegir-plan` / `select-plan` | (par detectado, confirmar cuál es la activa) |
| `inicio` | `home` |
| `preguntas-frecuentes` | `faq` |
| `ruta-semanal` | `weekly-path` |
| `nosotros` | `about` |
| `terminos` | (ver si hay `terms` en uso) |

Esta tabla es un inventario de **candidatos**, no una afirmación de cuál versión está enlazada — eso
se verifica caso a caso (grep de `href`/`Link`) antes de editar.

## Estado — tres mecanismos coexistiendo

- **Redux Toolkit** (`src/redux/features`, `src/redux/services`) — estado global "clásico" (ej. carrito,
  sesión de usuario a nivel app).
- **Valtio** (`src/valtio`) — estado reactivo más local/liviano.
- **Context API** (`src/contexts`) — contexto puntual por feature.

No hay una regla de "cuándo usar cuál" documentada más allá de "seguir lo que ya usa el área" — si se
identifica un criterio claro con el desarrollador, documentarlo acá.

## UI — MUI + Tailwind

Ambos conviven. `src/components/ui` tiene componentes genéricos reutilizables; `src/components/
snippets` fragmentos puntuales. Antes de crear un componente nuevo, revisar ambas carpetas.

## Regla de inputs visibles — aplicación práctica

Ver `CLAUDE.md` regla 2. Se aplica tanto a HTML nativo como a componentes MUI que puedan heredar tema
oscuro. Ejemplo de aplicación correcta:

```jsx
<input
  className="w-full rounded border p-2 text-gray-900 bg-white placeholder:text-gray-500"
  placeholder="Nombre"
/>
```

Para MUI `TextField`, el equivalente es asegurar que el color del texto/fondo no herede un tema oscuro
— vía `sx` o clases de Tailwind combinadas, verificando visualmente si es necesario.

## Cloudinary / imágenes

`next-cloudinary`, `cloudinary-react` para manejo de imágenes; `imageLoader.ts` en la raíz configura el
loader de imágenes de Next.js. Scripts de mantenimiento en `scripts/optimizeImages.js` y
`scripts/analyzeImages.js`.

---

## Changelog

| Fecha | Cambio | Disparador |
|-------|--------|------------|
| 2026-07-30 | Creación inicial — inventario de rutas en/es a partir de `ls src/app`, mecanismos de estado documentados | Migración de contexto desde Cursor / adaptación del framework `.claude/` de uContact |
