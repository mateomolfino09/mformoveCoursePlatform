import type { CursoLandingConfig, CursoPlanPago } from '../types/cursoLanding';
import {
  buildCursoOpcionesPago,
  createCourseOneTimePayments,
  createStripeCoursePaymentLink,
} from '../app/api/payments/stripe/createCourseOneTimePayments';
import { createCursoDlocalPaymentLink } from './cursoDlocalPaymentLink';
import { createCursoMercadoPagoPaymentLink } from './cursoMercadoPagoPaymentLink';
import { buildCursoStripeSuccessUrl } from './cursoPaymentUrls';
import { coursePaymentWarn } from './coursePaymentDebug';
import {
  resolveProveedoresHabilitados,
  type PaymentProveedor,
} from '../constants/paymentProveedores';

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
  proveedor: PaymentProveedor
): boolean {
  const option = (opcionesPago || []).find((o) => o.proveedor === proveedor);
  if (proveedor === 'mercadopago') {
    return Boolean(option?.paymentLink?.trim() || option?.mercadoPagoPreferenceId);
  }
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
 * Completa links de lanzamiento de forma independiente:
 * solo genera el proveedor habilitado que aún no tiene paymentLink.
 */
export async function ensureCursoLanzamientoPaymentLinks(
  product: ProductLike,
  origin: string
): Promise<CursoLandingConfig | null | undefined> {
  const cursoConfig = product.cursoConfig;
  if (!cursoConfig) return cursoConfig;

  const enabled = resolveProveedoresHabilitados(cursoConfig.planes?.proveedoresHabilitados);
  const opcionesPago = cursoConfig.planes?.opcionesPago;
  const needsStripe = enabled.includes('stripe') && !hasPaymentLink(opcionesPago, 'stripe');
  const needsDlocal = enabled.includes('dlocalgo') && !hasPaymentLink(opcionesPago, 'dlocalgo');
  const needsMercadoPago =
    enabled.includes('mercadopago') && !hasPaymentLink(opcionesPago, 'mercadopago');

  if (!needsStripe && !needsDlocal && !needsMercadoPago) {
    const pruned = (opcionesPago || []).filter((o) => enabled.includes(o.proveedor));
    if (pruned.length === (opcionesPago || []).length) return cursoConfig;
    return {
      ...cursoConfig,
      planes: {
        ...(cursoConfig.planes || {}),
        proveedoresHabilitados: enabled,
        opcionesPago: pruned,
      },
    };
  }

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
  const orderSuffix = Date.now().toString(36);

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
    mercadopago: {
      preferenceId: undefined,
      externalReference: undefined,
      paymentLink: undefined,
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
        orderSuffix,
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

  if (needsMercadoPago) {
    try {
      const mpResult = await createCursoMercadoPagoPaymentLink({
        productId,
        nombre,
        descripcion,
        precio,
        moneda,
        origin: baseUrl,
        orderSuffix,
      });
      pagos.mercadopago = {
        preferenceId: mpResult.preferenceId,
        externalReference: mpResult.externalReference,
        paymentLink: mpResult.paymentLink,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'No se pudo crear el link de Mercado Pago';
      coursePaymentWarn('ensure_lanzamiento.mercadopago.failed', {
        productId,
        message,
      });
    }
  }

  const nuevasOpciones = buildCursoOpcionesPago({
    precio,
    moneda,
    pagos,
    proveedores: enabled,
  });
  const opcionesAMezclar = nuevasOpciones.filter((opcion) => {
    if (opcion.proveedor === 'stripe') return needsStripe;
    if (opcion.proveedor === 'dlocalgo') {
      return needsDlocal && Boolean(opcion.paymentLink?.trim());
    }
    if (opcion.proveedor === 'mercadopago') {
      return needsMercadoPago && Boolean(opcion.paymentLink?.trim() || opcion.mercadoPagoPreferenceId);
    }
    return false;
  });

  if (opcionesAMezclar.length === 0) return cursoConfig;

  return {
    ...cursoConfig,
    planes: {
      ...(cursoConfig.planes || {}),
      proveedoresHabilitados: enabled,
      opcionesPago: mergeOpcionesPago(opcionesPago, opcionesAMezclar).filter((o) =>
        enabled.includes(o.proveedor)
      ),
    },
  };
}
