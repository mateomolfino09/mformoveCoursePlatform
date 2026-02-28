'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';
import state from '../../valtio';
import { routes } from '../../constants/routes';
import { IoCloseOutline } from 'react-icons/io5';
import { WHATSAPP_GROUP_LINK } from '../../constants/community';

interface Logbook {
  _id: string;
  month: number;
  year: number;
  monthName: string;
  title: string;
  description: string;
  createdAt: string;
  isBaseBitacora?: boolean;
}

const WeeklyPathNavigator = () => {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLogbook, setCurrentLogbook] = useState<Logbook | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const snap = useSnapshot(state);
  const isLibrary = pathname === routes.navegation.membership.library;
  const isIndex = pathname === routes.navegation.index;

  // En móvil el dropdown se controla desde el header (state.weeklyPathNavOpen)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // El botón Move Crew solo está en header/barra (siempre al lado de MENÚ); el panel se controla siempre con state.weeklyPathNavOpen
  const isOpenEffective = snap.weeklyPathNavOpen;

  // Sincronizar estado local con el global para closeMenu y tutorial
  useEffect(() => {
    setIsOpen(snap.weeklyPathNavOpen);
  }, [snap.weeklyPathNavOpen]);

  // Verificar si el usuario tiene acceso
  const hasAccess = auth.user && (
    auth.user.subscription?.active ||
    auth.user.isVip ||
    auth.user.rol === 'Admin'
  );

  // Función helper para cerrar el menú (respetando el estado del tutorial)
  const closeMenu = () => {
    const tutorialActive = document.body.classList.contains('tutorial-active');
    if (tutorialActive) return;
    setIsOpen(false);
    state.weeklyPathNavOpen = false;
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // NO cerrar el menú si el tutorial está activo
      const tutorialActive = document.body.classList.contains('tutorial-active');
      if (tutorialActive) {
        return; // No hacer nada si el tutorial está activo
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

  // Cargar caminos disponibles
  useEffect(() => {
    if (!hasAccess) return;

    const fetchLogbooks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bitacora/available', {
          credentials: 'include',
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          // Filtrar el camino base
          const filteredLogbooks = (data.logbooks || []).filter((lb: Logbook) => !lb.isBaseBitacora);
          setLogbooks(filteredLogbooks);

          // Determinar la camino actual basada en la URL o mes/año actual
          if (pathname === routes.navegation.membership.weeklyPath) {
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();

            const current = filteredLogbooks.find(
              (lb: Logbook) => lb.month === currentMonth && lb.year === currentYear
            ) || filteredLogbooks[0];

            setCurrentLogbook(current || null);
          }
        }
      } catch (error) {
        console.error('Error cargando caminos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogbooks();
  }, [hasAccess, pathname]);

  // Desactivar el loading solo cuando la navegación haya llegado al destino
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

  // Detectar si el tutorial está activo
  useEffect(() => {
    const checkTutorialActive = () => {
      setIsTutorialActive(document.body.classList.contains('tutorial-active'));
    };

    // Verificar inicialmente
    checkTutorialActive();

    // Observar cambios en el body
    const observer = new MutationObserver(checkTutorialActive);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Detectar páginas con fondo blanco
  const whiteBackgroundPages = [
    '/account',
    routes.navegation.membership.weeklyPath,
    '/mentorship',
    '/move-crew',
    '/events'
  ];
  const hasWhiteBackground = whiteBackgroundPages.some(page => pathname?.startsWith(page)) && !snap.systemNavOpen;


  // No mostrar si no tiene acceso
  if (!hasAccess) {
    return null;
  }

  const handleLogbookSelect = (logbook: Logbook) => {
    // NO permitir navegar si el tutorial está activo
    const tutorialActive = document.body.classList.contains('tutorial-active');
    if (tutorialActive) {
      return; // No hacer nada si el tutorial está activo
    }
    setCurrentLogbook(logbook);
    closeMenu();
    const targetUrl = `${routes.navegation.membership.weeklyPath}?id=${logbook._id}`;
    setNavigationTarget(targetUrl);
    setIsNavigating(true);
    // Navegar a la camino usando el ID
    router.push(`${routes.navegation.membership.weeklyPath}?id=${logbook._id}`);
  };

  const handleGoToWeeklyPath = () => {
    // NO permitir navegar si el tutorial está activo
    const tutorialActive = document.body.classList.contains('tutorial-active');
    if (tutorialActive) {
      return; // No hacer nada si el tutorial está activo
    }
    closeMenu();
    setNavigationTarget(routes.navegation.membership.weeklyPath);
    setIsNavigating(true);
    router.push(routes.navegation.membership.weeklyPath);
  };

  // No mostrar en páginas de autenticación
  const isAuthPage = pathname?.startsWith('/login') ||
                     pathname?.startsWith('/register') ||
                     pathname?.startsWith('/forget');

  // No mostrar en páginas de onboarding
  const isOnboardingPage = pathname?.startsWith('/onboarding');

  if (isAuthPage || isOnboardingPage) {
    return null;
  }

  // Función para abrir/cerrar el menú de Move Crew
  const handleMoveCrewMenu = () => {
    // NO permitir cerrar el menú si el tutorial está activo
    const tutorialActive = document.body.classList.contains('tutorial-active');
    if (tutorialActive && snap.systemNavOpen) {
      return; // No hacer nada si el tutorial está activo y el menú está abierto
    }
    if (tutorialActive && !snap.systemNavOpen) {
      state.systemNavOpen = true; // Solo permitir abrir si el tutorial está activo
      return;
    }
    state.systemNavOpen = !snap.systemNavOpen;
  };

  return (
    <div
      ref={dropdownRef}
      className={`fixed z-[200] ${isMobile ? 'inset-0 pointer-events-none' : `bottom-6 ${isLibrary ? 'right-6' : 'right-6'}`}`}
    >
      <div className={`relative ${isMobile ? 'pointer-events-none' : ''}`}>
        {/* Menú Move Crew: panel controlado solo por el botón del header/barra (siempre al lado de MENÚ) */}
        <AnimatePresence>
          {isOpenEffective && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[200] font-montserrat"
              ref={menuRef}
            >
              <div className="w-full h-full relative top-40 md:top-28 right-12 flex flex-col space-y-4 md:space-y-4 justify-start items-end mr-12 lg:mr-24 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    const tutorialActive = document.body.classList.contains('tutorial-active');
                    if (tutorialActive) return;
                    closeMenu();
                    setNavigationTarget(routes.navegation.membership.library);
                    setIsNavigating(true);
                    router.push(routes.navegation.membership.library);
                  }}
                  className="flex flex-col justify-end items-end -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] hover:text-[#fff] cursor-pointer text-left transition-colors"
                >
                  <h2 className="font-light lg:text-xl">Clases a Demanda</h2>
                  <h1 className="text-4xl font-thin lg:text-6xl md:text-4xl">Biblioteca</h1>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const tutorialActive = document.body.classList.contains('tutorial-active');
                    if (tutorialActive) return;
                    handleGoToWeeklyPath();
                  }}
                  className="flex flex-col justify-end items-end -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] hover:text-[#fff] cursor-pointer text-left transition-colors"
                >
                  <h2 className="font-light lg:text-xl">Programa de Movimiento</h2>
                  <h1 className="text-4xl font-thin lg:text-6xl md:text-4xl">Camino Semanal</h1>
                </button>

                <a
                  href={WHATSAPP_GROUP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    const tutorialActive = document.body.classList.contains('tutorial-active');
                    if (tutorialActive) { e.preventDefault(); return; }
                    closeMenu();
                  }}
                  className="flex flex-col justify-end items-end -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] hover:text-[#fff] cursor-pointer no-underline transition-colors"
                >
                  <h2 className="font-light lg:text-xl">WhatsApp</h2>
                  <h1 className="text-4xl font-thin lg:text-6xl md:text-4xl">Comunidad</h1>
                </a>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlay de loading cuando se está navegando */}
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
