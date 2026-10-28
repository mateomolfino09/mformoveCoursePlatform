import Users from '../models/userModel';
import Product from '../models/productModel';
import { stripe } from '../app/api/payments/stripe/stripeConfig';
import { isProductGrantable } from './grantableProducts';

export type RevokeCourseAccessInput = {
  email: string;
  productId: string;
};

export type RevokeCourseAccessResult =
  | {
      ok: false;
      code: 'product_not_found' | 'product_not_grantable' | 'user_not_found' | 'stripe_cancel_failed';
    }
  | {
      ok: true;
      alreadyWithoutAccess: boolean;
      userId: string;
      productId: string;
      productName: string;
      email: string;
      revokedCount: number;
      stripeCanceled: number;
    };

function isEntryVigente(
  entry: { status?: string; expiresAt?: Date | string | null },
  now: Date
): boolean {
  const status = entry.status ?? 'active';
  if (status !== 'active') return false;
  if (!entry.expiresAt) return true;
  return new Date(entry.expiresAt).getTime() > now.getTime();
}

async function cancelStripeSubscription(subscriptionId: string): Promise<void> {
  try {
    const current = await stripe.subscriptions.retrieve(subscriptionId);
    if (current.status === 'canceled') return;
    await stripe.subscriptions.cancel(subscriptionId);
  } catch (error: any) {
    if (error?.code === 'resource_missing' || error?.statusCode === 404) return;
    throw error;
  }
}

export async function revokeCourseAccessFromEmail({
  email: rawEmail,
  productId,
}: RevokeCourseAccessInput): Promise<RevokeCourseAccessResult> {
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
  const now = new Date();
  const entries = (user.cursosAdquiridos || []).filter(
    (entry: { productoId?: { toString(): string }; status?: string; expiresAt?: Date | null; stripeSubscriptionId?: string }) =>
      entry?.productoId?.toString() === resolvedProductId && isEntryVigente(entry, now)
  );

  if (entries.length === 0) {
    return {
      ok: true,
      alreadyWithoutAccess: true,
      userId: user._id.toString(),
      productId: resolvedProductId,
      productName,
      email: user.email,
      revokedCount: 0,
      stripeCanceled: 0,
    };
  }

  const stripeIds = Array.from(
    new Set(
      entries
        .map((entry: { stripeSubscriptionId?: string }) => String(entry.stripeSubscriptionId || '').trim())
        .filter(Boolean)
    )
  );

  try {
    for (const subscriptionId of stripeIds) {
      await cancelStripeSubscription(subscriptionId);
    }
  } catch (error) {
    console.error('[revokeCourseAccess] stripe cancel failed', email, error);
    return { ok: false, code: 'stripe_cancel_failed' };
  }

  for (const entry of entries) {
    entry.status = 'revoked';
    entry.bienvenidaPendiente = false;
  }
  await user.save();

  return {
    ok: true,
    alreadyWithoutAccess: false,
    userId: user._id.toString(),
    productId: resolvedProductId,
    productName,
    email: user.email,
    revokedCount: entries.length,
    stripeCanceled: stripeIds.length,
  };
}
