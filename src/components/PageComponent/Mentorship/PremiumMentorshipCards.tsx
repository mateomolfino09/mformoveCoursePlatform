'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/solid';
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
        <p className="text-gray-600">No hay planes disponibles en este momento.</p>
      </div>
    );
  }

  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'explorer':
        return { 
          animal: '/images/svg/owl.svg',
          title: 'Explorador',
          subtitle: 'Ideal para comenzar'
        };
      case 'practitioner':
        return { 
          animal: '/images/svg/hawk.svg',
          title: 'Practicante',
          subtitle: 'Más profundo'
        };
      case 'student':
        return { 
          animal: '/images/svg/elephant.svg',
          title: 'Estudiante',
          subtitle: 'Máximo compromiso'
        };
      default:
        return { 
          animal: '/images/svg/spider.svg',
          title: 'Plan',
          subtitle: 'Básico'
        };
    }
  };

  const priceObj = plan.prices?.find((p: PlanPrice) => p.interval === interval);
  const config = getLevelConfig(plan.level);

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
            <div className="flex bg-white/60 backdrop-blur rounded-xl p-1 border border-[#AF50E5]/20 shadow-sm">
              <button
                className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  interval === 'trimestral' 
                    ? 'bg-[#AF50E5] text-white shadow-md' 
                    : 'text-gray-700 hover:text-[#AF50E5] hover:bg-white/80'
                }`}
                onClick={() => setIntervalProp?.('trimestral')}
              >
                Trimestral
              </button>
              <button
                className={`px-8 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  interval === 'anual' 
                    ? 'bg-[#AF50E5] text-white shadow-md' 
                    : 'text-gray-700 hover:text-[#AF50E5] hover:bg-white/80'
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
            {/* Price Section - Minimalista */}
            <div className="text-center mb-12">
              <div className="text-6xl md:text-7xl font-light text-black mb-2 tracking-tight">
                U$S {priceObj.price}
              </div>
              <div className="text-gray-600 text-sm font-light tracking-wide uppercase">
                /{interval === 'trimestral' ? 'trimestre' : 'año'}
              </div>
            </div>

            {/* Description - Clean */}
            <p className="text-lg md:text-xl text-gray-700 font-light leading-relaxed mb-12 text-center max-w-xl mx-auto">
              {plan.description}
            </p>

            {/* Features List - Minimalista */}
            <div className="mb-12 bg-gradient-to-br from-white via-[#FAF8F3]/50 to-[#F5F1E8]/30 rounded-3xl p-6 border border-[#AF50E5]/20 shadow-[0_4px_20px_rgba(175,80,229,0.08)]">
              {plan.features.map((feature, featureIndex) => (
                <div 
                  key={featureIndex}
                  className="flex items-start space-x-4 py-4 border-b border-[#AF50E5]/10 last:border-b-0"
                >
                  <CheckIcon className="w-5 h-5 text-[#AF50E5] mt-0.5 flex-shrink-0" />
                  <span className="text-base leading-relaxed text-gray-800 font-light">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button - Clean and minimal */}
            <button
              onClick={() => onPlanSelect(plan)}
              disabled={loadingPlanId === plan._id || !plan.active}
              className="w-full bg-[#AF50E5] text-white px-8 py-4 font-medium text-base hover:bg-[#9A3FD4] transition-all duration-200 font-montserrat rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-lg hover:shadow-xl hover:shadow-[#AF50E5]/30"
            >
              {loadingPlanId === plan._id ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Procesando...
                </div>
              ) : (
                'Comenzar Mentoría'
              )}
            </button>

            {/* Value Proposition - Subtle */}
            <div className="text-center">
              <p className="text-xs text-gray-500 font-light tracking-wide">
                Cancela cuando quieras
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
          <div className="bg-gradient-to-br from-white via-[#FAF8F3]/50 to-[#F5F1E8]/30 border border-[#AF50E5]/20 rounded-3xl p-8 md:p-12 shadow-[0_4px_20px_rgba(175,80,229,0.08)]">
            <h3 className="text-2xl md:text-3xl font-semibold text-black mb-4">
              Te explico el compromiso trimestral...
            </h3>
            <p className="text-base md:text-lg text-gray-700 font-light mb-8 max-w-3xl leading-relaxed">
            El aprendizaje motor requiere repetición, feedback constante y tiempo para procesar. Por eso la mentoría es trimestral mínimamente: cambiar patrones de movimiento lleva semanas de estudio, observación y práctica.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumMentorshipCards;