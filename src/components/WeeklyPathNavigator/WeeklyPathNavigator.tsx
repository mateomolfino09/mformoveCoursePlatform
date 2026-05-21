'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';
import state from '../../valtio';
import { routes } from '../../constants/routes';
import { formatTitleCaseWords } from '../../lib/formatDisplayTitle';

interface CursoNavItem {
  slug: string;
  label: string;
}

const WeeklyPathNavigator = () => {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [cursoNavItems, setCursoNavItems] = useState<CursoNavItem[]>([]);
  const [cursosLoading, setCursosLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const snap = useSnapshot(state);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isOpenEffective = snap.weeklyPathNavOpen;
  const hasAccess = Boolean(auth?.user);

  useEffect(() => {
    setIsOpen(snap.weeklyPathNavOpen);
  }, [snap.weeklyPathNavOpen]);

  useEffect(() => {
    if (!hasAccess || !isOpenEffective) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [hasAccess, isOpenEffective]);

  const closeMenu = () => {
    const tutorialActive = document.body.classList.contains('tutorial-active');
    if (tutorialActive) return;
    setIsOpen(false);
    state.weeklyPathNavOpen = false;
    state.bitacoraNavOpen = false;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const tutorialActive = document.body.classList.contains('tutorial-active');
      if (tutorialActive) {
        return;
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!hasAccess) return;

    const load = async () => {
      try {
        setCursosLoading(true);
        const res = await fetch('/api/product/cursos-nav', { cache: 'no-store' });
        const data = await res.json().catch(() => ({ items: [] }));
        const items = Array.isArray(data.items) ? data.items : [];
        setCursoNavItems(
          items.filter(
            (x: unknown): x is CursoNavItem =>
              !!x &&
              typeof x === 'object' &&
              typeof (x as CursoNavItem).slug === 'string' &&
              typeof (x as CursoNavItem).label === 'string'
          )
        );
      } catch (e) {
        console.error('[WeeklyPathNavigator] cursos-nav', e);
        setCursoNavItems([]);
      } finally {
        setCursosLoading(false);
      }
    };

    load();
  }, [hasAccess]);

  useEffect(() => {
    if (!isNavigating || !navigationTarget) return;
    const query = searchParams?.toString();
    const currentUrl = query ? `${pathname}?${query}` : pathname;
    if (currentUrl === navigationTarget) {
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setNavigationTarget(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, isNavigating, navigationTarget]);

  if (!hasAccess) {
    return null;
  }

  const isAuthPage =
    pathname?.startsWith('/iniciar-sesion') ||
    pathname?.startsWith('/registro') ||
    pathname?.startsWith('/olvide-contrasena');

  const isOnboardingPage = pathname?.startsWith('/incorporacion');

  if (isAuthPage || isOnboardingPage) {
    return null;
  }

  const goPerfil = () => {
    const tutorialActive = document.body.classList.contains('tutorial-active');
    if (tutorialActive) return;
    const href = routes.user.perfil;
    closeMenu();
    setNavigationTarget(href);
    setIsNavigating(true);
    router.push(href);
  };

  const goCurso = (slug: string) => {
    const tutorialActive = document.body.classList.contains('tutorial-active');
    if (tutorialActive) return;
    const href = routes.navegation.membership.curso(slug);
    closeMenu();
    setNavigationTarget(href);
    setIsNavigating(true);
    router.push(href);
  };

  return (
    <div
      ref={dropdownRef}
      className={`fixed z-[200] ${isMobile ? 'inset-0 pointer-events-none' : 'bottom-6 right-6'}`}
    >
      <div className={`relative ${isMobile ? 'pointer-events-none' : ''}`}>
        <AnimatePresence>
          {isOpenEffective && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-black font-montserrat pointer-events-auto"
              ref={menuRef}
            >
              <div className="flex min-h-0 flex-1 flex-col justify-start items-end px-6 pb-10 pt-[5.5rem] md:px-10 md:pt-24 md:pb-14 lg:pr-24 lg:pl-8">
                <div className="flex w-full max-w-5xl flex-col items-end gap-10 md:gap-12 overflow-y-auto scrollbar-hide overscroll-contain max-h-full">
                  {auth?.user ? (
                    <button
                      type="button"
                      onClick={goPerfil}
                      className="max-w-full shrink-0 cursor-pointer text-right text-[#fff] transition-colors hover:text-white lg:text-[#d1cfcf6e] lg:hover:text-white"
                    >
                      <span className="mb-1 block font-light text-sm uppercase tracking-[0.18em] text-[#fff]/55 md:text-base">
                        Cuenta
                      </span>
                      <span className="block max-w-full overflow-x-auto scrollbar-hide whitespace-nowrap text-right text-3xl font-thin leading-none sm:text-4xl md:text-5xl lg:text-6xl">
                        Mi perfil
                      </span>
                    </button>
                  ) : null}

                  <div className="flex w-full flex-col items-end gap-5 md:gap-6">
                  {cursosLoading ? (
                    <p className="text-[#fff]/50 font-light text-right text-lg whitespace-nowrap">Cargando…</p>
                  ) : cursoNavItems.length === 0 ? (
                    <p className="text-[#fff]/50 font-light text-right text-lg">
                      No hay cursos publicados por ahora.
                    </p>
                  ) : (
                    cursoNavItems.map((item) => (
                      <button
                        key={item.slug}
                        type="button"
                        onClick={() => goCurso(item.slug)}
                        className="max-w-full shrink-0 cursor-pointer text-right text-[#fff] transition-colors hover:text-white lg:text-[#d1cfcf6e] lg:hover:text-white"
                      >
                        <span className="mb-1 block font-light text-sm uppercase tracking-[0.18em] text-[#fff]/55 md:text-base">
                          Método
                        </span>
                        <span className="block max-w-full overflow-x-auto scrollbar-hide whitespace-nowrap text-right text-3xl font-thin leading-none sm:text-4xl md:text-5xl lg:text-6xl">
                          {formatTitleCaseWords(item.label)}
                        </span>
                      </button>
                    ))
                  )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center font-montserrat bg-palette-ink/60 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-palette-stone/30 border-t-palette-sage rounded-full animate-spin" />
              <p className="text-palette-cream text-sm font-light">Redirigiendo...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeeklyPathNavigator;
