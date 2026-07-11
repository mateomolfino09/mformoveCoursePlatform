'use client';

import React from 'react';
import { MENTORSHIP_APPLY_CTA } from '../../../constants/mentorshipCta';
import { useMentorshipApplyNavigation } from '../../../hooks/useMentorshipApplyNavigation';

interface MentorshipApplyLinkProps {
  className?: string;
  children?: React.ReactNode;
}

export default function MentorshipApplyLink({ className = '', children }: MentorshipApplyLinkProps) {
  const { navigate, isNavigating } = useMentorshipApplyNavigation();

  return (
    <button
      type="button"
      onClick={navigate}
      disabled={isNavigating}
      className={`disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
    >
      {isNavigating ? 'Cargando…' : (children ?? MENTORSHIP_APPLY_CTA.label)}
    </button>
  );
}
