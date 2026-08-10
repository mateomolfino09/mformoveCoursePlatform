# EVALUATION — frontend-validator

> Ver ritual en [`../../MAINTENANCE.md`](../../MAINTENANCE.md). Arranca vacío de ejecuciones reales.

---

## Caso 1 — Input sin clases de texto visible (debe detectar F1/F2/F3)

**Input (sintético, congelado):**
```jsx
<input
  type="text"
  placeholder="Nombre del curso"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="w-full rounded border p-2"
/>
```

**Qué es éxito:** F1 (falta `text-gray-900`), F2 (falta `bg-white`), F3 (falta
`placeholder:text-gray-500`) — las tres Alta.

**Resultado de ejecución:** Not executed — pendiente de la primera corrida real.

---

## Caso 2 — Input correcto (NO debe marcar nada)

**Input:**
```jsx
<input
  className="w-full rounded border p-2 text-gray-900 bg-white placeholder:text-gray-500"
  placeholder="Nombre del curso"
/>
```

**Qué es éxito:** cero violaciones F1-F4 reportadas (precisión — no falso positivo).

**Resultado de ejecución:** Not executed.

---

## Caso 3 — Edición de ruta `clases/` sin confirmar canonicidad (debe detectar C1)

**Input:** un diff que solo toca `src/app/clases/page.tsx` sin mención de haber verificado enlaces
entrantes.

**Qué es éxito:** C1 (Media), señalando revisar si `classes` o `clases` es la activa.

**Resultado de ejecución:** Not executed.

---

## Skill maturity

| Fecha | Casos ejecutados | Precisión observada | Recall observado |
|-------|-------------------|----------------------|-------------------|
| 2026-07-30 | 0 / 3 (creación inicial) | — | — |
