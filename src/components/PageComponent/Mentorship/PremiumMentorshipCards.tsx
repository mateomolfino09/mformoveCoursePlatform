'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MentorshipPlan } from '../../../types/mentorship';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import imageLoader from '../../../../imageLoader';
import {
  formatMentorshipAmount,
  mentorshipAnnualSavings,
  mentorshipBillingShortLabel,
  mentorshipCommitmentMonths,
  mentorshipCommitmentSummary,
  mentorshipCurrencySymbol,
  mentorshipMonthlyEquivalent,
  resolveMentorshipShortInterval,
  resolveMentorshipToggleIntervals,
  type MentorshipBillingInterval,
} from '../../../lib/mentorshipPricing';
import { PlanPrice } from '../../../types/mentorship';
import { MENTORSHIP_START_CTA } from '../../../constants/mentorshipCta';

interface PremiumMentorshipCardsProps {
  plans: MentorshipPlan[];
  interval: MentorshipBillingInterval;
  onPlanSelect: (plan: MentorshipPlan) => void;
  loadingPlanId: string | null;
  setInterval?: (interval: MentorshipBillingInterval) => void;
}

const MentorshipMainPlanCard = ({
  periodPrice,
  currency,
  interval,
  index,
  plan,
  onPlanSelect,
  loadingPlanId,
}: {
  periodPrice: number;
  currency: string;
  interval: MentorshipBillingInterval;
  index: number;
  plan: MentorshipPlan;
  onPlanSelect: (plan: MentorshipPlan) => void;
  loadingPlanId: string | null;
}) => {
  const currencyLabel = currency === 'USD' ? 'USD' : currency;
  const monthlyEquivalent = mentorshipMonthlyEquivalent(periodPrice, interval);
  const billingLabel = mentorshipBillingShortLabel(periodPrice, currency, interval);
  const intervalCopy =
    interval === 'mensual' ? 'mensual' : interval === 'trimestral' ? 'trimestral' : 'anual';

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="group relative isolate mx-auto flex w-full max-w-[17.5rem] min-w-0 flex-col overflow-hidden rounded-2xl border border-palette-stone/25 bg-white/70 p-4 shadow-[0_20px_50px_-24px_rgba(20,20,17,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:border-palette-sage/40 hover:shadow-[0_28px_60px_-28px_rgba(20,20,17,0.2)] md:max-w-none md:rounded-3xl md:p-4"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-sage/35 to-transparent opacity-90" />
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-palette-sage/20 blur-3xl opacity-60" />
      </div>

      <div className="relative z-30 shrink-0 text-center text-palette-ink">
        <h3 className="font-montserrat text-base font-semibold leading-tight tracking-tight text-palette-ink md:text-xl">
          <b>PRECIO</b>{' '}
          <span className="text-base md:text-xl">HOY</span>
        </h3>
        <p className="mt-1.5 font-montserrat text-[0.6rem] font-medium uppercase leading-snug tracking-[0.12em] text-palette-stone md:text-[0.65rem]">
          Ciclo {intervalCopy}
        </p>
      </div>

      <div className="relative z-20 flex items-center justify-center px-1 py-3 md:py-4">
        <div className="relative mx-auto w-fit">
          <p className="text-center font-montserrat text-[2.75rem] font-bold leading-none tracking-[-0.09em] text-palette-ink tabular-nums md:text-[3.5rem]">
            <b>{formatMentorshipAmount(monthlyEquivalent)}</b>
          </p>
          <span className="pointer-events-none absolute -bottom-2 right-0 font-montserrat text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-palette-ink">
            {currencyLabel}
          </span>
        </div>
      </div>

      <div className="relative z-30 shrink-0 space-y-1 text-center text-palette-ink">
        <p className="font-montserrat text-[10px] font-medium uppercase tracking-[0.24em] text-palette-stone md:text-[11px]">
          /mes{interval !== 'mensual' ? ' · equivalente' : ''}
        </p>
        <p className="font-montserrat text-[10px] font-medium normal-case tracking-[0.06em] text-palette-stone md:text-[11px]">
          {billingLabel}
        </p>
        {interval === 'mensual' ? (
          <p className="font-montserrat text-[10px] font-medium normal-case tracking-[0.04em] text-palette-stone md:text-[11px]">
            {mentorshipCommitmentSummary(interval)}
          </p>
        ) : null}
        <p className="font-montserrat text-[10px] font-medium uppercase tracking-[0.14em] text-palette-stone md:text-[11px]">
          Pagable en cuotas
        </p>
      </div>

      <div className="relative z-30 mt-3 shrink-0 border-t border-palette-ink/10 pt-3">
        <button
          type="button"
          onClick={() => onPlanSelect(plan)}
          disabled={loadingPlanId === plan._id || !plan.active}
          className="group flex w-full items-center justify-center gap-2 rounded-full border-2 border-palette-ink bg-palette-ink px-4 py-2.5 font-montserrat text-[10px] font-semibold uppercase tracking-[0.16em] text-palette-cream transition-all duration-200 hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink disabled:cursor-not-allowed disabled:opacity-50 md:px-5 md:py-3 md:text-[11px] md:tracking-[0.18em]"
        >
          {loadingPlanId === plan._id ? (
            <>
              <MiniLoadingSpinner />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <span>{MENTORSHIP_START_CTA.label}</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

const MentorshipCommitmentCard = ({ interval }: { interval: MentorshipBillingInterval }) => {
  const months = mentorshipCommitmentMonths(interval);
  const title =
    interval === 'mensual' ? 'MENSUAL' : interval === 'trimestral' ? 'MÍNIMO' : 'ANUAL';
  const commitmentCopy =
    interval === 'mensual'
      ? 'Abonás un mes a la vez'
      : interval === 'trimestral'
        ? 'Compromiso mínimo de 3 meses'
        : 'Compromiso de 12 meses';
  const subtitle =
    interval === 'mensual'
      ? 'Con un compromiso mínimo de 3 meses para construir una base sólida y observar cambios reales.'
      : interval === 'trimestral'
        ? 'Tiempo mínimo para construir una base sólida y observar cambios reales.'
        : 'Un año de acompañamiento para sostener la práctica en el tiempo.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="relative isolate flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-palette-stone/25 bg-white/60 px-4 py-4 text-center text-palette-ink shadow-[0_14px_40px_-22px_rgba(20,20,17,0.14)] backdrop-blur-[2px] md:flex md:h-full md:min-h-[17rem] md:rounded-3xl md:p-4"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-palette-stone/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-stone/30 to-transparent opacity-80" />
      </div>

      <div className="relative z-30 shrink-0 px-1 pt-1 md:px-5 md:pt-2">
        <h3 className="text-balance font-montserrat text-lg font-semibold leading-tight tracking-tight text-palette-ink sm:text-xl md:mt-3 md:text-[clamp(1.2rem,3.1vw,1.72rem)]">
          <b>COMPROMISO</b>
          <br />
          <span className="relative bottom-1 text-base text-palette-ink sm:text-lg md:bottom-2 md:text-2xl">
            {title}
          </span>
        </h3>
      </div>

      <div className="relative z-20 flex flex-1 flex-col items-center justify-center px-2 py-4 md:py-3">
        <p className="font-montserrat text-[3rem] font-bold leading-none tracking-[-0.08em] text-palette-ink tabular-nums md:text-[3.5rem]">
          {months}
        </p>
        <p className="mt-2 font-montserrat text-[11px] font-medium uppercase tracking-[0.22em] text-palette-stone md:text-xs">
          meses
        </p>
        <p className="mt-4 max-w-[14rem] font-raleway text-[12px] font-light leading-snug text-palette-ink/80 md:text-[13px]">
          {commitmentCopy}
        </p>
      </div>

      <div className="relative z-30 shrink-0 px-3 pb-1 md:px-5 md:pb-2">
        <p className="font-raleway text-[11px] font-light leading-snug text-palette-stone md:text-xs">{subtitle}</p>
      </div>
    </motion.div>
  );
};

const MentorshipPaymentsCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
    viewport={{ once: true }}
    className="relative isolate flex h-full min-h-[17rem] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-palette-stone/25 bg-white/60 p-4 text-center text-palette-ink shadow-[0_14px_40px_-22px_rgba(20,20,17,0.14)] backdrop-blur-[2px] md:min-h-[17rem] md:rounded-3xl md:p-4"
  >
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-palette-sage/15 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-sage/30 to-transparent opacity-80" />
    </div>

    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4 pt-[3.75rem] pb-[4.5rem] md:px-4 md:pt-16 md:pb-20">
      <Image
        src="/images/svg/pagodoble.png"
        alt="Cuotas con tarjeta local e internacional: dLocal y Stripe."
        width={640}
        height={400}
        sizes="(max-width: 768px) 90vw, 18rem"
        className="h-auto max-h-[10rem] w-full max-w-[min(100%,15rem)] object-contain drop-shadow-sm md:max-h-[11rem] md:max-w-[16rem]"
        loader={imageLoader}
      />
    </div>

    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-5 pt-2 text-center text-palette-ink md:px-5 md:pt-2">
      <h3 className="mt-5 text-balance font-montserrat text-[clamp(1.2rem,3.1vw,1.72rem)] font-semibold leading-tight tracking-tight text-palette-ink md:mt-5">
        <b>MÉTODO</b>
        <br /> <span className="relative bottom-2 text-xl text-palette-ink md:bottom-3 md:text-2xl">DE PAGO</span>
      </h3>
    </div>

    <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 px-5 pb-4 text-center text-palette-ink md:bottom-4 md:px-5 md:pb-4">
      <p className="font-raleway text-sm leading-snug text-palette-ink md:text-base">
        Hasta 12 cuotas · Uruguay y Latinoamérica
      </p>
    </div>
  </motion.div>
);

const PremiumMentorshipCards = ({
  plans,
  interval,
  onPlanSelect,
  loadingPlanId,
  setInterval: setIntervalProp,
}: PremiumMentorshipCardsProps) => {
  const plan = plans && plans.length > 0 ? plans[0] : null;

  if (!plan) {
    return (
      <div className="py-12 text-center">
        <p className="text-palette-stone">No hay planes disponibles en este momento.</p>
      </div>
    );
  }

  const availableIntervals = resolveMentorshipToggleIntervals(plan.prices);
  const shortInterval = resolveMentorshipShortInterval(plan.prices);
  const priceObj = plan.prices?.find((p: PlanPrice) => p.interval === interval);
  const shortPrice =
    shortInterval != null
      ? plan.prices?.find((p: PlanPrice) => p.interval === shortInterval)?.price ?? 0
      : 0;
  const anualPrice = plan.prices?.find((p: PlanPrice) => p.interval === 'anual')?.price ?? 0;

  const savingsAmount =
    interval === 'anual' && shortInterval && shortPrice > 0 && anualPrice > 0
      ? mentorshipAnnualSavings(shortPrice, anualPrice, shortInterval)
      : null;

  if (!priceObj) {
    return (
      <div className="py-12 text-center">
        <p className="text-palette-stone">No hay precios disponibles para este ciclo.</p>
      </div>
    );
  }

  const monthlyDisplay = mentorshipMonthlyEquivalent(priceObj.price, interval);
  const currencySym = mentorshipCurrencySymbol(priceObj.currency);
  const billingLabel = mentorshipBillingShortLabel(priceObj.price, priceObj.currency, interval);

  return (
    <div className="mx-auto max-w-6xl">
      {setIntervalProp && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="mb-8 flex justify-center md:mb-10"
        >
          <div className="flex rounded-full border border-palette-stone/25 bg-white/60 p-1 shadow-sm backdrop-blur">
            {availableIntervals.map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-full px-8 py-3 font-montserrat text-sm font-medium transition-all duration-200 ${
                  interval === item
                    ? 'bg-palette-ink text-palette-cream shadow-md'
                    : 'text-palette-stone hover:bg-white/80 hover:text-palette-ink'
                }`}
                onClick={() => setIntervalProp(item)}
              >
                {item === 'mensual' ? 'Mensual' : item === 'trimestral' ? 'Trimestral' : 'Anual'}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-6 lg:gap-7">
        <div className="order-2 flex h-auto min-h-0 items-start md:order-1 md:col-span-4 md:h-full md:items-stretch md:pt-10 md:[transform:translateZ(-80px)_rotateY(9deg)]">
          <div className="h-auto w-full md:h-full md:min-h-0 md:translate-x-5 md:scale-[0.96] md:opacity-90">
            <MentorshipCommitmentCard interval={interval} />
          </div>
        </div>

        <div className="order-1 flex h-full min-h-0 justify-center md:order-2 md:col-span-4 md:justify-stretch md:[transform:translateZ(60px)]">
          <MentorshipMainPlanCard
            periodPrice={priceObj.price}
            currency={priceObj.currency}
            interval={interval}
            index={0}
            plan={plan}
            onPlanSelect={onPlanSelect}
            loadingPlanId={loadingPlanId}
          />
        </div>

        <div className="order-3 flex h-full min-h-0 md:order-3 md:col-span-4 md:pt-10 md:[transform:translateZ(-80px)_rotateY(-9deg)]">
          <div className="h-full min-h-0 w-full md:-translate-x-5 md:scale-[0.96] md:opacity-90">
            <MentorshipPaymentsCard />
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="mx-auto mt-12 max-w-3xl border-t border-palette-stone/20 pt-10 text-center md:mt-14 md:pt-12"
      >

        <h3 className="mt-3 text-[1.35rem] font-semibold leading-tight tracking-tight text-palette-ink md:text-[1.65rem]">
          {interval === 'anual'
            ? 'Sostené una práctica a largo plazo'
            : interval === 'mensual'
              ? 'Empezá mes a mes · 3 meses mínimo'
              : 'Empezá tu proceso'}
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-[15px] font-light leading-[1.65] text-palette-ink/85 md:text-[16px]">
          <span className="font-semibold text-palette-ink">
            {currencySym} {formatMentorshipAmount(monthlyDisplay)}
            /mes{interval !== 'mensual' ? ' (equivalente)' : ''}
          </span>{' '}
          · {billingLabel}
          {interval === 'mensual' ? ' · compromiso mínimo de 3 meses' : ''} · seguimiento semanal, llamada mensual y acceso a la comunidad.
        </p>
        {savingsAmount !== null && savingsAmount > 0 ? (
          <p className="mx-auto mt-2 max-w-xl text-[14px] font-light leading-[1.6] text-palette-stone md:text-[15px]">
            Con el plan anual ahorrás{' '}
            <span className="font-medium text-palette-ink">
              {currencySym} {formatMentorshipAmount(savingsAmount)}
            </span>{' '}
            al año respecto al plan {shortInterval === 'mensual' ? 'mensual' : 'trimestral'}.
          </p>
        ) : null}

        <div className="mx-auto mt-8 max-w-2xl space-y-3 md:mt-10">
          <p className="font-montserrat text-[11px] font-semibold uppercase tracking-[0.14em] text-palette-stone">
            Formas de pago
          </p>
          <p className="text-sm font-light leading-relaxed text-palette-stone md:text-[15px]">
            Pagás con tarjeta local o internacional mediante Stripe.
          </p>
          <p className="text-sm font-light leading-relaxed text-palette-stone md:text-[15px]">
            En el plan mensual abonás mes a mes con un compromiso mínimo de 3 meses. El plan anual se cobra una vez al año. Podés financiarlo en cuotas según las condiciones de tu banco o emisor.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumMentorshipCards;
