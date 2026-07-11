import type { CursoLandingConfig, CursoPlanPago } from '../types/cursoLanding';
import {
  buildCursoOpcionesPago,
  createCourseOneTimePayments,
  createStripeCoursePaymentLink,
} from '../app/api/payments/stripe/createCourseOneTimePayments';
import { createCursoDlocalPaymentLink } from './cursoDlocalPaymentLink';
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
  cursoConfig?: CursoLandingConfig | null;
};

function hasPaymentLink(
  opcionesPago: CursoPlanPago[] | undefined,
  proveedor: 'stripe' | 'dlocalgo'
): boolean {
  const option = (opcionesPago || []).find((o) => o.proveedor === proveedor);
  return Boolean(option?.paymentLink?.trim());
}

function mergeOpcionesPago(
  existing: CursoPlanPago[] | undefined,
  nuevas: CursoPlanPago[]
): CursoPlanPago[] {
  const merged = [...(existing || [])];

  for (const nueva of nuevas) {
    const idx = merged.findIndex((o) => o.proveedor === nueva.proveedor);
    if (idx >= 0) {
      merged[idx] = { ...merged[idx], ...nueva };
    } else {
      merged.push(nueva);
    }
  }

  return merged;
}

/**
 * Completa links de lanzamiento (Stripe y dLocal) de forma independiente:
 * solo genera el proveedor que aún no tiene paymentLink.
 */
export async function ensureCursoLanzamientoPaymentLinks(
  product: ProductLike,
  origin: string
): Promise<CursoLandingConfig | null | undefined> {
  const cursoConfig = product.cursoConfig;
  if (!cursoConfig) return cursoConfig;

  const opcionesPago = cursoConfig.planes?.opcionesPago;
  const needsStripe = !hasPaymentLink(opcionesPago, 'stripe');
  const needsDlocal = !hasPaymentLink(opcionesPago, 'dlocalgo');

  if (!needsStripe && !needsDlocal) return cursoConfig;

  const productId =
    typeof product._id === 'string' ? product._id : product._id.toString();
  const nombre = product.nombre || product.name || 'Curso';
  const descripcion = product.descripcion || product.description || nombre;
  const precio = Number(product.precio);
  const moneda = product.moneda || 'USD';
  const portadaUrl =
    cursoConfig.imagenCheckoutPublicId || product.portada || '';

  if (!precio || precio <= 0) return cursoConfig;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin;
  const successUrl = buildCursoStripeSuccessUrl(baseUrl, productId);

  const pagos: Awaited<ReturnType<typeof createCourseOneTimePayments>> = {
    stripe: {
      productId: '',
      priceId: '',
      paymentLink: '',
    },
    dlocalgo: {
      orderId: undefined,
      paymentId: undefined,
      paymentLink: undefined,
      merchantCheckoutToken: undefined,
    },
  };

  if (needsStripe) {
    pagos.stripe = await createStripeCoursePaymentLink({
      productId,
      nombre,
      descripcion,
      precio,
      moneda,
      portadaUrl,
      successUrl,
    });
  }

  if (needsDlocal) {
    try {
      const dlocalResult = await createCursoDlocalPaymentLink({
        productId,
        nombre,
        descripcion,
        precio,
        moneda,
        origin: baseUrl,
        orderSuffix: Date.now().toString(36),
      });
      pagos.dlocalgo = {
        orderId: dlocalResult.orderId,
        paymentId: dlocalResult.paymentId,
        paymentLink: dlocalResult.paymentLink,
        merchantCheckoutToken: dlocalResult.merchantCheckoutToken,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'No se pudo crear el link de dLocal GO';
      coursePaymentWarn('ensure_lanzamiento.dlocal.failed', {
        productId,
        message,
      });
    }
  }

  const nuevasOpciones = buildCursoOpcionesPago({ precio, moneda, pagos });
  const opcionesAMezclar = nuevasOpciones.filter((opcion) => {
    if (opcion.proveedor === 'stripe') return needsStripe;
    if (opcion.proveedor === 'dlocalgo') {
      return needsDlocal && Boolean(opcion.paymentLink?.trim());
    }
    return false;
  });

  if (opcionesAMezclar.length === 0) return cursoConfig;

  return {
    ...cursoConfig,
    planes: {
      ...(cursoConfig.planes || {}),
      opcionesPago: mergeOpcionesPago(opcionesPago, opcionesAMezclar),
    },
  };
}
