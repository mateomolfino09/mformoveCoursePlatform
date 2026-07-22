import mongoose from 'mongoose';
import Product from '../../../../models/productModel';
import User from '../../../../models/userModel';
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
};

export type FulfillCoursePurchaseResult = {
  alreadyProcessed: boolean;
  userId: string;
  productId: string;
  user: unknown;
};

const hasCourseAccess = (user: any, productId: string) => {
  const target = productId.toString();
  return (user.cursosAdquiridos || []).some((entry: any) => entry?.productoId?.toString() === target);
};

export async function fulfillCoursePurchase({
  productId,
  provider,
  transactionId,
  email,
  userId,
  amount,
  moneda,
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
  if (authenticatedUser && !hasCourseAccess(authenticatedUser, productId)) {
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

  if (hasCourseAccess(user, productId)) {
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
