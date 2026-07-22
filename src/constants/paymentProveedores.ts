export type PaymentProveedor = 'stripe' | 'dlocalgo' | 'mercadopago';

export const ALL_PAYMENT_PROVEEDORES: PaymentProveedor[] = [
  'stripe',
  'dlocalgo',
  'mercadopago',
];

/** Default al crear cursos/planes nuevos: Stripe + Mercado Pago. */
export const DEFAULT_PAYMENT_PROVEEDORES: PaymentProveedor[] = [
  'stripe',
  'mercadopago',
];

/**
 * Cursos/planes antiguos sin `proveedoresHabilitados`:
 * mantienen Stripe + dLocal.
 */
export const LEGACY_PAYMENT_PROVEEDORES: PaymentProveedor[] = ['stripe', 'dlocalgo'];

export const PAYMENT_PROVEEDOR_LABELS: Record<PaymentProveedor, string> = {
  stripe: 'Stripe (internacional)',
  dlocalgo: 'dLocal GO (opcional · locales + cuotas)',
  mercadopago: 'Mercado Pago (Checkout Bricks · hasta 12 cuotas)',
};

export function resolveProveedoresHabilitados(
  list?: string[] | null
): PaymentProveedor[] {
  if (!Array.isArray(list) || list.length === 0) {
    return [...LEGACY_PAYMENT_PROVEEDORES];
  }

  const enabled = ALL_PAYMENT_PROVEEDORES.filter((p) => list.includes(p));
  return enabled.length > 0 ? enabled : [...DEFAULT_PAYMENT_PROVEEDORES];
}

export function isProveedorHabilitado(
  list: string[] | null | undefined,
  proveedor: PaymentProveedor
): boolean {
  return resolveProveedoresHabilitados(list).includes(proveedor);
}
