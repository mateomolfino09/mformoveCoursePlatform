'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMentorshipAnalytics } from '../../../hooks/useMentorshipAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from '../../../hooks/useToast';
import { MentorshipProps } from '../../../types/mentorship';
import PremiumMentorshipCards from './PremiumMentorshipCards';
import { saveRedirectUrl } from '../../../utils/redirectQueue';
import {
  resolveMentorshipShortInterval,
  type MentorshipBillingInterval,
} from '../../../lib/mentorshipPricing';
import { MENTORSHIP_START_CTA } from '../../../constants/mentorshipCta';
import MentorshipApplyLink from './MentorshipApplyLink';
import {
  landingEyebrow,
  landingFadeUp,
  landingHeaderBlock,
  landingSectionBody,
  landingSectionTitle,
} from '../../../constants/landingSectionDesign';

type MentorshipPlan = MentorshipProps['plans'][number];

const MentorshipPlans = ({ plans }: MentorshipProps) => {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const { trackPlanClick } = useMentorshipAnalytics();
  const auth = useAuth();
  const router = useRouter();

  const defaultInterval = useMemo(
    () => resolveMentorshipShortInterval(plans[0]?.prices) ?? 'mensual',
    [plans],
  );

  const [interval, setInterval] = useState<MentorshipBillingInterval>(defaultInterval);

  const handlePlanSelect = async (plan: MentorshipPlan) => {
    if (!auth.user) {
      if (typeof window !== 'undefined') {
        saveRedirectUrl(MENTORSHIP_START_CTA.href(interval));
      }
      toast.error('Debes iniciar sesión para continuar');
      router.push('/iniciar-sesion');
      return;
    }

    if (!plan.active) {
      toast.error('Este plan no está disponible actualmente');
      return;
    }

    const selectedPrice = plan.prices.find((p) => p.interval === interval);
    trackPlanClick(plan.level, selectedPrice?.price ?? plan.prices[0]?.price ?? 0);
    setLoadingPlanId(plan._id);
    router.push(MENTORSHIP_START_CTA.href(interval));
  };

  return (
    <section
      id="mentorship-plans"
      className="border-t border-palette-stone/20 bg-palette-cream py-16 font-montserrat md:py-24"
    >
      <div className="relative mx-auto w-[92%] max-w-6xl px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-36px' }}
          className="mx-auto mb-9 max-w-3xl text-center md:mb-11"
        >
          <p className={landingEyebrow}>Inversión</p>
          <h2 className={landingSectionTitle}>
            Elegí el plan que mejor acompañe tu proceso

          </h2>
          <p className={landingSectionBody}>
            Si ya aplicaste, elegí tu modalidad y empezá acá. Si es tu primera vez,{' '}
            <MentorshipApplyLink className="font-medium underline decoration-palette-ink/25 underline-offset-[3px] hover:decoration-palette-sage">
              aplicá a mentoría
            </MentorshipApplyLink>{' '}
            antes de pagar.
          </p>
        </motion.div>

        <div className="[perspective:1200px]">
          <PremiumMentorshipCards
            plans={plans}
            interval={interval}
            onPlanSelect={handlePlanSelect}
            loadingPlanId={loadingPlanId}
            setInterval={setInterval}
          />
        </div>
      </div>
    </section>
  );
};

export default MentorshipPlans;
