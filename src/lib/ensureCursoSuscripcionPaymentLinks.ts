import type { CursoLandingConfig } from '../types/cursoLanding';
import {
  buildCursoSuscripcionOpcionesPago,
  createCourseSubscriptionPayments,
} from '../app/api/payments/stripe/createCourseOneTimePayments';
import { normalizeCursoLandingConfig } from '../types/cursoLanding';
import { buildCursoStripeSuccessUrl } from './cursoPaymentUrls';
import { coursePaymentWarn } from './coursePaymentDebug';

type ProductLike = {
  _id: { toString(): string } | string;
  nombre?: string;
  name?: string;
  descripcion?: string;
  description?: string;
  precio?: number;
  moneda?: string;
  portada?: string;
  esSuscripcion?: boolean;
  cursoConfig?: CursoLandingConfig | null;
};

/**
 * Crea (o regenera) los dos Payment Links de suscripción (mensual + 4 meses)
 * para un curso con `esSuscripcion: true`.
 *
 * A diferencia de `ensureCursoLanzamientoPaymentLinks`, esta función **siempre
 * regenera** los links: es la acción explícita del admin al guardar un curso de
 * suscripción desde el dashboard.
 */
export async function ensureCursoSuscripcionPaymentLinks(
  product: ProductLike,
  origin: string
): Promise<CursoLandingConfig | null | undefined> {
  const cursoConfig = product.cursoConfig;
  if (!cursoConfig) return cursoConfig;

  const precio = Number(product.precio);
  if (!precio || precio <= 0) {
    coursePaymentWarn('ensure_suscripcion.precio_invalido', {
      productId: typeof product._id === 'string' ? product._id : product._id.toString(),
      precio,
    });
    return cursoConfig;
  }

  const productId =
    typeof product._id === 'string' ? product._id : product._id.toString();
  const nombre = product.nombre || product.name || 'Curso';
  const descripcion = product.descripcion || product.description || nombre;
  const moneda = product.moneda || 'USD';
  const portadaUrl = cursoConfig.imagenCheckoutPublicId || product.portada || '';

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin;
  const successUrl = buildCursoStripeSuccessUrl(baseUrl, productId);

  try {
    const pagos = await createCourseSubscriptionPayments({
      productId,
      nombre,
      descripcion,
      precio,
      moneda,
      portadaUrl,
      successUrl,
    });

    const opcionesPago = buildCursoSuscripcionOpcionesPago({
      precioMensual: precio,
      moneda,
      pagos,
    });

    const updatedConfig: CursoLandingConfig = {
      ...cursoConfig,
      planes: {
        ...(cursoConfig.planes || {}),
        opcionesPago,
      },
    };

    return normalizeCursoLandingConfig(updatedConfig, nombre);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error desconocido';
    coursePaymentWarn('ensure_suscripcion.failed', { productId, message });
    // No lanzar: devolvemos el config existente sin modificar para no romper el save.
    return cursoConfig;
  }
}
