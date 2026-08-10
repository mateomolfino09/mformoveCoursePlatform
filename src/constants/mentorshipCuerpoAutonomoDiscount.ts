import type { MentorshipBillingInterval } from '../lib/mentorshipPricing';

/** Slug del curso que habilita el descuento alumni en mentoría. */
export const CUERPO_AUTONOMO_COURSE_SLUG = 'cuerpo-autonomo';

/** Descuento ciclo corto (trimestral / mensual). */
export const CUERPO_AUTONOMO_DISCOUNT_PERCENT_SHORT = 15;
export const CUERPO_AUTONOMO_DISCOUNT_CODE_SHORT = 'CUERPOAUTONOMO';

/** Descuento plan anual. */
export const CUERPO_AUTONOMO_DISCOUNT_PERCENT_ANUAL = 25;
export const CUERPO_AUTONOMO_DISCOUNT_CODE_ANUAL = 'CUERPOAUTONOMO25';

export function resolveCuerpoAutonomoDiscountPercent(
  interval: MentorshipBillingInterval,
): number {
  return interval === 'anual'
    ? CUERPO_AUTONOMO_DISCOUNT_PERCENT_ANUAL
    : CUERPO_AUTONOMO_DISCOUNT_PERCENT_SHORT;
}

export function resolveCuerpoAutonomoDiscountCode(
  interval: MentorshipBillingInterval,
): string {
  return interval === 'anual'
    ? CUERPO_AUTONOMO_DISCOUNT_CODE_ANUAL
    : CUERPO_AUTONOMO_DISCOUNT_CODE_SHORT;
}

export function applyCuerpoAutonomoDiscount(
  price: number,
  interval: MentorshipBillingInterval,
): number {
  const percent = resolveCuerpoAutonomoDiscountPercent(interval);
  return Math.round(Number(price) * (1 - percent / 100) * 100) / 100;
}

/** Prefija el promotion code en un Stripe Payment Link (seguro para cliente). */
export function withStripePrefilledPromoCode(
  paymentLink: string,
  code: string,
): string {
  if (!paymentLink || !code) return paymentLink;
  try {
    const url = new URL(paymentLink);
    url.searchParams.set('prefilled_promo_code', code);
    return url.toString();
  } catch {
    const sep = paymentLink.includes('?') ? '&' : '?';
    return `${paymentLink}${sep}prefilled_promo_code=${encodeURIComponent(code)}`;
  }
}
