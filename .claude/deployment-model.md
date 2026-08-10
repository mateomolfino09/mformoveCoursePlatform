# Deployment & Runtime Model — MMove Course Platform

> Cómo se buildea, deploya y corre este proyecto — y por qué el deploy no es una acción del agente.
>
> **Límite duro:** ningún secreto, token, password o URL interna va en este archivo o en cualquier
> doc de `.claude/`. Leer `vercel.json` y el panel de Vercel directamente cuando haga falta el detalle
> real, no memorizarlo acá.

---

## Runtime: Vercel (serverless), no una VM persistente

A diferencia de un despliegue en VM propia, este proyecto corre en **Vercel**:

- Cada route handler (`src/app/api/**`) es una función serverless — no hay proceso persistente ni
  estado en memoria entre requests (no asumir que una variable global sobrevive entre invocaciones).
- El build (`next build`) genera tanto las páginas (SSR/SSG según el caso) como las funciones API.
- `vercel.json` en la raíz configura comportamiento específico de la plataforma — incluye **cron jobs**
  (ver `src/app/api/cron/**`), que Vercel invoca automáticamente según el schedule configurado ahí, no
  un scheduler propio del proyecto.
- **Límite de duración de función**: las funciones serverless de Vercel tienen un timeout — relevante
  para el landmine de "emails inline sin cola" documentado en `AGENTS-backend.md` (un loop grande de
  envío de mails dentro de un handler puede timeoutear).

## Build → deploy

- Push a la rama configurada en Vercel (a confirmar cuál — históricamente `main`, verificar en el
  panel de Vercel antes de asumir) dispara un deploy automático.
- No hay artefacto versionado tipo `.zip` ni instalador — el deploy es continuo, gestionado por la
  integración de Vercel con GitHub.
- **El agente no deploya.** No hay "deploy a producción" como acción del agente — el push (si el
  usuario lo pide explícitamente) es lo máximo que se hace desde acá; Vercel toma el resto.

## Variables de entorno

- Definidas en el panel de Vercel para producción/preview, y en `.env` local (no commiteado) para
  desarrollo. `.env.example` documenta las claves — nunca los valores reales.
- Variables con sufijo `_PRODUCTION` (ej. `MONGODB_URI_PRODUCTION`) son de uso exclusivo del servidor —
  ver `CLAUDE.md` regla 1.

## Base de datos

MongoDB gestionado externamente (Atlas u otro proveedor — confirmar con el desarrollador si hace falta
el detalle operativo). La conexión se abre por función/request vía `connectDB()` — no hay pool
persistente compartido entre invocaciones serverless de la misma forma que en un servidor tradicional
(relevante si se investiga un problema de conexiones agotadas).

## Preview deployments

Vercel genera un deploy de preview por PR/rama — útil para validar manualmente un cambio antes de
mergear (ver `.claude/testing.md`, dado que no hay test harness automatizado).

---

## Qué significa esto para el agente

- **El agente no deploya ni gestiona el panel de Vercel.** Su responsabilidad termina en código
  correcto y buildable (`npm run build` pasa).
- **No hay estado persistente entre requests** — no diseñar features que asuman memoria compartida
  entre invocaciones de funciones serverless sin pasar por Mongo o un servicio externo.
- **Límite de duración de función** — cualquier lógica potencialmente lenta (envío masivo de emails,
  procesamiento pesado) debe considerar background/async, no bloquear la respuesta.

---

## Fuera de alcance de `.claude/`

Los detalles operativos exactos de la configuración de Vercel (dominio, variables por entorno,
integraciones) no se documentan acá más allá de este modelo — leer el panel de Vercel o preguntar al
desarrollador cuando haga falta el dato específico.
