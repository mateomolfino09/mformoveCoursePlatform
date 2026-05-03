'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { MentorshipProps } from '../../../types/mentorship';

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

interface PremiumMentorshipCardsProps extends MentorshipProps {
  interval: 'trimestral' | 'anual';
  onPlanSelect: (plan: MentorshipPlan) => void;
  loadingPlanId: string | null;
  setInterval?: (interval: 'trimestral' | 'anual') => void;
}

const PremiumMentorshipCards = ({ plans, interval, onPlanSelect, loadingPlanId, setInterval: setIntervalProp }: PremiumMentorshipCardsProps) => {
  
  // Obtener solo el primer plan (debería ser el único activo)
  const plan = plans && plans.length > 0 ? plans[0] : null;
  
  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-palette-stone">No hay planes disponibles en este momento.</p>
      </div>
    );
  }

  const priceObj = plan.prices?.find((p: PlanPrice) => p.interval === interval);

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto">

        {/* Interval Filters */}
        {setIntervalProp && priceObj && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
            className="flex justify-center mb-12"
          >
            <div className="flex bg-white/60 backdrop-blur rounded-full p-1 border border-palette-stone/25 shadow-sm">
              <button
                className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  interval === 'trimestral' 
                    ? 'bg-palette-ink text-palette-cream shadow-md' 
                    : 'text-palette-stone hover:text-palette-ink hover:bg-white/80'
                }`}
                onClick={() => setIntervalProp?.('trimestral')}
              >
                Trimestral
              </button>
              <button
                className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  interval === 'anual' 
                    ? 'bg-palette-ink text-palette-cream shadow-md' 
                    : 'text-palette-stone hover:text-palette-ink hover:bg-white/80'
                }`}
                onClick={() => setIntervalProp?.('anual')}
              >
                Anual
              </button>
            </div>
          </motion.div>
        )}

        {/* Single Plan Card - Minimalista y moderna */}
        {priceObj && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col max-w-2xl mx-auto"
          >
            <div className="text-center mb-10 md:mb-11">
              <p className="font-montserrat uppercase tracking-[0.2em] text-[11px] text-palette-stone/85 mb-3 md:text-xs">
                Inversión
              </p>
              <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-palette-ink">
                <span className="text-[1.4rem] font-semibold uppercase tracking-[0.04em] sm:text-xl md:text-2xl">
                  {priceObj.currency === 'USD' ? 'U$S' : priceObj.currency}
                </span>
                <span className="text-[2.875rem] font-semibold tabular-nums tracking-tighter sm:text-6xl md:text-[4.25rem] md:leading-none lg:text-8xl">
                  {priceObj.price}
                </span>
              </div>
              <div className="mt-3 text-palette-stone text-[11px] font-medium uppercase tracking-[0.26em] md:text-xs">
                /{interval === 'trimestral' ? 'trimestre' : 'año'}
              </div>
            </div>

            <div className="mx-auto mb-11 max-w-lg space-y-5 text-left md:mb-12">
      
              <p className="border-l-2 border-palette-sage/50 pl-4 text-[15px] font-medium leading-snug text-palette-ink md:text-[16px]">
                Seguimiento y feedback semanal, con una llamada al mes.
              </p>

            </div>

            {/* CTA Button - Clean and minimal */}
            <button
              onClick={() => onPlanSelect(plan)}
              disabled={loadingPlanId === plan._id || !plan.active}
              className="group w-full bg-palette-ink text-palette-cream px-8 py-4 font-semibold text-sm uppercase tracking-[0.2em] hover:bg-palette-sage hover:text-palette-ink transition-all duration-200 font-montserrat rounded-full border-2 border-palette-ink hover:border-palette-sage disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-[0_10px_32px_rgba(20,20,17,0.10)]"
            >
              {loadingPlanId === plan._id ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Procesando...
                </div>
              ) : (
                <span className="inline-flex items-center justify-center gap-4">
                  <span>Elegir este plan</span>
                  <span className="opacity-80 group-hover:translate-x-0.5 transition-transform">→</span>
                </span>
              )}
            </button>

            {/* Value Proposition - Subtle */}
            <div className="text-center">
              <p className="text-xs text-palette-stone/80 font-light tracking-[0.12em]">
                Cancelás cuando quieras.
              </p>
            </div>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="border-y border-palette-stone/20 py-10">
            <p className="font-montserrat uppercase tracking-[0.2em] text-xs text-palette-stone/80 mb-3">
              Nota
            </p>
            <p className="text-sm md:text-base text-palette-stone font-light leading-relaxed max-w-3xl">
              La mentoría tiene ciclos para que el feedback se transforme en práctica real.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumMentorshipCards;