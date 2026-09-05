# Handoff para Claude — regenerar Payment Links de Cuerpo Autónomo

> Pegar este texto como prompt. Sirve para **dev ahora** y para **prod después**
> (mismo endpoint, otra base URL). Cursor ya dejó el endpoint listo.

## Qué acaba de hacer Cursor (no lo reimplementes)

Cuerpo Autónomo pasa de pago único a **suscripción Stripe con 2 precios**:

1. **Mensual** — el `precio` del producto.
2. **Cada 4 meses** — 3× el mensual, `recurring.interval_count = 4` (paga 3, se lleva 4).

Landing: `CoursePlans.tsx` muestra las dos cards y elige `?intervalo=1|4` hacia checkout.
En la card de precio único, el countdown falso de “el precio aumenta” se reemplazó por
**llamada 1:1 de 40 min con Mateo** (el countdown de preventa real se mantiene).

Los links **no** se crean al prender el toggle a mano. Hay que llamar al endpoint de abajo
(o guardar el curso desde el dashboard, que también regenera si `esSuscripcion: true`).

## Tu tarea AHORA (dev)

1. Confirmá que `next dev` está levantado y que Mongo responde (si ves `ECONNREFUSED`,
   levantá Mongo / el `.env` `MONGODB_URI` de **dev**, no prod).
2. Buscá un usuario Admin en la DB de **dev** (`rol: 'Admin'`). Necesitás su `email`.
3. Pegale a este endpoint **contra localhost**, no contra prod:

```bash
curl -sS -X POST http://localhost:3000/api/product/regenerateSuscripcionPaymentLinks \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"EMAIL_ADMIN_DEV"}'
```

Sin `productId` ni `slug` busca Cuerpo Autónomo solo. Si hace falta:

```json
{ "userEmail": "EMAIL_ADMIN_DEV", "slug": "cuerpo-autonomo" }
```

4. Éxito = HTTP 200 y `opcionesPago` con **dos** entradas Stripe:
   - `intervaloMeses: 1` + `paymentLink` + `stripePriceId`
   - `intervaloMeses: 4` + `paymentLink` + `stripePriceId` (monto = 3× el mensual)
5. Reportá los dos `paymentLink` y los montos. No commitees `.env`. No toques prod.

## Guardalo para PROD (hacerlo desde Cursor, no ahora)

Cuando el código esté en producción, **desde Cursor** (no desde esta sesión de Claude
salvo que Mateo lo pida) pegarle al **mismo** path en la URL de prod:

```bash
curl -sS -X POST "$NEXT_PUBLIC_BASE_URL/api/product/regenerateSuscripcionPaymentLinks" \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"EMAIL_ADMIN_PROD"}'
```

`$NEXT_PUBLIC_BASE_URL` es la URL pública de prod (Vercel). El `userEmail` tiene que ser
Admin **en la Mongo de prod**. `STRIPE_SECRET_KEY` de ese deploy tiene que ser la de
**prod** (si no, los links quedan en el Stripe de test).

No uses `PUT /api/product/updateProduct` para esto: pide el producto entero y un body
parcial puede pisar campos.

## Qué no tocar

- Webhooks de Stripe / MercadoPago.
- `cursosAdquiridos` de usuarios ya existentes.
- El endpoint viejo `/api/debug/regenerate-payment-links` (es solo para **eventos**).
