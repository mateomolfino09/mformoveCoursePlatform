'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MENTORSHIP_APPLY_CTA } from '../../../constants/mentorshipCta';
import { landingCtaPrimary, landingCtaInverted } from '../../../constants/landingSectionDesign';
import { useMentorshipApplyNavigation } from '../../../hooks/useMentorshipApplyNavigation';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';

type MentorshipApplyButtonVariant = 'primary' | 'inverted' | 'compact' | 'custom';

const variantClasses: Record<MentorshipApplyButtonVariant, string> = {
  primary: landingCtaPrimary,
  inverted: landingCtaInverted,
  compact:
    'group inline-flex shrink-0 items-center justify-center gap-2.5 self-start rounded-full border-2 border-palette-ink bg-palette-ink px-6 py-2.5 font-montserrat text-[10px] font-semibold uppercase tracking-[0.2em] text-palette-cream transition-all duration-200 hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink disabled:cursor-not-allowed disabled:opacity-60 md:self-end',
  custom: '',
};

interface MentorshipApplyButtonProps {
  variant?: MentorshipApplyButtonVariant;
  className?: string;
  showArrow?: boolean;
  animated?: boolean;
  label?: string;
  loadingLabel?: string;
}

export default function MentorshipApplyButton({
  variant = 'primary',
  className = '',
  showArrow = true,
  animated = false,
  label = MENTORSHIP_APPLY_CTA.label,
  loadingLabel = 'Cargando…',
}: MentorshipApplyButtonProps) {
  const { navigate, isNavigating } = useMentorshipApplyNavigation();
  const baseClass = `${variantClasses[variant]} disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim();

  const content = isNavigating ? (
    <>
      <MiniLoadingSpinner />
      <span>{loadingLabel}</span>
    </>
  ) : (
    <>
      <span>{label}</span>
      {showArrow ? (
        <span
          className={
            variant === 'inverted'
              ? 'text-palette-ink/70 transition-transform duration-200 group-hover:translate-x-0.5'
              : variant === 'compact'
                ? 'transition-transform group-hover:translate-x-0.5'
                : 'opacity-80 transition-transform duration-200 group-hover:translate-x-0.5'
          }
        >
          →
        </span>
      ) : null}
    </>
  );

  if (animated) {
    return (
      <motion.button
        type="button"
        onClick={navigate}
        disabled={isNavigating}
        className={baseClass}
        whileHover={isNavigating ? undefined : { y: -2 }}
        whileTap={isNavigating ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <button type="button" onClick={navigate} disabled={isNavigating} className={baseClass}>
      {content}
    </button>
  );
}
