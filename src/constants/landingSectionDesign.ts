/** Tokens compartidos landing mentoría / curso (tipografía, layout, CTAs). */

export const landingSectionContainer =
  'mx-auto w-[92%] max-w-6xl px-3 sm:px-4';

/** Fila texto + imagen (intro/outcomes): sin justify-evenly para alinear bordes entre secciones. */
export const landingSplitSectionLayout =
  'mx-auto flex w-[92%] max-w-6xl flex-col gap-10 px-3 py-12 sm:px-4 md:min-h-[min(520px,70vh)] md:flex-row md:items-stretch md:gap-10 lg:min-h-[min(560px,72vh)] md:py-14 lg:py-16';

export const landingSplitSectionImageBase =
  'relative w-full shrink-0 overflow-hidden rounded-2xl border border-palette-stone/20 shadow-[0_16px_48px_-20px_rgba(20,20,17,0.14)] min-h-[min(88vw,400px)] sm:min-h-[min(80vw,440px)] md:mt-0 md:min-h-0 md:w-[42%] md:max-w-[480px] md:flex-none md:self-stretch md:rounded-3xl md:shadow-[0_20px_50px_-24px_rgba(20,20,17,0.12)] lg:max-w-[520px]';

export const landingSectionShell =
  'border-t border-palette-stone/20 bg-palette-cream py-16 font-montserrat md:py-24';

export const landingEyebrow =
  'text-[11px] font-semibold uppercase tracking-[0.26em] text-palette-ink';

export const landingEyebrowDark =
  'text-[11px] font-semibold uppercase tracking-[0.26em] text-palette-cream/55';

export const landingSectionTitle =
  'mt-3 text-[2.15rem] font-bold leading-[1.1] tracking-tight text-palette-ink sm:text-[2.35rem] md:text-[2.85rem] md:leading-[1.08] lg:text-[3.35rem]';

export const landingSectionTitleDark =
  'mt-3 text-[2.15rem] font-bold leading-[1.1] tracking-tight text-palette-cream sm:text-[2.35rem] md:text-[2.85rem] md:leading-[1.08] lg:text-[3.35rem]';

export const landingSectionBody =
  'mt-5 text-[16px] font-normal leading-[1.72] text-palette-ink md:text-[18px] lg:text-[19px]';

export const landingSectionBodyMuted =
  'mt-4 text-[16px] font-normal leading-[1.68] text-palette-stone md:text-[18px] lg:text-[19px]';

export const landingSectionLead =
  'text-[17px] font-medium leading-[1.68] text-palette-ink/90 md:text-[19px] md:leading-[1.7] lg:text-[20px]';

export const landingCardBody =
  'text-[16px] font-normal leading-[1.72] text-palette-ink/90 md:text-[18px] md:leading-[1.7] lg:text-[19px]';

export const landingCardBodyDark =
  'text-[16px] font-normal leading-[1.72] text-palette-cream md:text-[18px] md:leading-[1.7] lg:text-[19px]';

export const landingSectionBodyDark =
  'mt-4 text-[16px] font-normal leading-[1.68] text-palette-cream/85 md:text-[18px] lg:text-[19px]';

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
