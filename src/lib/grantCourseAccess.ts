import Users from '../models/userModel';
import Product from '../models/productModel';
import { userHasPurchasedCourse } from './courseAccess';
import { sendCourseWelcomeEmail } from './sendCourseWelcomeEmail';
import { isProductGrantable } from './grantableProducts';

export type GrantCourseAccessInput = {
  email: string;
  productId: string;
  months?: number | null;
  metodoPago: 'transferencia' | 'gratis';
  sendWelcomeEmail: boolean;
  grantedByAdminId: string;
};

export type GrantCourseAccessResult =
  | { ok: false; code: 'product_not_found' | 'product_not_grantable' | 'user_not_found' }
  | {
      ok: true;
      alreadyHadAccess: boolean;
      userId: string;
      productId: string;
      productName: string;
      email: string;
      emailSent: boolean;
      expiresAt: Date | null;
    };

function addMonths(from: Date, months: number): Date {
  const next = new Date(from);
  next.setMonth(next.getMonth() + months);
  return next;
}

export async function grantCourseAccessToEmail({
  email: rawEmail,
  productId,
  months,
  metodoPago,
  sendWelcomeEmail,
  grantedByAdminId,
}: GrantCourseAccessInput): Promise<GrantCourseAccessResult> {
  const email = rawEmail.trim().toLowerCase();
  const product = await Product.findById(productId);
  if (!product || product.tipo !== 'curso') {
    return { ok: false, code: 'product_not_found' };
  }
  if (!isProductGrantable(product)) {
    return { ok: false, code: 'product_not_grantable' };
  }

  const user = await Users.findOne({ email });
  if (!user) {
    return { ok: false, code: 'user_not_found' };
  }

  const resolvedProductId = product._id.toString();
  const productName = product.nombre || product.name || 'Curso';

  if (userHasPurchasedCourse(user, resolvedProductId)) {
    return {
      ok: true,
      alreadyHadAccess: true,
      userId: user._id.toString(),
      productId: resolvedProductId,
      productName,
      email: user.email,
      emailSent: false,
      expiresAt: null,
    };
  }

  const now = new Date();
  const monthsNumber = Number(months);
  const hasTerm =
    Number.isFinite(monthsNumber) && monthsNumber > 0
      ? Math.floor(monthsNumber)
      : 0;
  const expiresAt = hasTerm > 0 ? addMonths(now, hasTerm) : null;

  user.cursosAdquiridos = user.cursosAdquiridos || [];
  user.cursosAdquiridos.push({
    productoId: product._id,
    fechaCompra: now,
    metodoPago,
    transaccionId: `manual-grant:${grantedByAdminId}:${now.getTime()}`,
    monto: 0,
    moneda: product.moneda || 'USD',
    bienvenidaPendiente: Boolean(sendWelcomeEmail),
    source: expiresAt ? 'suscripcion' : 'manual',
    status: 'active',
    expiresAt,
  });
  await user.save();

  let emailSent = false;
  if (sendWelcomeEmail) {
    try {
      await sendCourseWelcomeEmail({
        user: { email: user.email, name: user.name },
        productId: resolvedProductId,
      });
      emailSent = true;
    } catch (emailError) {
      console.error('[grantCourseAccess] welcome email failed', email, emailError);
    }
  }

  return {
    ok: true,
    alreadyHadAccess: false,
    userId: user._id.toString(),
    productId: resolvedProductId,
    productName,
    email: user.email,
    emailSent,
    expiresAt,
  };
}
