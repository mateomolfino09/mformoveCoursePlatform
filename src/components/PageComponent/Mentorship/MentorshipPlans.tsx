'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMentorshipAnalytics } from '../../../hooks/useMentorshipAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { MentorshipProps } from '../../../types/mentorship';
import PremiumMentorshipCards from './PremiumMentorshipCards';

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
      toast.error('Debes iniciar sesión para continuar');
      router.push('/login');
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
    <div id="mentorship-plans" className="py-10 bg-white font-montserrat">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black">
            Estos son los planes disponibles
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-light max-w-3xl leading-relaxed">
            Tres niveles de acompañamiento diseñados para distintos momentos de tu vida. 
          </p>
        </motion.div>

        {/* Cards Component */}
        <PremiumMentorshipCards 
          plans={plans}
          interval={interval}
          onPlanSelect={handlePlanSelect}
          loadingPlanId={loadingPlanId}
          origin={origin}
          setInterval={setInterval}
        />
      </div>
    </div>
  );
};

export default MentorshipPlans;