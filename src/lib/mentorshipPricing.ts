export type MentorshipBillingInterval = 'mensual' | 'anual' | 'trimestral';

/** Compromiso mínimo en planes mensual y trimestral (legacy). */
export const MENTORSHIP_MINIMUM_COMMITMENT_MONTHS = 3;

export type MentorshipPlanPrice = {
  interval: MentorshipBillingInterval;
  price: number;
  currency: string;
  opcionesPago?: Array<{
    proveedor: 'stripe' | 'dlocalgo';
    paymentLink?: string;
    activo?: boolean;
    monto?: number;
    moneda?: string;
    etiqueta?: string;
    descripcion?: string;
  }>;
};

export type MentorshipBudgetOption = {
  value: string;
  label: string;
  description: string;
  monthlyEquivalent: number | null;
  discountPercent: number;
};

/** Intervalo corto disponible: mensual si existe; si no, trimestral (legacy). */
export function resolveMentorshipShortInterval(
  prices: MentorshipPlanPrice[] | undefined,
): 'mensual' | 'trimestral' | null {
  if (!prices?.length) return null;
  if (prices.some((p) => p.interval === 'mensual')) return 'mensual';
  if (prices.some((p) => p.interval === 'trimestral')) return 'trimestral';
  return null;
}

export function resolveMentorshipToggleIntervals(
  prices: MentorshipPlanPrice[] | undefined,
): MentorshipBillingInterval[] {
  const short = resolveMentorshipShortInterval(prices);
  const toggles: MentorshipBillingInterval[] = [];
  if (short) toggles.push(short);
  if (prices?.some((p) => p.interval === 'anual')) toggles.push('anual');
  return toggles;
}

export function mentorshipPeriodMonths(interval: MentorshipBillingInterval): number {
  if (interval === 'mensual') return 1;
  if (interval === 'trimestral') return 3;
  return 12;
}

/** Meses de compromiso mínimo del plan (independiente del ciclo de cobro). */
export function mentorshipCommitmentMonths(interval: MentorshipBillingInterval): number {
  if (interval === 'anual') return 12;
  return MENTORSHIP_MINIMUM_COMMITMENT_MONTHS;
}

export function mentorshipCommitmentSummary(interval: MentorshipBillingInterval): string {
  const months = mentorshipCommitmentMonths(interval);
  if (interval === 'mensual') {
    return `Abonás mes a mes · compromiso mínimo de ${months} meses`;
  }
  if (interval === 'trimestral') {
    return `Compromiso mínimo de ${months} meses · cobro cada ${months} meses`;
  }
  return 'Compromiso de 12 meses';
}

export function mentorshipMonthlyEquivalent(
  periodPrice: number,
  interval: MentorshipBillingInterval,
): number {
  return Math.round(periodPrice / mentorshipPeriodMonths(interval));
}

export function mentorshipAnnualCostAtShortInterval(
  shortPeriodPrice: number,
  shortInterval: 'mensual' | 'trimestral',
): number {
  return shortInterval === 'mensual' ? shortPeriodPrice * 12 : shortPeriodPrice * 4;
}

export function mentorshipAnnualSavings(
  shortPeriodPrice: number,
  anualPeriodPrice: number,
  shortInterval: 'mensual' | 'trimestral',
): number {
  return Math.max(
    0,
    mentorshipAnnualCostAtShortInterval(shortPeriodPrice, shortInterval) - anualPeriodPrice,
  );
}

export function mentorshipMonthlyDiscountPercent(
  shortPeriodPrice: number,
  anualPeriodPrice: number,
  shortInterval: 'mensual' | 'trimestral',
): number {
  const monthlyShort = mentorshipMonthlyEquivalent(shortPeriodPrice, shortInterval);
  const monthlyA = mentorshipMonthlyEquivalent(anualPeriodPrice, 'anual');
  if (monthlyShort <= 0 || monthlyA >= monthlyShort) return 0;
  return Math.round((1 - monthlyA / monthlyShort) * 100);
}

export function mentorshipCurrencySymbol(currency: string): string {
  const c = String(currency ?? 'USD').toUpperCase();
  return c === 'USD' ? 'U$S' : c;
}

export function formatMentorshipAmount(amount: number): string {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(amount));
}

export function mentorshipIntervalLabel(interval: MentorshipBillingInterval): string {
  if (interval === 'mensual') return 'mensual';
  if (interval === 'trimestral') return 'trimestral';
  return 'anual';
}

export function mentorshipBillingShortLabel(
  periodPrice: number,
  currency: string,
  interval: MentorshipBillingInterval,
): string {
  const sym = mentorshipCurrencySymbol(currency);
  const amount = formatMentorshipAmount(periodPrice);
  if (interval === 'mensual') return `${sym} ${amount}/mes`;
  if (interval === 'trimestral') return `${sym} ${amount} cada 3 meses`;
  return `${sym} ${amount} al año`;
}

export function buildMentorshipBudgetOptions(
  prices: MentorshipPlanPrice[] | undefined,
): MentorshipBudgetOption[] {
  const shortInterval = resolveMentorshipShortInterval(prices);
  const shortPrice = shortInterval
    ? prices?.find((p) => p.interval === shortInterval)
    : undefined;
  const anual = prices?.find((p) => p.interval === 'anual');

  const sym = mentorshipCurrencySymbol(
    shortPrice?.currency ?? anual?.currency ?? 'USD',
  );

  const monthlyShort = shortPrice
    ? mentorshipMonthlyEquivalent(shortPrice.price, shortPrice.interval)
    : null;
  const monthlyAnual = anual
    ? mentorshipMonthlyEquivalent(anual.price, 'anual')
    : null;

  const discountPercent =
    shortPrice && anual && shortInterval
      ? mentorshipMonthlyDiscountPercent(shortPrice.price, anual.price, shortInterval)
      : 0;

  const options: MentorshipBudgetOption[] = [];

  if (shortPrice && shortInterval) {
    options.push({
      value: `Mentoría — ciclo ${shortInterval} — ${sym} ${shortPrice.price}`,
      label:
        shortInterval === 'mensual'
          ? `Mentoría · plan mensual (${sym} ${formatMentorshipAmount(shortPrice.price)}/mes)`
          : `Mentoría · ciclo trimestral (${sym} ${formatMentorshipAmount(shortPrice.price)} cada 3 meses)`,
      description:
        shortInterval === 'mensual'
          ? `Abonás mes a mes · compromiso mínimo de ${MENTORSHIP_MINIMUM_COMMITMENT_MONTHS} meses · pagable en cuotas.`
          : `Equivale a ~${sym} ${monthlyShort}/mes · compromiso mínimo de ${MENTORSHIP_MINIMUM_COMMITMENT_MONTHS} meses · pagable en cuotas.`,
      monthlyEquivalent: monthlyShort,
      discountPercent: 0,
    });
  }

  if (anual) {
    options.push({
      value: `Mentoría — ciclo anual — ${sym} ${anual.price}`,
      label: `Mentoría · plan anual (${sym} ${formatMentorshipAmount(anual.price)} al año)`,
      description: `Equivale a ~${sym} ${monthlyAnual}/mes · compromiso de 12 meses${
        discountPercent > 0 ? ' · ahorrás respecto al plan mensual' : ''
      }.`,
      monthlyEquivalent: monthlyAnual,
      discountPercent,
    });
  }

  return options;
}
