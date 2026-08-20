import {
  landingCtaGhostDark,
  landingCtaInverted,
  landingEyebrowDark,
  landingSectionTitleDark,
} from './landingSectionDesign';

/** Fondo de registro (my_uploads/mfw23qqpwmyxqxya3777). */
export const REGISTER_BG = 'my_uploads/mfw23qqpwmyxqxya3777';
export const REGISTER_BG_DESKTOP = REGISTER_BG;
export const REGISTER_BG_MOBILE = REGISTER_BG;

/** Shell del modal: tamaño según contenido, centrado en la vista. */
export const authFormCardShellClass =
  'relative isolate w-full max-w-2xl shrink-0 mx-auto rounded-2xl md:rounded-[2rem] border border-palette-cream/15 bg-palette-ink/88 md:bg-palette-ink/80 text-palette-cream shadow-none md:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden';

/** Contenido sobre el efecto animado (z-20). */
export const authFormCardInnerClass =
  'relative z-20 flex flex-col p-5 sm:p-7 md:p-9 space-y-5 md:space-y-7 max-h-[min(85dvh,720px)] overflow-y-auto md:max-h-none md:overflow-visible';

/** @deprecated Usar authFormCardShellClass + authFormCardInnerClass */
export const authFormCardClass = `${authFormCardShellClass} ${authFormCardInnerClass}`;

export const authFormEyebrowClass = landingEyebrowDark;

export const authFormTitleClass = `${landingSectionTitleDark} !mt-0 text-center !text-[1.55rem] sm:!text-[2.15rem] md:!text-[2.5rem]`;

export const authFormSubtitleClass =
  'text-sm md:text-base text-palette-cream/70 font-normal text-center max-w-md mx-auto';

export const authFormLabelClass =
  'text-xs md:text-sm font-medium uppercase tracking-[0.14em] text-palette-cream/70';

export const authFormInputClass =
  'mt-1.5 block w-full rounded-full border border-palette-cream/30 bg-palette-ink/50 py-3.5 px-5 text-sm md:text-base text-palette-cream placeholder:text-palette-cream/45 focus:outline-none focus:border-palette-sage focus:ring-2 focus:ring-palette-sage/25';

export const authFormSelectClass =
  'mt-1.5 block w-full appearance-none rounded-full border border-palette-cream/30 bg-palette-ink/50 py-3.5 px-5 pr-11 text-sm md:text-base text-palette-cream focus:outline-none focus:border-palette-sage focus:ring-2 focus:ring-palette-sage/25';

export const authBtnPrimaryClass = `${landingCtaInverted} w-full !justify-center !py-3.5`;

export const authBtnGhostClass = `${landingCtaGhostDark} w-full !justify-center !py-3.5`;
