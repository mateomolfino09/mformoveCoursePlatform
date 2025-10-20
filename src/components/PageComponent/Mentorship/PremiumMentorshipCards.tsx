'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
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

const PremiumMentorshipCards = ({ plans, interval, onPlanSelect, loadingPlanId, setInterval }: PremiumMentorshipCardsProps) => {
  
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

  const getMissingFeatures = (currentPlan: MentorshipPlan, allPlans: MentorshipPlan[]) => {
    const currentFeatures = new Set(currentPlan.features);
    const allFeatures = new Set<string>();
    
    allPlans.forEach(plan => {
      plan.features.forEach(feature => allFeatures.add(feature));
    });
    
    return Array.from(allFeatures).filter(feature => !currentFeatures.has(feature));
  };

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto">

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="mb-16"
          data-table-section
        >
          <div className="bg-gray-900/5 rounded-2xl border border-black/10 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
              className="p-6 md:p-8 border-b border-black/10"
            >
              <h3 className="text-xl md:text-2xl font-semibold text-black mb-2">
                Comparación de Beneficios
              </h3>
              <p className="text-gray-600 text-sm md:text-base font-light">
                Qué incluye cada nivel de mentoría
              </p>
            </motion.div>
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm font-medium text-black">Beneficio</th>
                    {plans.map((plan) => (
                      <th key={plan._id} className="px-4 md:px-6 py-3 md:py-4 text-center text-sm font-medium text-black">
                        {getLevelConfig(plan.level).title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {/* Get all unique features */}
                  {(() => {
                    const allFeatures = new Set<string>();
                    plans.forEach(plan => {
                      plan.features.forEach(feature => allFeatures.add(feature));
                    });
                    return Array.from(allFeatures).map((feature, index) => (
                      <tr key={feature} className="hover:bg-gray-900/5 transition-colors">
                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-700 font-light">
                          {feature}
                        </td>
                        {plans.map((plan) => (
                          <td key={plan._id} className="px-4 md:px-6 py-3 md:py-4 text-center">
                            {plan.features.includes(feature) ? (
                              <CheckIcon className="w-5 h-5 text-black mx-auto" />
                            ) : (
                              <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {(() => {
                const allFeatures = new Set<string>();
                plans.forEach(plan => {
                  plan.features.forEach(feature => allFeatures.add(feature));
                });
                return Array.from(allFeatures).map((feature, index) => (
                  <div key={feature} className={`p-4 border-b border-black/10 last:border-b-0`}>
                    <div className="font-medium text-sm text-black mb-3">{feature}</div>
                    <div className="grid grid-cols-3 gap-2">
                      {plans.map((plan) => (
                        <div key={plan._id} className="text-center">
                          <div className="text-xs text-gray-500 mb-1 font-light">{getLevelConfig(plan.level).title}</div>
                          {plan.features.includes(feature) ? (
                            <CheckIcon className="w-4 h-4 text-black mx-auto" />
                          ) : (
                            <XMarkIcon className="w-4 h-4 text-gray-400 mx-auto" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </motion.div>

        {/* Interval Filters */}
        {setInterval && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
            className="flex justify-center mb-12"
          >
            <div className="flex bg-gray-900/5 rounded-xl p-1 border border-black/10">
              <button
                className={`px-6 py-2 rounded-lg font-light text-sm transition-all duration-200 ${
                  interval === 'trimestral' 
                    ? 'bg-black text-white' 
                    : 'text-gray-600 hover:text-black'
                }`}
                onClick={() => setInterval('trimestral')}
              >
                Trimestral
              </button>
              <button
                className={`px-6 py-2 rounded-lg font-light text-sm transition-all duration-200 ${
                  interval === 'anual' 
                    ? 'bg-black text-white' 
                    : 'text-gray-600 hover:text-black'
                }`}
                onClick={() => setInterval('anual')}
              >
                Anual
              </button>
            </div>
          </motion.div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan, index) => {
            const priceObj = plan.prices?.find((p: PlanPrice) => p.interval === interval);
            if (!priceObj) return null;
            
            const isPopular = plan.level === 'practitioner';
            const config = getLevelConfig(plan.level);
            const missingFeatures = getMissingFeatures(plan, plans);
            const isBestPlan = missingFeatures.length === 0;

            return (
              <motion.div
                key={plan._id + '-' + interval}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                viewport={{ once: true }}
                className="group bg-gray-900/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-black/10 hover:bg-gray-900/10 transition-all duration-300 flex flex-col"
              >
                {/* Animal Icon & Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 relative opacity-60 group-hover:opacity-80 transition-opacity duration-300">
                    <img 
                      src={config.animal} 
                      alt={config.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {isBestPlan && (
                    <span className="text-xs font-light text-gray-500 bg-black/5 px-2 py-1 rounded">
                      Más completo
                    </span>
                  )}
                  {isPopular && !isBestPlan && (
                    <span className="text-xs font-light text-gray-500 bg-black/5 px-2 py-1 rounded">
                      Popular
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-semibold mb-2 text-black">
                  {config.title}
                </h3>
                <p className="text-sm text-gray-600 font-light mb-6">
                  {config.subtitle}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-3xl font-semibold text-black mb-1">
                    U$S {priceObj.price}
                  </div>
                  <div className="text-gray-500 text-sm font-light">
                    /{interval === 'trimestral' ? 'trimestre' : 'año'}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm md:text-base text-gray-700 font-light leading-relaxed mb-6">
                  {plan.description}
                </p>

                {/* Separator */}
                <div className="w-full h-px bg-black/10 mb-6"></div>

                {/* Features List */}
                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <div 
                      key={featureIndex}
                      className="flex items-start space-x-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-black/40"></div>
                      <span className="text-xs md:text-sm leading-relaxed text-gray-700 font-light">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => onPlanSelect(plan)}
                  disabled={loadingPlanId === plan._id || !plan.active}
                  className="w-full bg-black text-white px-6 py-3 font-semibold text-sm md:text-base hover:bg-gray-800 transition-all duration-300 font-montserrat rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingPlanId === plan._id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </div>
                  ) : (
                    `Comenzar ${config.title}`
                  )}
                </button>

                {/* Value Proposition */}
                <div className="mt-4 text-center">
                  <div className="text-xs text-gray-500 font-light">
                    Cancela cuando quieras
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="bg-gray-900/5 border border-black/10 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-semibold text-black mb-4">
              Te explico el compromiso trimestral...
            </h3>
            <p className="text-base md:text-lg text-gray-600 font-light mb-8 max-w-3xl leading-relaxed">
            El aprendizaje motor requiere repetición, feedback constante y tiempo para procesar. Por eso la mentoría es trimestral mínimamente: cambiar patrones de movimiento lleva semanas de estudio, observación y práctica.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => {
                  const tableElement = document.querySelector('[data-table-section]');
                  if (tableElement) {
                    tableElement.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    });
                  }
                }}
                className="bg-black text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 group"
              >
                Ver comparación detallada
                <svg 
                  className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumMentorshipCards;