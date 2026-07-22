import Product from '../models/productModel';
import type { CursoPlanPago } from '../types/cursoLanding';

export type MercadoPagoLinkPersistPayload = {
  paymentLink: string;
  mercadoPagoPreferenceId?: string;
  mercadoPagoExternalReference: string;
};

function patchMercadoPagoOpcion(
  opciones: CursoPlanPago[],
  update: MercadoPagoLinkPersistPayload
): CursoPlanPago[] {
  const idx = opciones.findIndex((o) => o.proveedor === 'mercadopago');
  const existing = idx >= 0 ? opciones[idx] : null;

  const patched: CursoPlanPago = {
    proveedor: 'mercadopago',
    etiqueta: existing?.etiqueta || 'Empezar AHORA (Mercado Pago)',
    descripcion:
      existing?.descripcion ||
      'Pago con Mercado Pago y hasta 12 cuotas en tarjeta.',
    monto: existing?.monto ?? 0,
    moneda: existing?.moneda ?? 'USD',
    paymentLink: update.paymentLink,
    activo: Boolean(update.paymentLink || update.mercadoPagoPreferenceId),
    mercadoPagoPreferenceId: update.mercadoPagoPreferenceId,
    mercadoPagoExternalReference: update.mercadoPagoExternalReference,
  };

  if (idx >= 0) {
    const next = [...opciones];
    next[idx] = { ...existing, ...patched };
    return next;
  }

  return [...opciones, patched];
}

/** Guarda el link Mercado Pago regenerado en el producto (lanzamiento o preventa). */
export async function persistCursoMercadoPagoPaymentLink(
  productId: string,
  update: MercadoPagoLinkPersistPayload,
  preventaTierIndex?: number | null
): Promise<void> {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  const cursoConfig = product.cursoConfig?.toObject?.() ?? product.cursoConfig ?? {};

  if (preventaTierIndex != null && preventaTierIndex >= 0) {
    const tiers = [...(cursoConfig.preciosPreventa || [])];
    const tier = tiers[preventaTierIndex];
    if (!tier) {
      throw new Error('Tier de preventa no encontrado');
    }
    tiers[preventaTierIndex] = {
      ...tier,
      opcionesPago: patchMercadoPagoOpcion(tier.opcionesPago || [], update),
    };
    product.set('cursoConfig.preciosPreventa', tiers);
  } else {
    const planes = { ...(cursoConfig.planes || {}) };
    planes.opcionesPago = patchMercadoPagoOpcion(planes.opcionesPago || [], update);
    product.set('cursoConfig.planes', planes);
  }

  await product.save();
}
