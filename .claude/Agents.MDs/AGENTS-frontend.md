# Frontend Context — MMove Course Platform

> Reglas específicas del frontend: `src/app/**` (App Router), `src/components/**`, `src/redux/**`,
> `src/valtio/**`, `src/contexts/**`, `src/styles/**`.
> Para reglas cross-stack, ver [`AGENTS.md`](AGENTS.md).
> Para reglas de backend, ver [`AGENTS-backend.md`](AGENTS-backend.md).
>
> Este archivo contiene solo información que no se infiere leyendo el código. No agregar convenciones
> estándar de React/Next.js/Tailwind.

---

## Stack de UI

- **MUI (`@mui/material`, `@mui/x-data-grid`) + Tailwind CSS** conviviendo — no es solo uno de los
  dos. Antes de agregar un componente nuevo, revisar si el área ya usa MUI o Tailwind puro para no
  mezclar de forma inconsistente dentro de la misma pantalla.
- **State:** Redux Toolkit (`src/redux`) para estado global "clásico", **Valtio** (`src/valtio`) para
  estado más local/reactivo, y `src/contexts` para Context API puntual. Los tres coexisten — revisar
  cuál usa el área que estás tocando antes de introducir un cuarto mecanismo.
- **Formularios:** `react-hook-form` está entre las dependencias — usarlo para formularios nuevos no
  triviales en vez de estado manual con `useState` por campo, salvo que el formulario vecino no lo use
  (seguir el patrón local).

## Regla no negociable: inputs con texto visible

Ver `CLAUDE.md` § Non-Negotiable Constraints regla 2. Todo `<input>`, `<textarea>`, `<select>` —
admin o público — lleva:

```jsx
className="... text-gray-900 bg-white placeholder:text-gray-500"
```

(`<select>` no necesita `placeholder:text-gray-500`.) Esto aplica incluso a componentes de MUI
(`TextField`, `Select`, etc.) vía `sx`/`slotProps`/clases equivalentes cuando el componente hereda
color claro de un tema oscuro — el objetivo es que el valor y el placeholder sean legibles sobre fondo
claro, sin importar el mecanismo de estilado usado en ese componente puntual.

## Rutas duplicadas en inglés y español — cómo decidir cuál tocar

Antes de modificar cualquier ruta con par conocido (`classes`/`clases`, `events`/`eventos`,
`products`/`productos`, `privacy`/`privacidad`, `library`/`biblioteca`, `contact`/`contacto`, y
posibles otros — listar con `ls src/app` y comparar):

1. Buscar qué ruta está enlazada desde la navegación principal (`grep -r "href=" src/components` o el
   sidebar/menu activo).
2. Si ambas parecen usarse, preguntar al desarrollador antes de asumir cuál es la canónica — no
   duplicar el cambio "por las dudas" en ambas sin confirmar primero, y no asumir que la versión en
   español es la activa solo porque el resto de la copy del sitio está en español.
3. Si una ruta resulta claramente huérfana (sin enlaces entrantes, sin tráfico esperado), documentarlo
   acá como candidata a limpieza — no borrarla sin que el desarrollador lo pida explícitamente.

**Confirmado (2026-08-09)**: para productos, `/admin/productos` es el árbol canónico (enlazado desde
`AdminDashboardSideBar.tsx`); `/admin/products` existe en disco pero no está enlazado desde ningún
lado — no tocarlo ni asumir que es el activo.

## App Router — convenciones observadas

- Grupos de rutas con paréntesis ya en uso: `(curso)`, `(membership)`, `(user)` — agrupan layout/lógica
  compartida sin afectar la URL. Seguir ese patrón para features nuevas que compartan layout en vez de
  duplicar el layout en cada ruta hija.
- `src/app/admin` es el panel de administración — separado del resto del sitio público. Verificar
  autenticación/rol admin en cada página nueva de este árbol (no asumir que el layout padre ya lo
  bloquea sin confirmarlo).
- `src/app/dev` existe como área de utilidades de desarrollo — no exponerla como funcionalidad de
  producción sin revisar qué contiene.

## Componentes — dónde mirar antes de crear uno nuevo

`src/components/` tiene componentes organizados por feature (`BitacoraNavigator`,
`MainSideBarProducts`, `MainSidebar`, `WeeklyPathNavigator`, `PageComponent`, `InfoModal`) más
`src/components/ui` (genéricos) y `src/components/snippets`. Antes de crear un componente nuevo,
revisar si ya existe algo similar en `ui/` o `snippets/` para no duplicar.

## Landmines

- **Mezcla MUI + Tailwind en el mismo componente**: es intencional en este proyecto (no es un
  anti-patrón a "corregir" migrando todo a uno de los dos) — pero al tocar un componente existente,
  mantener el mecanismo que ya usa en vez de mezclar un tercero.
- **Rutas duplicadas en/es** (ver arriba): el error más común es editar solo una versión y dejar la
  otra desactualizada, o asumir cuál es la activa sin verificar.

---

## Changelog

| Fecha | Cambio | Disparador |
|-------|--------|------------|
| 2026-07-30 | Creación inicial — regla de inputs migrada desde `.cursor/rules/form-inputs-visible-text.mdc`, landmines de rutas en/es y mezcla MUI+Tailwind documentados | Migración de contexto desde Cursor / adaptación del framework `.claude/` de uContact |
