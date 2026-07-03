import type Stripe from 'stripe';
import connectDB from '../config/connectDB';
import Product from '../models/productModel';
import { stripe } from '../app/api/payments/stripe/stripeConfig';
import { fulfillCoursePurchase } from '../app/api/payments/course/fulfillCoursePurchase';
import { coursePaymentDebug, coursePaymentWarn } from './coursePaymentDebug';

export async function resolveStripeCheckoutProductId(
  session: Stripe.Checkout.Session
): Promise<string | null> {
  if (session.metadata?.productId) {
    return String(session.metadata.productId);
  }

  if (session.payment_link) {
    try {
      const paymentLinkId =
        typeof session.payment_link === 'string'
          ? session.payment_link
          : session.payment_link.id;
      const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId);
      if (paymentLink.metadata?.productId) {
        return String(paymentLink.metadata.productId);
      }
    } catch (error) {
      coursePaymentWarn('stripe_checkout.payment_link_lookup_failed', { error });
    }
  }

  if (session.payment_intent) {
    try {
      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent.id;
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.metadata?.productId) {
        return String(paymentIntent.metadata.productId);
      }
    } catch (error) {
      coursePaymentWarn('stripe_checkout.payment_intent_lookup_failed', { error });
    }
  }

  return null;
}

export async function handleStripeCourseCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<{ fulfilled: boolean; productId?: string }> {
  if (session.payment_status && session.payment_status !== 'paid') {
    return { fulfilled: false };
  }

  const productId = await resolveStripeCheckoutProductId(session);
  const customerEmail = session.customer_details?.email?.trim();

  if (!productId || !customerEmail) {
    coursePaymentWarn('stripe_checkout.missing_product_or_email', {
      productId,
      hasEmail: Boolean(customerEmail),
      sessionId: session.id,
    });
    return { fulfilled: false };
  }

  await connectDB();

  const product = await Product.findById(productId).lean();
  if (!product || product.tipo !== 'curso') {
    return { fulfilled: false, productId };
  }

  const result = await fulfillCoursePurchase({
    productId: product._id.toString(),
    provider: 'stripe',
    transactionId: String(session.payment_intent || session.id),
    email: customerEmail,
    amount: session.amount_total != null ? session.amount_total / 100 : undefined,
    moneda: session.currency?.toUpperCase(),
  });

  coursePaymentDebug('stripe_checkout.course_fulfilled', {
    productId: product._id.toString(),
    sessionId: session.id,
    alreadyProcessed: result.alreadyProcessed,
    userId: result.userId,
  });

  return { fulfilled: true, productId: product._id.toString() };
}
