'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { isCursoPublicPath, parseCursoPublicPath } from '../lib/cursoPaths';
import {
  clearCursoBienvenidaPendiente,
  getCursoBienvenidaPendiente,
  setCursoBienvenidaPendiente,
} from '../utils/redirectQueue';
import state from '../valtio';

const AUTH_PATHS = [
  '/iniciar-sesion',
  '/registro',
  '/olvide-contrasena',
  '/restablecer',
  '/restablecer-correo',
  '/verificar-correo',
];

const MEMBERSHIP_ONBOARDING_EXCLUDED = [
  '/incorporacion',
  '/iniciar-sesion',
  '/registro',
  '/olvide-contrasena',
  '/restablecer',
  '/restablecer-correo',
  '/verificar-correo',
  '/',
  '/nosotros',
  '/productos',
  '/mentoria',
];

/**
 * Verifica onboarding de membresía y bienvenida post-compra de curso.
 */
export default function OnboardingChecker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = useAuth();

  useEffect(() => {
    const isAuthPath = AUTH_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    const cursoPath = parseCursoPublicPath(pathname);
    const skipCourseWelcome =
      isAuthPath ||
      cursoPath?.subpath === 'empezar' ||
      pathname === '/pago/error';

    const isOnMatchingCourseWelcomePage = (
      successPath: string,
      productId: string
    ) => {
      if (pathname !== '/pago/exito') return false;
      if (searchParams.get('tipo') !== 'curso') return false;
      const currentPathWithQuery =
        pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      return (
        searchParams.get('productId') === productId || currentPathWithQuery === successPath
      );
    };

    const checkCourseWelcome = async (): Promise<boolean> => {
      if (skipCourseWelcome) return false;

      const hasToken = document.cookie.split('; ').some((row) => row.startsWith('userToken='));
      if (!hasToken) {
        const cookieProductId = getCursoBienvenidaPendiente();
        if (cookieProductId && pathname !== '/pago/exito') {
          router.push(`/pago/exito?productId=${cookieProductId}&tipo=curso`);
          return true;
        }
        return false;
      }

      try {
        const response = await fetch('/api/user/cursos/bienvenida-pendiente', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.pendiente && data.successPath && data.productId) {
            setCursoBienvenidaPendiente(data.productId);
            if (!isOnMatchingCourseWelcomePage(data.successPath, data.productId)) {
              router.replace(data.successPath);
              return true;
            }
            return false;
          }
          clearCursoBienvenidaPendiente();
        }
      } catch {
        /* ignore */
      }

      return false;
    };

    const checkMembershipOnboarding = async () => {
      if (
        pathname === '/incorporacion/bienvenida' ||
        pathname.startsWith('/incorporacion/bienvenida')
      ) {
        return;
      }

      const isMembershipExcluded =
        isCursoPublicPath(pathname) ||
        MEMBERSHIP_ONBOARDING_EXCLUDED.some((path) => {
          if (path === '/') return pathname === '/';
          return pathname === path || pathname.startsWith(`${path}/`);
        });

      if (isMembershipExcluded) return;

      if (!auth.user?.subscription?.active) return;

      const response = await fetch('/api/onboarding/status', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) return;

      const data = await response.json();
      state.weeklyPathNavOpen = false;

      if (data.sinSuscripcion) return;

      if (data.necesitaOnboarding && !data.contratoAceptado) {
        router.push('/incorporacion/bienvenida');
      }
    };

    const run = async () => {
      try {
        if (!auth.user) {
          const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('userToken='));

          if (token) {
            await auth.fetchUser();
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }

        const redirected = await checkCourseWelcome();
        if (redirected) return;

        await checkMembershipOnboarding();
      } catch (error) {
        console.error('Error verificando onboarding:', error);
      }
    };

    run();

    const interval = setInterval(run, 15000);

    return () => clearInterval(interval);
  }, [pathname, searchParams, auth.user, router, auth]);

  return null;
}
