import { stripe } from '../app/api/payments/stripe/stripeConfig';
import {
  CUERPO_AUTONOMO_DISCOUNT_CODE_ANUAL,
  CUERPO_AUTONOMO_DISCOUNT_CODE_SHORT,
  CUERPO_AUTONOMO_DISCOUNT_PERCENT_ANUAL,
  CUERPO_AUTONOMO_DISCOUNT_PERCENT_SHORT,
} from '../constants/mentorshipCuerpoAutonomoDiscount';
import type { MentorshipBillingInterval } from './mentorshipPricing';

export type MentorshipCuerpoAutonomoDiscount = {
  activo: boolean;
  porcentajeCorto: number;
  porcentajeAnual: number;
  codigoCorto: string;
  codigoAnual: string;
  stripeCouponIdCorto?: string;
  stripePromotionCodeIdCorto?: string;
  stripeCouponIdAnual?: string;
  stripePromotionCodeIdAnual?: string;
};

async function findOrCreateCoupon(percent: number, name: string): Promise<string> {
  const existing = await stripe.coupons.list({ limit: 100 });
  const match = existing.data.find(
    (c) =>
      c.valid &&
      c.percent_off === percent &&
      c.duration === 'forever' &&
      (c.name === name || c.name?.includes(name)),
  );
  if (match) return match.id;

  const coupon = await stripe.coupons.create({
    percent_off: percent,
    duration: 'forever',
    name,
  });
  return coupon.id;
}

async function findOrCreatePromotionCode(
  code: string,
  couponId: string,
): Promise<string> {
  const existing = await stripe.promotionCodes.list({ code, limit: 1 });
  if (existing.data[0]) {
    const promo = existing.data[0];
    if (promo.active) return promo.id;
  }

  try {
    const promo = await stripe.promotionCodes.create({
      code,
      coupon: couponId,
      active: true,
    });
    return promo.id;
  } catch (error: unknown) {
    // Carrera / código ya existente: re-listar
    const retry = await stripe.promotionCodes.list({ code, limit: 1 });
    if (retry.data[0]) return retry.data[0].id;
    throw error;
  }
}

/**
 * Crea (o reusa) cupones Stripe 15% corto / 25% anual + promotion codes.
 * Idempotente: seguro llamar al crear o backfillear planes.
 */
export async function ensureMentorshipCuerpoAutonomoDiscount(
  existing?: Partial<MentorshipCuerpoAutonomoDiscount> | null,
): Promise<MentorshipCuerpoAutonomoDiscount> {
  const porcentajeCorto =
    existing?.porcentajeCorto ?? CUERPO_AUTONOMO_DISCOUNT_PERCENT_SHORT;
  const porcentajeAnual =
    existing?.porcentajeAnual ?? CUERPO_AUTONOMO_DISCOUNT_PERCENT_ANUAL;
  const codigoCorto = (
    existing?.codigoCorto || CUERPO_AUTONOMO_DISCOUNT_CODE_SHORT
  ).toUpperCase();
  const codigoAnual = (
    existing?.codigoAnual || CUERPO_AUTONOMO_DISCOUNT_CODE_ANUAL
  ).toUpperCase();

  let stripeCouponIdCorto = existing?.stripeCouponIdCorto;
  let stripePromotionCodeIdCorto = existing?.stripePromotionCodeIdCorto;
  let stripeCouponIdAnual = existing?.stripeCouponIdAnual;
  let stripePromotionCodeIdAnual = existing?.stripePromotionCodeIdAnual;

  if (!stripeCouponIdCorto) {
    stripeCouponIdCorto = await findOrCreateCoupon(
      porcentajeCorto,
      `Mentoría · Cuerpo Autónomo ${porcentajeCorto}%`,
    );
  }
  if (!stripePromotionCodeIdCorto) {
    stripePromotionCodeIdCorto = await findOrCreatePromotionCode(
      codigoCorto,
      stripeCouponIdCorto,
    );
  }

  if (!stripeCouponIdAnual) {
    stripeCouponIdAnual = await findOrCreateCoupon(
      porcentajeAnual,
      `Mentoría · Cuerpo Autónomo anual ${porcentajeAnual}%`,
    );
  }
  if (!stripePromotionCodeIdAnual) {
    stripePromotionCodeIdAnual = await findOrCreatePromotionCode(
      codigoAnual,
      stripeCouponIdAnual,
    );
  }

  return {
    activo: existing?.activo !== false,
    porcentajeCorto,
    porcentajeAnual,
    codigoCorto,
    codigoAnual,
    stripeCouponIdCorto,
    stripePromotionCodeIdCorto,
    stripeCouponIdAnual,
    stripePromotionCodeIdAnual,
  };
}

export function resolveCuerpoAutonomoDiscountFromPlan(
  discount: MentorshipCuerpoAutonomoDiscount | null | undefined,
  interval: MentorshipBillingInterval,
): {
  percent: number;
  code: string;
  stripeCouponId?: string;
} | null {
  if (!discount || discount.activo === false) return null;
  if (interval === 'anual') {
    return {
      percent: discount.porcentajeAnual,
      code: discount.codigoAnual,
      stripeCouponId: discount.stripeCouponIdAnual,
    };
  }
  return {
    percent: discount.porcentajeCorto,
    code: discount.codigoCorto,
    stripeCouponId: discount.stripeCouponIdCorto,
  };
}
