'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import state from '../valtio';

/**
 * Componente global que verifica continuamente el estado del onboarding
 * y redirige automáticamente si el usuario necesita completarlo.
 * 
 * Se ejecuta en todas las páginas excepto las de onboarding y login/register.
 */
export default function OnboardingChecker() {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();

  useEffect(() => {
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

    // Verificar si la ruta actual está excluida
    const isExcluded = excludedPaths.some(path => {
      if (path === '/') {
        return pathname === '/';
      }
      return pathname === path || pathname.startsWith(path + '/');
    });

    // CRÍTICO: Si estamos en /onboarding/bienvenida, NO hacer NADA
    // El usuario puede estar aceptando el contrato o viendo el modal
    if (pathname === '/onboarding/bienvenida' || pathname.startsWith('/onboarding/bienvenida')) {
      return; // Salir completamente, no ejecutar ninguna verificación
    }

    if (isExcluded) {
      // No hacer nada si estamos en una ruta excluida
      return;
    }

    // Verificar onboarding solo si el usuario está autenticado
    const checkOnboarding = async () => {
      try {
        // Si no hay usuario, esperar a que se cargue
        if (!auth.user) {
          // Si hay token, intentar cargar el usuario
          const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('userToken='));
          
          if (token) {
            await auth.fetchUser();
            // Esperar un momento para que se cargue el usuario
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            return;
          }
        }
        // Verificar si el usuario tiene suscripción activa
        if (!auth.user?.subscription?.active) {
          return; // No necesita onboarding si no tiene suscripción activa
        }

        // Verificar estado del onboarding
        const response = await fetch('/api/onboarding/status', {
          credentials: 'include',
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[OnboardingChecker] Estado del onboarding:', data);

          state.weeklyPathNavOpen = false; 

          // Si no tiene suscripción activa, no hacer nada
          if (data.sinSuscripcion) {
            console.log('[OnboardingChecker] Usuario sin suscripción activa');
            return;
          }

          // Si necesita onboarding (contrato no aceptado), redirigir
          if (data.necesitaOnboarding) {
            console.log('[OnboardingChecker] Necesita onboarding, contratoAceptado:', data.contratoAceptado);
            if (!data.contratoAceptado) {
              console.log('[OnboardingChecker] Redirigiendo a /onboarding/bienvenida');
              // Solo redirigir a bienvenida si no estamos ya ahí
              router.push('/onboarding/bienvenida');
            }
            // Si el contrato está aceptado, NO hacer nada (dejar que el usuario complete el flujo)
          } else {
            console.log('[OnboardingChecker] No necesita onboarding');
          }
        } else {
          console.error('[OnboardingChecker] Error en respuesta:', response.status);
        }
      } catch (error) {
        console.error('Error verificando onboarding:', error);
      }
    };

    // Verificar inmediatamente
    checkOnboarding();

    // Verificar periódicamente cada 30 segundos (por si el usuario paga mientras está navegando)
    const interval = setInterval(checkOnboarding, 30000);

    return () => clearInterval(interval);
  }, [pathname, auth.user, router, auth]);

  // Este componente no renderiza nada
  return null;
}

