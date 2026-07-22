import Product from '../models/productModel';
import { coursePaymentDebug, coursePaymentWarn } from './coursePaymentDebug';

type UserDoc = {
  _id: { toString(): string };
  cursosAdquiridos?: Array<{
    productoId?: { toString(): string } | string;
    fechaCompra?: Date;
    metodoPago?: string;
    transaccionId?: string;
    monto?: number;
    moneda?: string;
    bienvenidaPendiente?: boolean;
  }>;
  save: () => Promise<unknown>;
};

function userHasProduct(user: UserDoc, productId: string): boolean {
  const target = productId.toString();
  return (user.cursosAdquiridos || []).some(
    (entry) => entry?.productoId?.toString() === target
  );
}

/**
 * Regalo del plan anual: asigna todos los cursos activos al usuario (idempotente).
 * No envía emails de bienvenida por producto para evitar spam.
 */
export async function grantAnnualMentorshipProductGifts(
  user: UserDoc,
  mentorshipTransactionId: string
): Promise<{ granted: number; skipped: number }> {
  const products = await Product.find({
    tipo: 'curso',
    activo: { $ne: false },
  })
    .select('_id nombre')
    .lean();

  if (!products.length) {
    coursePaymentDebug('mentorship.annual_gifts.none', {
      userId: user._id.toString(),
    });
    return { granted: 0, skipped: 0 };
  }

  user.cursosAdquiridos = user.cursosAdquiridos || [];
  let granted = 0;
  let skipped = 0;

  for (const product of products) {
    const productId = String(product._id);
    if (userHasProduct(user, productId)) {
      skipped += 1;
      continue;
    }

    user.cursosAdquiridos.push({
      productoId: product._id as any,
      fechaCompra: new Date(),
      metodoPago: 'gratis',
      transaccionId: `mentorship-anual-gift:${mentorshipTransactionId}:${productId}`,
      monto: 0,
      moneda: 'USD',
      bienvenidaPendiente: false,
    });
    granted += 1;
  }

  if (granted > 0) {
    await user.save();
  }

  coursePaymentDebug('mentorship.annual_gifts.done', {
    userId: user._id.toString(),
    mentorshipTransactionId,
    granted,
    skipped,
    total: products.length,
  });

  if (granted === 0 && skipped === 0) {
    coursePaymentWarn('mentorship.annual_gifts.empty', {
      userId: user._id.toString(),
    });
  }

  return { granted, skipped };
}
