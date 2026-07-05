import Product from '../models/productModel';
import type { CursoPlanPago } from '../types/cursoLanding';

export type DlocalLinkPersistPayload = {
  paymentLink: string;
  dlocalOrderId: string;
  dlocalPaymentId?: string;
  merchantCheckoutToken?: string;
};

function patchDlocalOpcion(
  opciones: CursoPlanPago[],
  update: DlocalLinkPersistPayload
): CursoPlanPago[] {
  const idx = opciones.findIndex((o) => o.proveedor === 'dlocalgo');
  const existing = idx >= 0 ? opciones[idx] : null;

  const patched: CursoPlanPago = {
    proveedor: 'dlocalgo',
    etiqueta: existing?.etiqueta || 'Empezar AHORA (paga en cuotas)',
    descripcion:
      existing?.descripcion ||
      'Pago con tarjetas regionales y hasta 12 cuotas en moneda local.',
    monto: existing?.monto ?? 0,
    moneda: existing?.moneda ?? 'USD',
    paymentLink: update.paymentLink,
    activo: Boolean(update.paymentLink),
    dlocalOrderId: update.dlocalOrderId,
    dlocalPaymentId: update.dlocalPaymentId,
    merchantCheckoutToken: update.merchantCheckoutToken,
  };

  if (idx >= 0) {
    const next = [...opciones];
    next[idx] = { ...existing, ...patched };
    return next;
  }

  return [...opciones, patched];
}

/** Guarda el link dLocal regenerado en el producto (lanzamiento o tier de preventa). */
export async function persistCursoDlocalPaymentLink(
  productId: string,
  update: DlocalLinkPersistPayload,
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
      opcionesPago: patchDlocalOpcion(tier.opcionesPago || [], update),
    };
    product.set('cursoConfig.preciosPreventa', tiers);
  } else {
    const planes = { ...(cursoConfig.planes || {}) };
    planes.opcionesPago = patchDlocalOpcion(planes.opcionesPago || [], update);
    product.set('cursoConfig.planes', planes);
  }

  await product.save();
}
