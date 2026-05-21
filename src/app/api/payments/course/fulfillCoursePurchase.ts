import mongoose from 'mongoose';
import Product from '../../../../models/productModel';
import User from '../../../../models/userModel';

export type FulfillCoursePurchaseInput = {
  productId: string;
  provider: 'stripe' | 'dlocalgo';
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
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Producto inválido');
  }

  const product = await Product.findById(productId);
  if (!product || product.tipo !== 'curso') {
    throw new Error('Producto de curso no encontrado');
  }

  let user = null;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    user = await User.findById(userId);
  }

  if (!user && email) {
    user = await User.findOne({ email: email.trim().toLowerCase() });
  }

  if (!user) {
    throw new Error('No se encontró un usuario para asignar el curso');
  }

  if (hasCourseAccess(user, productId)) {
    return {
      alreadyProcessed: true,
      userId: user._id.toString(),
      productId,
      user,
    };
  }

  const duplicateTransaction = await User.findOne({
    'cursosAdquiridos.transaccionId': transactionId,
    'cursosAdquiridos.productoId': productId,
  });

  if (duplicateTransaction) {
    return {
      alreadyProcessed: true,
      userId: duplicateTransaction._id.toString(),
      productId,
      user: duplicateTransaction,
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
  });

  await user.save();

  return {
    alreadyProcessed: false,
    userId: user._id.toString(),
    productId,
    user,
  };
}
