'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon, 
  ChevronDownIcon,
  XMarkIcon,
  CalendarIcon,
  AcademicCapIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { BookOpenIcon as BookOpenIconSolid } from '@heroicons/react/24/solid';

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

const TELEGRAM_LINK = 'https://t.me/+_9hJulwT690yNWFh';

const BitacoraNavigator = () => {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLogbook, setCurrentLogbook] = useState<Logbook | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Verificar si el usuario tiene acceso
  const hasAccess = auth.user && (
    auth.user.subscription?.active || 
    auth.user.isVip || 
    auth.user.rol === 'Admin'
  );

  // Función helper para cerrar el menú (respetando el estado del tutorial)
  const closeMenu = () => {
    // NO permitir cerrar el menú si el tutorial está activo
    const tutorialActive = document.body.classList.contains('tutorial-active');
    if (tutorialActive) {
      return; // No hacer nada si el tutorial está activo
    }
    setIsOpen(false);
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

  // Cargar bitácoras disponibles
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
          setLogbooks(data.logbooks || []);
          
          // Determinar la bitácora actual basada en la URL o mes/año actual
          if (pathname === '/bitacora') {
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            
            const current = data.logbooks.find(
              (lb: Logbook) => lb.month === currentMonth && lb.year === currentYear
            ) || data.logbooks[0];
            
            setCurrentLogbook(current || null);
          }
        }
      } catch (error) {
        console.error('Error cargando bitácoras:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogbooks();
  }, [hasAccess, pathname]);

  // Detectar páginas con fondo blanco
  const whiteBackgroundPages = [
    '/account',
    '/bitacora',
    '/mentorship',
    '/move-crew',
    '/events'
  ];
  const hasWhiteBackground = whiteBackgroundPages.some(page => pathname?.startsWith(page));


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
    // Navegar a la bitácora usando el ID
    router.push(`/bitacora?id=${logbook._id}`);
  };

  const handleGoToBitacora = () => {
    // NO permitir navegar si el tutorial está activo
    const tutorialActive = document.body.classList.contains('tutorial-active');
    if (tutorialActive) {
      return; // No hacer nada si el tutorial está activo
    }
    closeMenu();
    router.push('/bitacora');
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

  return (
    <div 
      ref={dropdownRef}
      className="fixed bottom-6 right-6 z-[200]"
    >
      {/* Botón flotante */}
      <motion.button
        ref={buttonRef}
        onClick={() => {
          // NO permitir cerrar el menú si el tutorial está activo
          const tutorialActive = document.body.classList.contains('tutorial-active');
          if (tutorialActive && isOpen) {
            return; // No hacer nada si el tutorial está activo y el menú está abierto
          }
          if (tutorialActive && !isOpen) {
            setIsOpen(true); // Solo permitir abrir si el tutorial está activo
            return;
          }
          setIsOpen(!isOpen);
        }}
        className={`
          relative flex items-center gap-3 px-4 py-3 
          rounded-full transition-all cursor-pointer 
          shadow-md hover:shadow-lg 
          bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 
          backdrop-blur-md border border-amber-300/40 
          hover:from-amber-400/30 hover:via-orange-400/30 hover:to-rose-400/30
          font-montserrat font-medium text-sm text-white
          ${isOpen ? 'ring-2 ring-amber-300/50' : ''}
          z-10
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Navegador de Camino"
      >
        {/* Fondo negro para páginas con fondo blanco - mismo tamaño y animación que el botón */}
        {hasWhiteBackground && (
          <>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="absolute inset-0 bg-black/20 z-0 rounded-full border border-amber-300/40"
          />
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="absolute inset-0 from-amber-500/90 via-orange-500/90 to-rose-500/90 
          backdrop-blur-md
           z-1 rounded-full"
          />
          
          </>
          
        )}
        <BookOpenIconSolid className="h-5 w-5 text-white relative z-10" />
        <span className="hidden sm:inline relative z-10">Camino</span>
        <ChevronDownIcon 
          className={`h-4 w-4 text-white transition-transform duration-200 relative z-10 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay para mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[199] sm:hidden"
              onClick={closeMenu}
            />
            
            {/* Contenido del dropdown */}
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`
                absolute bottom-full right-0 mb-3
                w-[90vw] sm:w-80 max-w-sm
                bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 
                backdrop-blur-md rounded-2xl shadow-2xl
                border border-amber-300/40
                overflow-hidden
                z-[201]
              `}
            >
              {/* Fondo negro para páginas con fondo blanco - mismo tamaño y animación que el menú */}
              {hasWhiteBackground && (
                <>
 
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black/70 z-1 rounded-2xl from-amber-500/90 via-orange-500/90 to-rose-500/90"
                />
                
                </>

                
              )}
              
              {/* Header */}
              <div className="p-4 text-white border-b border-amber-300/20 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpenIconSolid className="h-5 w-5" />
                    <h3 className="font-montserrat font-semibold text-base">
                      Navegador
                    </h3>
                  </div>
                  <button
                    onClick={closeMenu}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Cerrar"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-xs text-white/80 mt-1 font-montserrat font-light">
                  Accede a clases, tu camino y la comunidad
                </p>
              </div>

              {/* Contenido */}
              <div className="max-h-[60vh] overflow-y-auto z-10 relative">
                {/* Enlaces principales */}
                <div className="py-2 border-b border-amber-300/20">
                  {/* Biblioteca de Clases */}
                  <button
                    onClick={() => {
                      // NO permitir navegar si el tutorial está activo
                      const tutorialActive = document.body.classList.contains('tutorial-active');
                      if (tutorialActive) {
                        return; // No hacer nada si el tutorial está activo
                      }
                      closeMenu();
                      router.push('/home');
                    }}
                    className={`
                      w-full px-4 py-3 text-left
                      hover:bg-white/10 transition-colors
                      border-b border-amber-300/10 last:border-b-0
                      font-montserrat
                      ${pathname === '/home' ? 'bg-white/10 border-l-4 border-l-amber-400' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <AcademicCapIcon className="h-5 w-5 text-white/90 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white text-sm">
                          Biblioteca de Clases
                        </p>
                        <p className="text-xs text-white/70 font-light">
                          Accede a todas las clases disponibles
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Bitácora Actual */}
                  <button
                    onClick={handleGoToBitacora}
                    className={`
                      w-full px-4 py-3 text-left
                      hover:bg-white/10 transition-colors
                      border-b border-amber-300/10 last:border-b-0
                      font-montserrat
                      ${pathname === '/bitacora' ? 'bg-white/10 border-l-4 border-l-amber-400' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpenIcon className="h-5 w-5 text-white/90 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white text-sm">
                          Tu Camino
                        </p>
                        <p className="text-xs text-white/70 font-light">
                          Ver contenido del mes actual
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Grupo de Telegram */}
                  <a
                    href={TELEGRAM_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      // NO permitir navegar si el tutorial está activo
                      const tutorialActive = document.body.classList.contains('tutorial-active');
                      if (tutorialActive) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                      }
                      closeMenu();
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-amber-300/10 last:border-b-0 font-montserrat block"
                  >
                    <div className="flex items-center gap-2">
                      <PaperAirplaneIcon className="h-5 w-5 text-white/90 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white text-sm">
                          Grupo de Telegram
                        </p>
                        <p className="text-xs text-white/70 font-light">
                          Únete a la comunidad
                        </p>
                      </div>
                    </div>
                  </a>
                </div>

                {/* Lista de bitácoras disponibles */}
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white/60" />
                    <p className="text-sm text-white/80 mt-2 font-montserrat font-light">
                      Cargando tu camino...
                    </p>
                  </div>
                ) : logbooks.length === 0 ? (
                  <div className="p-6 text-center">
                    <CalendarIcon className="h-12 w-12 text-white/40 mx-auto mb-2" />
                    <p className="text-sm text-white/70 font-montserrat font-light">
                      No hay caminos disponibles
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-white/60 uppercase tracking-wide font-montserrat">
                      Caminos Disponibles
                    </div>
                    {logbooks.map((logbook) => {
                      const isCurrent = currentLogbook?._id === logbook._id;
                      return (
                        <button
                          key={logbook._id}
                          onClick={() => {
                            // NO permitir navegar si el tutorial está activo
                            const tutorialActive = document.body.classList.contains('tutorial-active');
                            if (tutorialActive) {
                              return; // No hacer nada si el tutorial está activo
                            }
                            handleLogbookSelect(logbook);
                          }}
                          className={`
                            w-full px-4 py-3 text-left
                            hover:bg-white/10 transition-colors
                            border-b border-amber-300/10 last:border-b-0
                            font-montserrat
                            ${isCurrent ? 'bg-white/10 border-l-4 border-l-amber-400' : ''}
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <CalendarIcon className="h-5 w-5 text-white/90 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm">
                                {logbook.isBaseBitacora ? logbook.title : `${logbook.monthName} ${logbook.year}`}
                              </p>
                              {logbook.title && !logbook.isBaseBitacora && (
                                <p className="text-xs text-white/70 font-light mt-0.5 truncate">
                                  {logbook.title}
                                </p>
                              )}
                            </div>
                            {isCurrent && (
                              <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BitacoraNavigator;

