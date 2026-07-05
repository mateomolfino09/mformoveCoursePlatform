/** Tokens compartidos landing mentoría / curso (tipografía, layout, CTAs). */

export const landingSectionContainer =
  'mx-auto w-[92%] max-w-6xl px-3 sm:px-4';

export const landingSectionShell =
  'border-t border-palette-stone/20 bg-palette-cream py-16 font-montserrat md:py-24';

export const landingEyebrow =
  'text-[11px] font-semibold uppercase tracking-[0.26em] text-palette-ink';

export const landingEyebrowDark =
  'text-[11px] font-semibold uppercase tracking-[0.26em] text-palette-cream/55';

export const landingSectionTitle =
  'mt-3 text-[1.85rem] font-bold leading-[1.1] tracking-tight text-palette-ink md:text-[2.25rem] md:leading-[1.08] lg:text-[2.5rem]';

export const landingSectionTitleDark =
  'mt-3 text-[1.85rem] font-bold leading-[1.1] tracking-tight text-palette-cream md:text-[2.25rem] md:leading-[1.08] lg:text-[2.5rem]';

export const landingSectionBody =
  'mt-5 text-[15px] font-normal leading-[1.72] text-palette-ink md:text-[16px]';

export const landingSectionBodyMuted =
  'mt-4 text-[14px] font-light leading-[1.65] text-palette-stone md:text-[15px]';

export const landingHeaderBlock = 'mb-9 max-w-3xl md:mb-11';

export const landingFadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] as const },
  viewport: { once: true, margin: '-36px' },
};

export const landingCtaPrimary =
  'group inline-flex items-center justify-center gap-2 rounded-full border-2 border-palette-ink bg-palette-ink px-7 py-3 font-montserrat text-sm font-semibold uppercase tracking-[0.2em] text-palette-cream transition-all duration-200 hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink';

export const landingCtaInverted =
  'group inline-flex items-center justify-between gap-4 rounded-full border-2 border-palette-cream/80 bg-palette-cream px-7 py-3 font-montserrat text-sm font-semibold uppercase tracking-[0.2em] text-palette-ink transition-all duration-200 hover:border-white hover:bg-white';

export const landingPlanCard =
  'rounded-2xl border border-palette-stone/25 bg-white/70 shadow-[0_20px_50px_-24px_rgba(20,20,17,0.16)] backdrop-blur-[2px] md:rounded-3xl';

export const landingPlanCardSide =
  'rounded-2xl border border-palette-stone/25 bg-white/60 shadow-[0_14px_40px_-22px_rgba(20,20,17,0.14)] backdrop-blur-[2px] md:rounded-3xl';

export const landingFaqContainer =
  'w-full max-w-3xl divide-y divide-palette-stone/16 rounded-2xl border border-palette-stone/18 bg-white/40 text-left';
