import type { CursoLandingConfig } from '../types/cursoLanding';
import { isCursoEnPreventa } from './cursoLandingPublication';
import { resolveActivePrecioPreventa } from './cursoPricing';
import { generateCursoPreciosPreventaLinks } from '../app/api/payments/stripe/createCourseOneTimePayments';
import { resolveProveedoresHabilitados } from '../constants/paymentProveedores';

type ProductLike = {
  _id: { toString(): string } | string;
  nombre?: string;
  name?: string;
  descripcion?: string;
  description?: string;
  portada?: string;
  cursoConfig?: CursoLandingConfig | null;
};

function tierNeedsPaymentLinks(
  preciosPreventa: CursoLandingConfig['preciosPreventa'] | undefined,
  proveedores: ReturnType<typeof resolveProveedoresHabilitados>
): boolean {
  if (!preciosPreventa?.length) return false;
  const active = resolveActivePrecioPreventa(preciosPreventa);
  if (!active) return false;

  const opcionesPago = active.opcionesPago || [];
  for (const proveedor of proveedores) {
    const has = opcionesPago.some((o) => {
      if (o.proveedor !== proveedor || !o.activo) return false;
      if (proveedor === 'mercadopago') {
        return Boolean(o.paymentLink?.trim() || o.mercadoPagoPreferenceId);
      }
      return Boolean(o.paymentLink?.trim());
    });
    if (!has) return true;
  }
  return false;
}

/**
 * Genera links para el tier de preventa activo si aún no existen.
 */
export async function ensureCursoPreventaPaymentLinks(
  product: ProductLike,
  origin: string
): Promise<CursoLandingConfig | null | undefined> {
  const cursoConfig = product.cursoConfig;
  if (!cursoConfig || !isCursoEnPreventa(cursoConfig)) return cursoConfig;

  const enabled = resolveProveedoresHabilitados(cursoConfig.planes?.proveedoresHabilitados);
  if (!tierNeedsPaymentLinks(cursoConfig.preciosPreventa, enabled)) return cursoConfig;

  const productId =
    typeof product._id === 'string' ? product._id : product._id.toString();
  const nombre = product.nombre || product.name || 'Curso';
  const descripcion = product.descripcion || product.description || nombre;
  const portadaUrl = cursoConfig.imagenCheckoutPublicId || product.portada || '';
  const successUrl = `${origin}/membership/success?productId=${productId}&tipo=curso`;

  const preciosPreventa = await generateCursoPreciosPreventaLinks({
    productId,
    nombre,
    descripcion,
    portadaUrl,
    successUrl,
    origin,
    preciosPreventa: cursoConfig.preciosPreventa || [],
    proveedores: enabled,
  });

  return {
    ...cursoConfig,
    preciosPreventa,
  };
}
