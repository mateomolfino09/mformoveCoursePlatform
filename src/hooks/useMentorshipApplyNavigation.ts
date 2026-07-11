'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MENTORSHIP_APPLY_CTA } from '../constants/mentorshipCta';

export function useMentorshipApplyNavigation() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push(MENTORSHIP_APPLY_CTA.href);
  }, [isNavigating, router]);

  return { navigate, isNavigating };
}
