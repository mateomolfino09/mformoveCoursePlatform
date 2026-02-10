'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);

  // Rutas que no requieren verificación de onboarding
  const excludedPaths = [
    '/onboarding',
    '/login',
    '/register',
    '/forget',
    '/reset',
    '/resetEmail',
    '/email',
    '/',
    '/about',
    '/move-crew',
    '/products',
    '/mentorship'
  ];

  const checkOnboardingStatus = useCallback(async () => {
    try {
      // Si estamos en una ruta excluida, no verificar
      const isExcluded = excludedPaths.some(path => 
        pathname === path || pathname.startsWith(path + '/')
      );

      if (isExcluded) {
        return;
      }

      // Si no hay usuario, intentar cargarlo en background
      if (!auth.user) {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('userToken='));
        
        if (token) {
          await auth.fetchUser();
          // No esperar delay, continuar inmediatamente
        } else {
          return;
        }
      }

      // Si el usuario no tiene suscripción activa, no necesita onboarding
      if (!auth.user?.subscription?.active) {
        return;
      }

      const response = await fetch('/api/onboarding/status', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setOnboardingStatus(data);

        // Si no tiene suscripción activa, no necesita onboarding
        if (data.sinSuscripcion) {
          setNeedsOnboarding(false);
          return;
        }

        // Solo verificar contrato aceptado (Bienvenida obligatoria)
        // La Camino Base es opcional y no bloquea el acceso
        if (data.necesitaOnboarding) {
          // Solo redirigir si no aceptó el contrato (Bienvenida)
          if (!data.contratoAceptado) {
            setNeedsOnboarding(true);
            router.push('/onboarding/bienvenida');
            return;
          }
          setNeedsOnboarding(false);
        } else {
          setNeedsOnboarding(false);
        }
      }
    } catch (error) {
      console.error('Error verificando onboarding:', error);
    }
  }, [pathname, auth.user, router]);

  useEffect(() => {
    // Verificar en background sin bloquear el renderizado
    checkOnboardingStatus();

    // Verificar periódicamente cada 30 segundos (por si el usuario paga mientras está navegando)
    const interval = setInterval(() => {
      checkOnboardingStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkOnboardingStatus]);

  // Solo bloquear si realmente necesita onboarding (no mientras verifica)
  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-black text-white font-montserrat flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <LockClosedIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Acceso Restringido</h2>
          <p className="text-gray-400 mb-6">
            Debes completar el onboarding antes de acceder a esta sección.
          </p>
          <button
            onClick={() => {
              router.push('/onboarding/bienvenida');
            }}
            className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Completar Bienvenida
          </button>
        </motion.div>
      </div>
    );
  }

  // Siempre renderizar children mientras verifica (sin bloquear)
  return <>{children}</>;
}

