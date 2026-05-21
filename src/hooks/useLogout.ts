'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { toast } from './useToast';
import {
  clearPendingUserActions,
  getPendingUserActions,
} from '../utils/redirectQueue';

/**
 * Mismo patrón que el login exitoso (toast en viewport global).
 */
export function useLogout(defaultRedirect = '/') {
  const auth = useAuth();
  const router = useRouter();

  const performLogout = useCallback(
    (redirectTo?: string) => {
      const pending = getPendingUserActions();
      clearPendingUserActions();
      auth.signOut();

      if (pending.length > 0) {
        toast.warning(
          `Sesión cerrada. Se descartaron acciones pendientes: ${pending.join(' · ')}.`
        );
      } else {
        toast.success('Sesión cerrada correctamente');
      }

      router.push(redirectTo ?? defaultRedirect);
    },
    [auth, router, defaultRedirect]
  );

  return { performLogout };
}
