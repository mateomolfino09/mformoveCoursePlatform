'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMentorshipAnalytics } from '../../../hooks/useMentorshipAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from '../../../hooks/useToast';
import { MentorshipProps } from '../../../types/mentorship';
import PremiumMentorshipCards from './PremiumMentorshipCards';
import { saveRedirectUrl } from '../../../utils/redirectQueue';

type PlanPrice = {
  interval: 'trimestral' | 'anual';
  price: number;
  currency: string;
  stripePriceId: string;
};

type MentorshipPlan = {
  _id: string;
  name: string;
  description: string;
  features: string[];
  level: string;
  active: boolean;
  prices: PlanPrice[];
};

const MentorshipPlans = ({ plans, origin }: MentorshipProps) => {
  const [selectedPlan, setSelectedPlan] = useState<MentorshipPlan | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const { trackPlanView, trackPlanClick } = useMentorshipAnalytics();
  const auth = useAuth();
  const router = useRouter();
  const [interval, setInterval] = useState<'trimestral' | 'anual'>('trimestral');

  const handlePlanSelect = async (plan: MentorshipPlan) => {
    if (!auth.user) {
      // Guardar la URL actual para redirigir después del login/registro
      if (typeof window !== 'undefined') {
        saveRedirectUrl(window.location.pathname + window.location.search);
      }
      toast.error('Debes iniciar sesión para continuar');
      router.push('/iniciar-sesion');
      return;
    }

    if (!plan.active) {
      toast.error('Este plan no está disponible actualmente');
      return;
    }

    setSelectedPlan(plan);
    trackPlanClick(plan.level, plan.prices[0].price);
    setLoadingPlanId(plan._id);

    try {
      const response = await fetch('/api/mentorship/stripe/createCheckoutSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan._id,
          userEmail: auth.user.email,
          interval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la sesión de pago');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió la URL de pago');
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast.error(error instanceof Error ? error.message : 'Error al procesar el pago');
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <section id="mentorship-plans" className="py-16 md:py-20 bg-palette-cream font-montserrat">
      <div className="w-[85%] max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-12"
        >
          <p className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-stone/80 mb-2">
            Inversión
          </p>
          <h2 className="text-2xl md:text-4xl font-montserrat font-semibold text-palette-ink tracking-tight">
            Elegí el ciclo que mejor te sostenga
          </h2>
          <p className="font-raleway italic text-palette-stone text-base md:text-lg max-w-2xl leading-relaxed mt-4">
            Menos opciones, más claridad.
          </p>
        </motion.div>

        <PremiumMentorshipCards 
          plans={plans}
          interval={interval}
          onPlanSelect={handlePlanSelect}
          loadingPlanId={loadingPlanId}
          origin={origin}
          setInterval={setInterval}
        />
      </div>
    </section>
  );
};

export default MentorshipPlans;