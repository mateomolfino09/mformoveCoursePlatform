'use client'
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';

export default function MentorshipSuccessPage() {
  const searchParams = useSearchParams();
  const externalId = searchParams.get('external_id');
  const planId = searchParams.get('plan_id');
  const auth = useAuth();
  const [planDetails, setPlanDetails] = useState<any>(null);

  useEffect(() => {
    if (planId) {
      // Aquí podrías hacer una llamada para obtener los detalles del plan
      fetchPlanDetails(planId);
    }
  }, [planId]);

  const fetchPlanDetails = async (planId: string) => {
    try {
      const response = await fetch(`/api/payments/plans/${planId}?type=mentorship`);
      if (response.ok) {
        const data = await response.json();
        setPlanDetails(data);
      }
    } catch (error) {
      console.error('Error fetching plan details:', error);
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'explorer':
        return 'Explorador';
      case 'practitioner':
        return 'Practicante';
      case 'student':
        return 'Estudiante';
      default:
        return 'Básico';
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircleIcon className="w-12 h-12 text-white" />
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-4"
          >
            ¡Bienvenido a tu Mentoría!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/80 mb-8"
          >
            Tu pago ha sido procesado exitosamente y ya tienes acceso a tu programa de mentoría personalizada.
          </motion.p>

          {/* Plan Details */}
          {planDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 rounded-2xl p-6 mb-8"
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                Plan {getLevelLabel(planDetails.level)}
              </h3>
              <p className="text-white/80 mb-4">{planDetails.description}</p>
              <div className="text-3xl font-bold text-white">
                ${planDetails.price}/{planDetails.interval}
              </div>
            </motion.div>
          )}

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4 mb-8"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              Próximos Pasos
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <p className="text-white/80">
                  Recibirás un email de bienvenida con los detalles de tu mentoría en las próximas 24 horas.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <p className="text-white/80">
                  Tu mentor se pondrá en contacto contigo para programar tu primera sesión.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <p className="text-white/80">
                  Comienza a explorar el contenido exclusivo disponible en tu cuenta.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/account"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
            >
              Ir a Mi Cuenta
            </Link>
            <Link
              href="/"
              className="bg-white/10 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              Volver al Inicio
            </Link>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-8 border-t border-white/10"
          >
            <p className="text-white/60 text-sm">
              ¿Tienes preguntas? Contáctanos en{' '}
              <a href="mailto:soporte@mformove.com" className="text-blue-400 hover:text-blue-300">
                soporte@mformove.com
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 