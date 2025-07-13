'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useMentorshipAnalytics } from '../../../hooks/useMentorshipAnalytics';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
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

const MentorshipPlans = ({ plans, origin }: MentorshipProps) => {
  const [selectedPlan, setSelectedPlan] = useState<MentorshipPlan | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const { trackPlanView, trackPlanClick } = useMentorshipAnalytics();
  const auth = useAuth();
  const router = useRouter();
  const [interval, setInterval] = useState('trimestral');

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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'explorer':
        return 'from-blue-500 to-cyan-500';
      case 'practitioner':
        return 'from-purple-500 to-pink-500';
      case 'student':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'explorer':
        return { text: 'Explorador', color: 'bg-blue-500' };
      case 'practitioner':
        return { text: 'Practicante', color: 'bg-purple-500' };
      case 'student':
        return { text: 'Estudiante', color: 'bg-yellow-500' };
      default:
        return { text: 'Básico', color: 'bg-gray-500' };
    }
  };

  return (
    <section id="mentorship-plans" className="pb-16 bg-[#F2F3F6] font-montserrat">
      <div className="pt-6 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-semibold mb-6 font-montserrat text-black">
            Elegí tu plan
          </h2>
          <p className="text-xl max-w-3xl mx-auto font-montserrat text-gray-700">
            Elige el nivel de compromiso que mejor se adapte a tus objetivos de transformación
          </p>
          <div className="flex justify-center mb-4 mt-4 gap-2">
            <button
              className={`px-4 py-2 rounded-l font-semibold border transition-colors duration-200 ${interval === 'trimestral' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'}`}
              onClick={() => setInterval('trimestral')}
            >
              Trimestral
            </button>
            <button
              className={`px-4 py-2 rounded-r font-semibold border transition-colors duration-200 ${interval === 'anual' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'}`}
              onClick={() => setInterval('anual')}
            >
              Anual (-15%)
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const priceObj = plan.prices?.find((p: PlanPrice) => p.interval === interval);
            if (!priceObj) return null;
            const isPopular = plan.level === 'practitioner';
            return (
              <motion.div
                key={plan._id + '-' + interval}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`rounded-2xl flex flex-col h-full group border border-gray-200 bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300`}
              >
                <div className="relative rounded-2xl h-full w-full z-10 p-8 flex flex-col">
                  {/* Badge */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-block px-4 py-2 rounded-full text-sm font-bold font-montserrat bg-black text-white border border-black">
                      {plan.level === 'explorer' ? 'Explorador' : plan.level === 'practitioner' ? 'Practicante' : 'Estudiante'}
                    </span>
                  </div>
                  {/* Badge MÁS POPULAR */}
                  {isPopular && (
                    <div className="absolute -top-2 -right-2">
                      <span
                        className="font-bold px-3 py-1 rounded-full text-xs font-montserrat"
                        style={{ background: '#234C8C', color: 'white' }}
                      >
                        MÁS POPULAR
                      </span>
                    </div>
                  )}
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold mb-4 font-montserrat text-black">{plan.name}</h3>
                    <div className="mb-4">
                      {interval === 'trimestral' ? (
                        <div>
                          <div className="mb-2 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold font-montserrat text-black">
                              ${Math.round(priceObj.price / 3)}
                            </span>
                            <span className="ml-2 font-montserrat text-gray-600">/mes</span>
                          </div>
                          <div className="text-sm font-montserrat text-gray-600">
                            <span className="font-semibold text-black">${priceObj.price}</span> pagados trimestralmente
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-4xl font-bold font-montserrat text-black">${priceObj.price}</span>
                          <span className="ml-2 font-montserrat text-gray-600">/año</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed font-montserrat text-gray-700">
                      {plan.description}
                    </p>
                  </div>
                  {/* Features */}
                  <div className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-black" />
                        <span className="text-sm font-montserrat text-gray-800">{feature}</span>
                      </div>
                    ))}
                  </div>
                  {/* CTA Button fijo abajo */}
                  <div className="mt-auto pt-2">
                    <button
                      onClick={() => handlePlanSelect(plan)}
                      disabled={loadingPlanId === plan._id || !plan.active}
                      className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 text-white font-montserrat shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-black hover:bg-[#234C8C]"
                    >
                      {loadingPlanId === plan._id ? 'Procesando...' : `Comenzar`}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="rounded-2xl p-8 font-montserrat" style={{ background: '#F2F3F6', border: '1px solid var(--mentoria-blue-light)' }}>
            <h3 className="text-2xl font-semibold mb-4 font-montserrat" style={{ color: 'var(--mentoria-blue)' }}>
              ¿Por qué el compromiso trimestral?
            </h3>
            <p className="max-w-3xl mx-auto leading-relaxed font-montserrat" style={{ color: 'black' }}>
              La transformación real requiere tiempo y constancia. Un trimestre nos permite 
              establecer hábitos sólidos, ver progresos significativos y crear una base 
              duradera para tu práctica de movimiento. No buscamos resultados 
              rápidos, buscamos cambios que perduren.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MentorshipPlans; 