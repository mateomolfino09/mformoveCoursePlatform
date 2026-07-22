'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { CldImage } from 'next-cloudinary';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { MentorshipPlan, PlanPrice } from '../../../types/mentorship';
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
import { MENTORSHIP_START_CTA } from '../../../constants/mentorshipCta';
import type { LinkInBioProductCard } from '../../../lib/linkInBioProducts';
import {
  buildMentorshipAnualBonusItems,
  MENTORSHIP_ANUAL_INCLUDES,
  MENTORSHIP_TRIMESTRAL_INCLUDES,
} from '../../../constants/mentorshipIncludes';
import CourseDarkSectionBackground from '../Course/CourseDarkSectionBackground';

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
      className={`group relative isolate mx-auto flex w-full max-w-[17.5rem] min-w-0 flex-col overflow-hidden rounded-2xl border bg-white/70 p-4 shadow-[0_20px_50px_-24px_rgba(20,20,17,0.16)] transition-all duration-300 hover:-translate-y-0.5 md:max-w-none md:rounded-3xl md:p-4 ${
        interval === 'anual'
          ? 'border-palette-sage/50 shadow-[0_28px_64px_-28px_rgba(20,20,17,0.28)] ring-1 ring-palette-sage/30 hover:border-palette-sage hover:shadow-[0_32px_72px_-28px_rgba(20,20,17,0.32)]'
          : 'border-palette-stone/25 hover:border-palette-sage/40 hover:shadow-[0_28px_60px_-28px_rgba(20,20,17,0.2)]'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-sage/35 to-transparent opacity-90" />
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-palette-sage/20 blur-3xl opacity-60" />
        {interval === 'anual' ? (
          <div className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-palette-ink/10 blur-3xl" />
        ) : null}
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
        : 'Doce meses para transformar el movimiento en un hábito y construir una práctica que dure toda la vida.';

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
        src="/images/logos/tarjetasmpstripe2.png"
        alt="Pagos con Mercado Pago y Stripe."
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

function formatGiftListPrice(price: number, currency: string | null | undefined): string {
  const code = (currency || 'USD').toUpperCase();
  const sym = code === 'USD' ? 'U$S' : mentorshipCurrencySymbol(code);
  return `${sym} ${formatMentorshipAmount(price)}`;
}

/** Trimestral: base de la mentoría. */
const TRIMESTRAL_INCLUDES_ITEMS = MENTORSHIP_TRIMESTRAL_INCLUDES;

type IncludesVariant = 'anual' | 'trimestral';
type IncludesAccordionId = 'incluye' | 'para-vos' | 'resultado';

const INCLUDES_BLOCK_BG = 'my_uploads/plaza/DSC03350_vgjrrh';

const IncludesCheckItem = ({
  children,
  delay = 0,
  highlight = false,
}: {
  children: React.ReactNode;
  delay?: number;
  highlight?: boolean;
}) => (
  <motion.li
    initial={highlight ? { opacity: 0, y: 12 } : false}
    animate={highlight ? { opacity: 1, y: 0 } : undefined}
    transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    className="flex items-start gap-3 text-left"
  >
    <span
      aria-hidden
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-montserrat text-xs font-bold md:h-6 md:w-6 md:text-[13px] ${
        highlight
          ? 'bg-palette-sage/40 text-palette-sage shadow-[0_0_0_1px_rgba(166,184,154,0.55)]'
          : 'bg-palette-sage/20 text-palette-sage'
      }`}
    >
      ✓
    </span>
    <span
      className={`font-raleway text-base font-light leading-snug md:text-lg ${
        highlight ? 'font-medium text-palette-cream' : 'text-palette-cream/90'
      }`}
    >
      {children}
    </span>
  </motion.li>
);

