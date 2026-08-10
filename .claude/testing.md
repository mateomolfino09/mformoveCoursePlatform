# Testing — MMove Course Platform

> Leer esto antes de asumir que existe un test o de proponer "agregar tests unitarios" en una
> revisión. Documenta el **estado real de testing de este repo**, que es mínimo — no prescribe un
> framework que no está instalado.

---

## Estado de testing en este repo (verificado)

- **No hay harness de tests automatizados.** `package.json` no tiene script `test`, ni dependencias de
  Jest/Vitest/Mocha/Playwright/Cypress entre `dependencies`/`devDependencies`. No hay carpeta
  `__tests__/` ni archivos `*.test.ts`/`*.spec.ts` detectados.
- **Verificación real disponible:** `npm run build` (compila TypeScript + Next.js — atrapa errores de
  tipo y de build), `npm run lint` / `npm run eslint` (calidad estática), y validación manual del flujo
  afectado.
- Hay scripts de simulación puntuales (`scripts/simulate-curso-create-full.mjs`,
  `scripts/simulate-curso-create-payload.mjs`) — son scripts manuales de un desarrollador para probar
  un flujo específico, no un harness de test automatizado ni parte de un pipeline de CI.

> ⚠️ No importar convenciones de otro proyecto que sí tenga test harness. Este repo, hoy, no lo tiene.

---

## Cómo verificar un cambio acá

1. **El build debe pasar:**
   ```bash
   npm run build
   ```
2. **Lint:**
   ```bash
   npm run lint
   ```
3. **Validación manual** del flujo afectado — especialmente crítico en pagos (Stripe/MercadoPago:
   usar tarjetas/cuentas de test, nunca producción) y en formularios (regla de inputs visibles).
4. **Correr las skills de validación** sobre lo que cambió — `architecture-validator` (backend) /
   `frontend-validator` (frontend). Son chequeos estáticos, no tests, pero es la red de seguridad
   automatizada más cercana que tiene este repo.

## En code review / pre-PR

- **No pedir tests unitarios** — no hay dónde alojarlos hoy. Si una feature justifica cobertura
  automatizada, es una decisión de proyecto (agregar el framework) — señalarlo como sugerencia aparte,
  no como bloqueante de la tarea actual.
- El pedido accionable en su lugar es: un **plan de prueba manual** claro (la skill
  `test-case-generator` ayuda a redactarlo) y confirmación de que el build pasa.

---

## Si en algún momento se agrega un framework de test

Sería una decisión del proyecto, no algo a asumir. Si/cuando pase, documentar acá el framework elegido
y las convenciones, y actualizar este archivo y `MAINTENANCE.md` en consecuencia — hasta entonces, este
archivo registra intencionalmente la ausencia en vez de un setup ficticio.
