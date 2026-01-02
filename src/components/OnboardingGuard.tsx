'use client';

import { useEffect, useState } from 'react';
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
  const [checking, setChecking] = useState(true);
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

  useEffect(() => {
    // Si estamos en una ruta excluida, no verificar
    const isExcluded = excludedPaths.some(path => 
      pathname === path || pathname.startsWith(path + '/')
    );

    if (isExcluded) {
      setChecking(false);
      return;
    }

    checkOnboardingStatus();

    // Verificar periódicamente cada 30 segundos (por si el usuario paga mientras está navegando)
    const interval = setInterval(() => {
      checkOnboardingStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [pathname, auth.user]);

  const checkOnboardingStatus = async () => {
    try {
      // Si no hay usuario, intentar cargarlo
      if (!auth.user) {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('userToken='));
        
        if (token) {
          await auth.fetchUser();
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          setChecking(false);
          return;
        }
      }

      // Si el usuario no tiene suscripción activa, no necesita onboarding
      if (!auth.user?.subscription?.active) {
        setChecking(false);
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
          setChecking(false);
          setNeedsOnboarding(false);
          return;
        }

        // Solo verificar contrato aceptado (Bienvenida obligatoria)
        // La Bitácora Base es opcional y no bloquea el acceso
        if (data.necesitaOnboarding) {
          setNeedsOnboarding(true);

          console.log('data.contratoAceptado', data.contratoAceptado);
          
          // Solo redirigir si no aceptó el contrato (Bienvenida)
          if (!data.contratoAceptado) {
            router.push('/onboarding/bienvenida');
            return;
          }
        } else {
          setNeedsOnboarding(false);
        }
      }
      setChecking(false);
    } catch (error) {
      console.error('Error verificando onboarding:', error);
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-black text-white font-montserrat flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

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

  return <>{children}</>;
}