const MentorshipIncludesAccordion = ({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: IncludesAccordionId;
  title: string;
  open: boolean;
  onToggle: (id: IncludesAccordionId) => void;
  children: React.ReactNode;
}) => (
  <div className="border-b border-palette-cream/10">
    <button
      type="button"
      onClick={() => onToggle(id)}
      aria-expanded={open}
      className="flex w-full items-center gap-3 py-4 text-left transition-colors hover:bg-palette-cream/[0.04] md:py-5"
    >
      <span className="min-w-0 flex-1 font-montserrat text-base font-semibold tracking-tight text-palette-cream md:text-xl">
        {title}
      </span>
      <ChevronDownIcon
        className={`h-5 w-5 shrink-0 text-palette-sage/80 transition-transform duration-200 md:h-6 md:w-6 ${
          open ? 'rotate-180' : ''
        }`}
      />
    </button>
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="overflow-visible pb-5 pl-1 pt-0 md:pb-6 md:pl-1.5">{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  </div>
);

const MentorshipIncludesBlock = ({ variant }: { variant: IncludesVariant }) => {
  const [products, setProducts] = useState<LinkInBioProductCard[]>([]);
  const [loading, setLoading] = useState(variant === 'anual');
  const [openId, setOpenId] = useState<IncludesAccordionId | null>('incluye');
  const showGifts = variant === 'anual';

  useEffect(() => {
    setOpenId('incluye');
  }, [variant]);

  useEffect(() => {
    if (!showGifts) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch('/api/link-in-bio/products', { cache: 'no-store' });
        const data = (await res.json()) as { products?: LinkInBioProductCard[] };
        if (cancelled) return;
        const list = Array.isArray(data.products) ? data.products : [];
        setProducts(list.filter((p) => p.tipo !== 'mentoria'));
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showGifts]);

  const toggle = (id: IncludesAccordionId) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const isAnual = variant === 'anual';

  const courseNames = products
    .filter((p) => p.tipo === 'curso' || p.tipo === 'programa_transformacional' || p.tipo === 'bundle')
    .map((p) => p.title.trim())
    .filter(Boolean);
  const namesForAccess =
    courseNames.length > 0 ? courseNames : products.map((p) => p.title.trim()).filter(Boolean);
  const anualBonusItems = buildMentorshipAnualBonusItems(namesForAccess);

  const paraVosCopy =
    'Querés dejar de improvisar y tener un plan claro, alguien que te acompañe y te ayude a avanzar paso a paso.';

  const resultadoCopy =
    'Entrenás con dirección, entendés por qué hacés cada cosa y construís una práctica que podés sostener durante años.';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={variant}
        id="mentorship-includes-block"
        initial={
          isAnual
            ? { opacity: 0, y: 40, scale: 0.92 }
            : { opacity: 0, y: 18 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={
          isAnual
            ? { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
            : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
        }
        className={`relative isolate mt-10 scroll-mt-28 overflow-hidden rounded-[1.75rem] border text-palette-cream md:mt-12 md:scroll-mt-32 md:rounded-[2rem] ${
          isAnual
            ? 'border-palette-sage/30 bg-palette-ink shadow-[0_40px_100px_-36px_rgba(20,20,17,0.7),0_0_0_1px_rgba(166,184,154,0.2)]'
            : 'border-palette-ink/15 bg-palette-ink shadow-[0_32px_80px_-36px_rgba(20,20,17,0.55)]'
        }`}
      >
        {isAnual ? <div className="mentorship-silver-border" aria-hidden /> : null}

        {isAnual ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2]"
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-palette-sage/35 via-palette-sage/10 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-sage to-transparent" />
          </motion.div>
        ) : null}

        <CourseDarkSectionBackground />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[min(55%,22rem)] opacity-[0.18]"
        style={{
          WebkitMaskImage: 'linear-gradient(to top, black 35%, transparent 100%)',
          maskImage: 'linear-gradient(to top, black 35%, transparent 100%)',
        }}
      >
        <CldImage
          src={INCLUDES_BLOCK_BG}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 672px"
          className="object-cover object-[center_70%]"
          loader={imageLoader}
          preserveTransformations
        />
      </div>

      <div className="relative z-20 mx-auto max-w-2xl px-5 py-8 md:px-10 md:py-10">
        <motion.p
          initial={isAnual ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isAnual ? 0.15 : 0, duration: 0.4 }}
          className="mb-1 font-montserrat text-xs font-semibold uppercase tracking-[0.22em] text-palette-sage md:text-[13px]"
        >
          {isAnual ? 'Anual' : 'Trimestral'}
        </motion.p>
        <motion.p
          initial={isAnual ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isAnual ? 0.22 : 0, duration: 0.45 }}
          className="mb-4 font-raleway text-base font-light leading-snug text-palette-cream/65 md:mb-5 md:text-lg"
        >
          {isAnual
            ? 'Doce meses para transformar el movimiento en un hábito y construir una práctica que dure toda la vida.'
            : 'Aprendés con el programa y la comunidad.'}
        </motion.p>

        <MentorshipIncludesAccordion
          id="incluye"
          title="Qué incluye"
          open={openId === 'incluye'}
          onToggle={toggle}
        >
          {isAnual ? (
            <div className="space-y-5 md:space-y-6">
              <ul className="space-y-3 md:space-y-3.5">
                {MENTORSHIP_ANUAL_INCLUDES.map((item, index) => (
                  <IncludesCheckItem key={item} highlight delay={0.28 + index * 0.04}>
                    {item}
                  </IncludesCheckItem>
                ))}
              </ul>
              <div>
                <motion.p
                  initial={{ opacity: 0, letterSpacing: '0.35em' }}
                  animate={{ opacity: 1, letterSpacing: '0.22em' }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mb-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.22em] text-palette-sage md:text-xs"
                >
                  Además
                </motion.p>
                <ul className="space-y-3 md:space-y-3.5">
                  {anualBonusItems.map((item, index) => (
                    <IncludesCheckItem key={item} highlight delay={0.6 + index * 0.1}>
                      {item}
                    </IncludesCheckItem>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <ul className="space-y-3 md:space-y-3.5">
              {TRIMESTRAL_INCLUDES_ITEMS.map((item) => (
                <IncludesCheckItem key={item}>{item}</IncludesCheckItem>
              ))}
            </ul>
          )}
        </MentorshipIncludesAccordion>

        <MentorshipIncludesAccordion
          id="para-vos"
          title="Para vos si"
          open={openId === 'para-vos'}
          onToggle={toggle}
        >
          <p className="font-raleway text-base font-light leading-relaxed text-palette-cream/85 md:text-lg">
            {paraVosCopy}
          </p>
        </MentorshipIncludesAccordion>

        <MentorshipIncludesAccordion
          id="resultado"
          title="Resultado"
          open={openId === 'resultado'}
          onToggle={toggle}
        >
          <p className="font-raleway text-base font-light leading-relaxed text-palette-cream/85 md:text-lg">
            {resultadoCopy}
          </p>
        </MentorshipIncludesAccordion>

        {showGifts ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 pt-2 md:mt-4 md:pt-4"
          >
            {loading ? (
              <div className="flex justify-center py-6">
                <MiniLoadingSpinner />
              </div>
            ) : products.length === 0 ? null : (
              <ul className="divide-y divide-palette-cream/10">
                {products.map((product, index) => {
                  const hasPrice =
                    typeof product.price === 'number' &&
                    Number.isFinite(product.price) &&
                    product.price > 0;

                  return (
                    <motion.li
                      key={product.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.78 + index * 0.06,
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 md:gap-4 md:py-4"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-palette-cream/10 md:h-[4.5rem] md:w-[4.5rem]">
                        <CldImage
                          src={product.imageSrc}
                          alt={product.title}
                          fill
                          sizes="72px"
                          className="object-cover object-center"
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate font-montserrat text-base font-semibold text-palette-cream md:text-lg">
                          {product.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          {hasPrice ? (
                            <span className="font-raleway text-sm text-palette-cream/45 line-through md:text-base">
                              {formatGiftListPrice(product.price!, product.currency)}
                            </span>
                          ) : null}
                          <span className="font-montserrat text-sm font-semibold uppercase tracking-[0.12em] text-palette-stone md:text-base">
                            Ahora U$S 0
                          </span>
        
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        ) : null}
      </div>
      </motion.div>
    </AnimatePresence>
  );
};

const PremiumMentorshipCards = ({
  plans,
  interval,
  onPlanSelect,
  loadingPlanId,
  setInterval: setIntervalProp,
}: PremiumMentorshipCardsProps) => {
  const plan = plans && plans.length > 0 ? plans[0] : null;
  const prevIntervalRef = useRef(interval);

  useEffect(() => {
    const prev = prevIntervalRef.current;
    prevIntervalRef.current = interval;
    if (interval !== 'anual' || prev === 'anual') return;

    const timer = window.setTimeout(() => {
      document
        .getElementById('mentorship-includes-block')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 280);

    return () => window.clearTimeout(timer);
  }, [interval]);

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
          className="mb-8 mt-2 flex justify-center md:mb-10"
        >
          <div className="relative flex justify-center">
            <div className="relative isolate flex gap-2.5 rounded-full  p-1">
              {availableIntervals.map((item) => {
                const isActive = interval === item;
                const isAnualHint = item === 'anual' && !isActive;

                return (
                  <button
                    key={item}
                    type="button"
                    className={`relative z-10 rounded-full px-7 py-2.5 font-montserrat text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-palette-ink text-palette-cream shadow-md'
                        : isAnualHint
                          ? 'mentorship-anual-hint bg-[#f2f2f2] text-palette-ink shadow-[0_6px_18px_-8px_rgba(20,20,17,0.35)] hover:bg-[#d0d3a7]'
                          : 'font-medium text-palette-stone hover:bg-white/80 hover:text-palette-ink'
                    }`}
                    onClick={() => setIntervalProp(item)}
                  >
                    {item === 'mensual' ? 'Mensual' : item === 'trimestral' ? 'Trimestral' : 'Anual'}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={interval}
          initial={
            interval === 'anual'
              ? { opacity: 0, y: 32, scale: 0.94 }
              : { opacity: 0, y: 14, scale: 0.98 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{
            duration: interval === 'anual' ? 0.65 : 0.35,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-6 lg:gap-7 ${
            interval === 'anual' ? 'relative' : ''
          }`}
        >
          {interval === 'anual' ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem]"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-palette-sage/25 via-palette-sage/8 to-transparent blur-2xl" />
            </motion.div>
          ) : null}

          <motion.div
            initial={interval === 'anual' ? { opacity: 0, y: 24, x: -12 } : false}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: interval === 'anual' ? 0.12 : 0, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 flex h-auto min-h-0 items-start md:order-1 md:col-span-4 md:h-full md:items-stretch md:pt-10 md:[transform:translateZ(-80px)_rotateY(9deg)]"
          >
            <div className="h-auto w-full md:h-full md:min-h-0 md:translate-x-5 md:scale-[0.96] md:opacity-90">
              <MentorshipCommitmentCard interval={interval} />
            </div>
          </motion.div>

          <motion.div
            initial={interval === 'anual' ? { opacity: 0, y: 28, scale: 0.92 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: interval === 'anual' ? 0.2 : 0, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 flex h-full min-h-0 justify-center md:order-2 md:col-span-4 md:justify-stretch md:[transform:translateZ(60px)]"
          >
            <MentorshipMainPlanCard
              periodPrice={priceObj.price}
              currency={priceObj.currency}
              interval={interval}
              index={0}
              plan={plan}
              onPlanSelect={onPlanSelect}
              loadingPlanId={loadingPlanId}
            />
          </motion.div>

          <motion.div
            initial={interval === 'anual' ? { opacity: 0, y: 24, x: 12 } : false}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: interval === 'anual' ? 0.28 : 0, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="order-3 flex h-full min-h-0 md:order-3 md:col-span-4 md:pt-10 md:[transform:translateZ(-80px)_rotateY(-9deg)]"
          >
            <div className="h-full min-h-0 w-full md:-translate-x-5 md:scale-[0.96] md:opacity-90">
              <MentorshipPaymentsCard />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {interval === 'anual' || interval === 'trimestral' ? (
        <MentorshipIncludesBlock variant={interval === 'anual' ? 'anual' : 'trimestral'} />
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="mx-auto mt-12 max-w-3xl border-t border-palette-stone/20 pt-10 text-center md:mt-14 md:pt-12"
      >
      {savingsAmount !== null && savingsAmount > 0 ? (
          <p className="mx-auto mt-2 max-w-xl text-[14px] font-light leading-[1.6] text-palette-stone md:text-[15px]">
            Con el plan anual ahorrás{' '}
            <span className="font-medium text-palette-ink">
              {currencySym} {formatMentorshipAmount(savingsAmount)}
            </span>{' '}
            al año
          </p>
        ) : null}

        <h3 className="mt-3 text-[1.35rem] font-semibold leading-tight tracking-tight text-palette-ink md:text-[1.65rem]">
          {interval === 'anual'
            ? 'Sostené una práctica a largo plazo'
            : interval === 'mensual'
              ? 'Formas de pago'
              : 'Formas de pago'}
        </h3>

  
        <div className="mx-auto mt-8 max-w-2xl space-y-3 md:mt-10">
  ¡
          <p className="text-sm font-light leading-relaxed text-palette-stone md:text-[15px]">
            Pagás con tarjeta local o internacional mediante Stripe.
          </p>
          <p className="text-sm font-light leading-relaxed text-palette-stone md:text-[15px]">
            En el plan trimestral abonás cada 3 meses. El plan anual se cobra una vez al año (con
            descuento). Podés financiarlo en cuotas según las condiciones de tu banco o emisor.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumMentorshipCards;
