'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMentorshipAnalytics } from '../../../hooks/useMentorshipAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from '../../../hooks/useToast';
import { MentorshipProps } from '../../../types/mentorship';
import PremiumMentorshipCards from './PremiumMentorshipCards';
import { saveRedirectUrl } from '../../../utils/redirectQueue';
import {
  resolveMentorshipDefaultInterval,
  type MentorshipBillingInterval,
} from '../../../lib/mentorshipPricing';
import { MENTORSHIP_START_CTA } from '../../../constants/mentorshipCta';
import MentorshipApplyLink from './MentorshipApplyLink';
import {
  landingEyebrow,
  landingSectionBody,
  landingSectionTitle,
} from '../../../constants/landingSectionDesign';
import state from '../../../valtio';

type MentorshipPlan = MentorshipProps['plans'][number];

const MentorshipPlans = ({ plans, plansLoading = false, plansError = null }: MentorshipProps) => {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const { trackPlanClick } = useMentorshipAnalytics();
  const auth = useAuth();
  const router = useRouter();

  const defaultInterval = useMemo(
    () => resolveMentorshipDefaultInterval(plans[0]?.prices) ?? 'trimestral',
    [plans],
  );

  const [interval, setInterval] = useState<MentorshipBillingInterval>(defaultInterval);

  useEffect(() => {
    setInterval(defaultInterval);
  }, [defaultInterval]);

  const handlePlanSelect = async (plan: MentorshipPlan) => {
    if (!auth.user) {
      if (typeof window !== 'undefined') {
        saveRedirectUrl(MENTORSHIP_START_CTA.href(interval));
      }
      state.authModalMode = 'register';
      state.loginForm = true;
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
        </motion.div>

        {plansLoading ? (
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3 py-10 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-palette-stone/25 border-t-palette-ink" />
            <p className="font-montserrat text-sm text-palette-stone">Cargando planes…</p>
          </div>
        ) : plansError ? (
          <div className="mx-auto max-w-md rounded-2xl border border-palette-stone/25 bg-white/60 p-6 text-center">
            <p className="text-palette-ink font-medium">No pudimos cargar los planes.</p>
            <p className="mt-2 text-sm text-palette-stone">{plansError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full border-2 border-palette-ink bg-palette-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-palette-cream"
            >
              Reintentar
            </button>
          </div>
        ) : !plans.length ? (
          <p className="text-center text-sm text-palette-stone">
            No hay planes disponibles en este momento.
          </p>
        ) : (
          <div className="[perspective:1200px]">
            <PremiumMentorshipCards
              plans={plans}
              interval={interval}
              onPlanSelect={handlePlanSelect}
              loadingPlanId={loadingPlanId}
              setInterval={setInterval}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default MentorshipPlans;
