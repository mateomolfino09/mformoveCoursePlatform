import mongoose from 'mongoose';
import Product from '../../../../models/productModel';
import User from '../../../../models/userModel';
import { userHasPurchasedCourse } from '../../../../lib/courseAccess';
import { coursePaymentDebug, coursePaymentWarn } from '../../../../lib/coursePaymentDebug';
import { sendCourseWelcomeEmail } from '../../../../lib/sendCourseWelcomeEmail';

export type FulfillCoursePurchaseInput = {
  productId: string;
  provider: 'stripe' | 'dlocalgo' | 'mercadopago';
  transactionId: string;
  email?: string | null;
  userId?: string | null;
  amount?: number;
  moneda?: string;
  /** 'suscripcion' cuando el checkout fue de una suscripción de Stripe (default 'compra_unica'). */
  source?: 'compra_unica' | 'suscripcion' | 'manual' | 'beta';
  /** Solo relevante cuando source==='suscripcion': fin del período pago vigente. */
  expiresAt?: Date | null;
  /** Solo relevante cuando source==='suscripcion': id de la suscripción en Stripe. */
  stripeSubscriptionId?: string;
};

export type FulfillCoursePurchaseResult = {
  alreadyProcessed: boolean;
  userId: string;
  productId: string;
  user: unknown;
};

const hasActiveCourseAccess = (
  user: Parameters<typeof userHasPurchasedCourse>[0],
  productId: string
) => userHasPurchasedCourse(user, productId);

export async function fulfillCoursePurchase({
  productId,
  provider,
  transactionId,
  email,
  userId,
  amount,
  moneda,
  source = 'compra_unica',
  expiresAt = null,
  stripeSubscriptionId,
}: FulfillCoursePurchaseInput): Promise<FulfillCoursePurchaseResult> {
  coursePaymentDebug('fulfill.start', {
    productId,
    provider,
    transactionId,
    userId: userId || undefined,
    email: email || undefined,
    amount,
    moneda,
  });

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Producto inválido');
  }

  const product = await Product.findById(productId);
  if (!product || product.tipo !== 'curso') {
    coursePaymentWarn('fulfill.product_not_found', { productId, tipo: product?.tipo });
    throw new Error('Producto de curso no encontrado');
  }

  const duplicateTransaction = await User.findOne({
    'cursosAdquiridos.transaccionId': transactionId,
    'cursosAdquiridos.productoId': productId,
  });

  if (duplicateTransaction) {
    coursePaymentDebug('fulfill.duplicate_transaction', {
      userId: duplicateTransaction._id.toString(),
      productId,
      transactionId,
    });
    return {
      alreadyProcessed: true,
      userId: duplicateTransaction._id.toString(),
      productId,
      user: duplicateTransaction,
    };
  }

  let authenticatedUser = null;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    authenticatedUser = await User.findById(userId);
    coursePaymentDebug('fulfill.user_lookup', {
      by: 'userId',
      found: Boolean(authenticatedUser),
      userId,
    });
  }

  let emailUser = null;
  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    emailUser = await User.findOne({ email: normalizedEmail });
    coursePaymentDebug('fulfill.user_lookup', {
      by: 'email',
      found: Boolean(emailUser),
      email: normalizedEmail,
    });
  }

  // Prioridad: sesión autenticada (quien inició el checkout) > email del pago.
  let user = null;
  if (authenticatedUser && !hasActiveCourseAccess(authenticatedUser, productId)) {
    user = authenticatedUser;
    coursePaymentDebug('fulfill.user_selected', {
      by: 'authenticated_without_access',
      userId: user._id.toString(),
    });
  } else if (emailUser) {
    user = emailUser;
  } else if (authenticatedUser) {
    user = authenticatedUser;
  }

  if (!user) {
    coursePaymentWarn('fulfill.user_not_found', {
      productId,
      provider,
      transactionId,
      userId: userId || undefined,
      email: email || undefined,
    });
    throw new Error('No se encontró un usuario para asignar el curso');
  }

  if (hasActiveCourseAccess(user, productId)) {
    coursePaymentDebug('fulfill.already_has_access', {
      userId: user._id.toString(),
      productId,
      selectedBy:
        authenticatedUser && user._id.equals(authenticatedUser._id)
          ? 'authenticated'
          : 'email',
    });
    return {
      alreadyProcessed: true,
      userId: user._id.toString(),
      productId,
      user,
    };
  }

  user.cursosAdquiridos = user.cursosAdquiridos || [];
  user.cursosAdquiridos.push({
    productoId: product._id,
    fechaCompra: new Date(),
    metodoPago: provider,
    transaccionId: transactionId,
    monto: amount,
    moneda: moneda || product.moneda || 'USD',
    bienvenidaPendiente: true,
    source,
    status: 'active',
    expiresAt,
    ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
  });

  await user.save();

  coursePaymentDebug('fulfill.granted', {
    userId: user._id.toString(),
    productId,
    provider,
    transactionId,
  });

  try {
    await sendCourseWelcomeEmail({
      user: { email: user.email, name: user.name },
      productId,
    });
  } catch (emailError) {
    coursePaymentWarn('fulfill.welcome_email_error', {
      productId,
      userId: user._id.toString(),
      emailError,
    });
  }

  return {
    alreadyProcessed: false,
    userId: user._id.toString(),
    productId,
    user,
  };
}

/**
 * Actualiza la vigencia de una entrada de cursosAdquiridos con source:'suscripcion',
 * ubicada por stripeSubscriptionId. La usan los webhooks de renovación/cancelación/expiración
 * de Stripe — nunca crea la entrada (eso lo hace fulfillCoursePurchase en el checkout inicial).
 */
export async function updateCourseSubscriptionStatus({
  stripeSubscriptionId,
  status,
  expiresAt,
}: {
  stripeSubscriptionId: string;
  status: 'active' | 'expired' | 'revoked';
  expiresAt?: Date | null;
}): Promise<{ updated: boolean; userId?: string; productId?: string }> {
  const user = await User.findOne({ 'cursosAdquiridos.stripeSubscriptionId': stripeSubscriptionId });
  if (!user) {
    coursePaymentWarn('fulfill.subscription_not_found', { stripeSubscriptionId });
    return { updated: false };
  }

  const entry = (user.cursosAdquiridos || []).find(
    (e: any) => e.stripeSubscriptionId === stripeSubscriptionId
  );
  if (!entry) {
    return { updated: false };
  }

  entry.status = status;
  if (expiresAt !== undefined) {
    entry.expiresAt = expiresAt;
  }
  await user.save();

  coursePaymentDebug('fulfill.subscription_status_updated', {
    stripeSubscriptionId,
    status,
    userId: user._id.toString(),
    productId: entry.productoId?.toString(),
  });

  return { updated: true, userId: user._id.toString(), productId: entry.productoId?.toString() };
}
