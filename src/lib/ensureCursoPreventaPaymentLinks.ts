import type { CursoLandingConfig } from '../types/cursoLanding';
import { isCursoEnPreventa } from './cursoLandingPublication';
import { resolveActivePrecioPreventa } from './cursoPricing';
import { generateCursoPreciosPreventaLinks } from '../app/api/payments/stripe/createCourseOneTimePayments';

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
  preciosPreventa: CursoLandingConfig['preciosPreventa'] | undefined
): boolean {
  if (!preciosPreventa?.length) return false;
  const active = resolveActivePrecioPreventa(preciosPreventa);
  if (!active) return false;
  return !(active.opcionesPago || []).some((o) => o.activo && o.paymentLink);
}

/**
 * Genera links de Stripe/dLocal para el tier de preventa activo si aún no existen.
 * Devuelve cursoConfig actualizado (mismo objeto si no hizo falta generar).
 */
export async function ensureCursoPreventaPaymentLinks(
  product: ProductLike,
  origin: string
): Promise<CursoLandingConfig | null | undefined> {
  const cursoConfig = product.cursoConfig;
  if (!cursoConfig || !isCursoEnPreventa(cursoConfig)) return cursoConfig;
  if (!tierNeedsPaymentLinks(cursoConfig.preciosPreventa)) return cursoConfig;

  const productId =
    typeof product._id === 'string' ? product._id : product._id.toString();
  const slug = cursoConfig.slug?.trim() || 'curso';
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
  });

  return {
    ...cursoConfig,
    preciosPreventa,
  };
}
