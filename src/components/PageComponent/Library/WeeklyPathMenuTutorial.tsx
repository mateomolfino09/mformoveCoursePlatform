'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowRightIcon, FireIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSnapshot } from 'valtio';
import { routes } from '../../../constants/routes';
import state from '../../../valtio';

interface WeeklyPathMenuTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
}

const WeeklyPathMenuTutorial = ({ isOpen, onComplete }: WeeklyPathMenuTutorialProps) => {
  const router = useRouter();
  const snap = useSnapshot(state);
  const navigatorRef = useRef<HTMLElement | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;
  const [targetPosition, setTargetPosition] = useState<{ top: number; left: number } | null>(null);
  const [boxPosition, setBoxPosition] = useState<{ top: number; left: number } | null>(null);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const MOBILE_BOTTOM_PADDING = 24;
  const MOBILE_BOX_HEIGHT = 220;
  
  // Valores de bottom específicos por paso en mobile
  const getMobileBottom = (step: number): number => {
    switch (step) {
      case 2: return 240;
      case 3: return 300;
      case 4: return 150;
      default: return MOBILE_BOTTOM_PADDING;
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Inicializar el tutorial cuando isOpen se vuelve true
  useEffect(() => {
    if (isOpen && !showTutorial) {
      // Iniciar directamente con el paso 1
      setCurrentStep(1);
      setShowTutorial(true);
    }
  }, [isOpen, showTutorial]);

  // Paso 1: detectar clic en el botón Move Crew y pasar al paso 2
  useEffect(() => {
    if (!isOpen || !showTutorial || currentStep !== 1) return;
    
    const handleMoveCrewClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const moveCrewButton = target.closest('[data-tutorial-move-crew-target]');
      if (!moveCrewButton) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      // Ocultar la flecha inmediatamente al hacer clic
      setIsTransitioning(true);
      
      // Abrir el menú y pasar al paso 2
      state.weeklyPathNavOpen = true;
      setMenuOpen(true);
      setTimeout(() => {
        setTimeout(() => {
          handleNextStep(2);
        }, 200);
      }, 300);
    };
    
    document.addEventListener('click', handleMoveCrewClick, { capture: true });
    
    return () => {
      document.removeEventListener('click', handleMoveCrewClick, { capture: true });
    };
  }, [isOpen, showTutorial, currentStep]);

  // Paso 1: subrayar el botón Move Crew del header
  useEffect(() => {
    if (!isOpen || !showTutorial || currentStep !== 1) {
      // Limpiar subrayado cuando no estamos en paso 1
      const moveCrewButtons = document.querySelectorAll('[data-tutorial-move-crew-target]');
      moveCrewButtons.forEach((btn) => {
        const button = btn as HTMLElement;
        button.style.removeProperty('border-bottom');
        button.style.removeProperty('padding-bottom');
        button.style.removeProperty('display');
      });
      return;
    }

    // Aplicar subrayado al botón Move Crew
    const applyUnderline = () => {
      const moveCrewButtons = document.querySelectorAll('[data-tutorial-move-crew-target]');
      moveCrewButtons.forEach((btn) => {
        const button = btn as HTMLElement;
        // Buscar el span que contiene el texto "Move Crew" o "Cerrar"
        const spans = button.querySelectorAll('span');
        const textSpan = Array.from(spans).find(span => 
          span.textContent?.includes('Move Crew') || span.textContent?.includes('Cerrar')
        ) || button;
        
        // Aplicar subrayado al elemento de texto
        textSpan.style.setProperty('border-bottom', '2px solid rgba(255, 255, 255, 0.9)', 'important');
        textSpan.style.setProperty('padding-bottom', '0.25rem', 'important');
        textSpan.style.setProperty('display', 'inline-block', 'important');
      });
    };

    // Aplicar después de un pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(applyUnderline, 100);
    return () => clearTimeout(timer);
  }, [isOpen, showTutorial, currentStep]);

  // Detectar cuando el menú está abierto y bloquear su cierre
  useEffect(() => {
    if (!isOpen) {
      setMenuOpen(false);
      setShowTutorial(false);
      setCurrentStep(1); // Resetear al paso 1 cuando se cierra el tutorial
      setIsExiting(false);
      document.body.classList.remove('tutorial-active');
      return;
    }

    // Agregar clase al body para indicar que el tutorial está activo
    // Solo agregar cuando showTutorial es true para evitar conflictos
    if (showTutorial) {
      document.body.classList.add('tutorial-active');
    } else {
      document.body.classList.remove('tutorial-active');
    }

    // Bloquear COMPLETAMENTE el cierre del menú durante el tutorial
    // Usar capture phase para interceptar ANTES que el WeeklyPathNavigator
    const preventMenuClose = (e: MouseEvent) => {
      // Solo bloquear si el tutorial está visible (showTutorial)
      if (!showTutorial) {
        return; // Permitir comportamiento normal si el tutorial no está visible
      }
      
      const target = e.target as HTMLElement;
      const navigator = target.closest('[class*="fixed bottom-6 right-6"]');
      const tutorialBox = target.closest('.tutorial-box');
      const tutorialOverlay = target.closest('[class*="fixed inset-0 z-[199]"]');
      const dropdown = document.querySelector('[class*="absolute bottom-full"]');
      const fullScreenPanel = document.querySelector('[class*="fixed inset-0"][class*="bg-black"]');
      const isDropdownVisible = (dropdown && 
                                window.getComputedStyle(dropdown).display !== 'none' && 
                                dropdown.getBoundingClientRect().width > 0) ||
                               (fullScreenPanel && fullScreenPanel.getBoundingClientRect().width > 0);
      
      // Permitir que los botones del tutorial funcionen normalmente
      const clickedButton = target.closest('button');
      const isTutorialButton = clickedButton && tutorialBox && tutorialBox.contains(clickedButton);
      
      // También verificar si el clic es directamente en el tutorial-box o en sus hijos
      const isInsideTutorialBox = tutorialBox && (
        tutorialBox.contains(target) || 
        target === tutorialBox ||
        target.closest('.tutorial-box') === tutorialBox
      );
      
      // Verificar si el texto del botón indica que es un botón de navegación del tutorial
      const isNavigationButton = clickedButton && (
        clickedButton.textContent?.includes('Anterior') ||
        clickedButton.textContent?.includes('Siguiente') ||
        clickedButton.textContent?.includes('Ir a Camino Base')
      );
      
      // Si es un botón del tutorial, cualquier clic dentro del tutorial-box, o un botón de navegación, permitir que funcione
      if (isTutorialButton || (isInsideTutorialBox && clickedButton) || isNavigationButton) {
        return; // No bloquear, permitir que el botón funcione
      }
      
      // Permitir que el botón Move Crew (navigator o header/barra) abra el menú SOLO si está cerrado
      const isMoveCrewButton = (navigator && target.closest('button[aria-label="Navegador de Camino"]')) ||
        (target.closest('button') && (target.closest('button')?.textContent?.trim() === 'Move Crew' || target.closest('button')?.textContent?.includes('Cerrar')));
      if (isMoveCrewButton) {
        // Si el menú está visible, NO permitir que se cierre (bloquear el toggle)
        if (isDropdownVisible) {
          e.stopPropagation();
          e.preventDefault();
          e.stopImmediatePropagation();
          return false;
        }
        // Si el menú está cerrado, permitir que se abra
        return;
      }
      
      // BLOQUEAR TODOS los demás clics que podrían cerrar el menú
      // Durante el tutorial, el menú DEBE estar siempre abierto
      e.stopPropagation();
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    };

    // Agregar listener con capture phase (true) para interceptar ANTES que otros listeners
    // El WeeklyPathNavigator también usa capture, así que debemos estar primero
    const options = { capture: true, passive: false };
    document.addEventListener('mousedown', preventMenuClose, options);
    document.addEventListener('click', preventMenuClose, options);

    const checkMenuOpen = () => {
      const dropdown = document.querySelector('[class*="absolute bottom-full"]');
      const fullScreenPanel = document.querySelector('[class*="fixed inset-0"][class*="bg-black"]');
      const isVisible = (dropdown && 
                       window.getComputedStyle(dropdown).display !== 'none' && 
                       dropdown.getBoundingClientRect().width > 0) ||
                       (fullScreenPanel && fullScreenPanel.getBoundingClientRect().width > 0);
      
      if (isVisible && !menuOpen) {
        setMenuOpen(true);
        setTimeout(() => setShowTutorial(true), 300);
      } else if (!isVisible && menuOpen && showTutorial) {
        // Si el menú se cerró durante el tutorial, forzar que se mantenga abierto
        state.weeklyPathNavOpen = true;
      }
    };

    // Verificar periódicamente si el menú está abierto
    const interval = setInterval(checkMenuOpen, 200);
    
    return () => {
      clearInterval(interval);
      const options = { capture: true, passive: false };
      document.removeEventListener('mousedown', preventMenuClose, options as any);
      document.removeEventListener('click', preventMenuClose, options as any);
      document.body.classList.remove('tutorial-active');
    };
  }, [isOpen, menuOpen, showTutorial]);

  useEffect(() => {
    if (!isOpen) return;

    // Establecer posición por defecto primero
    const navigator = document.querySelector('[class*="fixed bottom-6 right-6"]');
    if (navigator) {
      const rect = navigator.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      const boxWidth = isMobile ? Math.min(320, window.innerWidth - 32) : 384;
      const boxHeight = isMobile ? MOBILE_BOX_HEIGHT : 250;
      const spacing = 20;
      
      setTargetPosition({
        top: rect.top,
        left: rect.left,
      });
      
      let boxTop: number;
      let boxLeft: number;
      let arrowX: number;
      let arrowY: number;
      
      if (isMobile) {
        // Mobile: paso 1 centrado, pasos 2-4 abajo
        if (currentStep === 1) {
          boxTop = window.innerHeight / 2 - MOBILE_BOX_HEIGHT / 2;
          boxLeft = (window.innerWidth - boxWidth) / 2;
          arrowX = boxLeft + boxWidth / 2;
          arrowY = boxTop + MOBILE_BOX_HEIGHT / 2;
        } else {
          const mobileBottom = getMobileBottom(currentStep);
          boxTop = window.innerHeight - MOBILE_BOX_HEIGHT - mobileBottom;
          boxLeft = (window.innerWidth - boxWidth) / 2;
          arrowX = boxLeft + boxWidth / 2;
          arrowY = boxTop + MOBILE_BOX_HEIGHT;
        }
      } else {
        // Web: En el paso 1, centrar el modal en la pantalla
        if (currentStep === 1) {
          boxTop = window.innerHeight / 2 - boxHeight / 2;
          boxLeft = window.innerWidth / 2 - boxWidth / 2;
          arrowX = boxLeft + boxWidth / 2;
          arrowY = boxTop + boxHeight / 2;
        } else {
          // Otros pasos: a la izquierda del menú
          const stepOffset = -20;
          boxTop = rect.top - boxHeight / 2 + stepOffset;
          boxLeft = Math.max(16, rect.left - boxWidth - spacing - 50);
          arrowX = boxLeft + boxWidth;
          arrowY = boxTop + boxHeight / 2;
        }
      }
      
      setBoxPosition({ top: boxTop, left: boxLeft });
      setArrowStart({ x: arrowX, y: arrowY });
    } else {
      // Si no hay navigator, usar posición de pantalla
      const isMobile = window.innerWidth < 768;
      const boxWidth = isMobile ? Math.min(320, window.innerWidth - 32) : 384;
      const boxHeight = isMobile ? MOBILE_BOX_HEIGHT : 250;
      setTargetPosition({
        top: window.innerHeight - 100,
        left: window.innerWidth - 100,
      });
      if (isMobile) {
        if (currentStep === 1) {
          setBoxPosition({
            top: window.innerHeight / 2 - MOBILE_BOX_HEIGHT / 2,
            left: (window.innerWidth - boxWidth) / 2,
          });
          setArrowStart({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          });
        } else {
          const mobileBottom = getMobileBottom(currentStep);
          setBoxPosition({
            top: window.innerHeight - MOBILE_BOX_HEIGHT - mobileBottom,
            left: (window.innerWidth - boxWidth) / 2,
          });
          setArrowStart({
            x: window.innerWidth / 2,
            y: window.innerHeight - mobileBottom - MOBILE_BOX_HEIGHT / 2,
          });
        }
      } else {
        if (currentStep === 1) {
          // Paso 1: centrar en desktop
          setBoxPosition({
            top: window.innerHeight / 2 - boxHeight / 2,
            left: window.innerWidth / 2 - boxWidth / 2,
          });
          setArrowStart({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          });
        } else {
          setBoxPosition({
            top: window.innerHeight / 2 - 125,
            left: window.innerWidth - 500,
          });
          setArrowStart({
            x: window.innerWidth - 116,
            y: window.innerHeight / 2,
          });
        }
      }
    }

    // Calcular la posición del elemento objetivo según el paso
    const calculateTargetPosition = () => {
      // Remover todos los resaltados anteriores (bordes, subrayados, etc.)
      const allItems = document.querySelectorAll('button, a, div, h2');
      allItems.forEach((item) => {
        const htmlItem = item as HTMLElement;
        // Remover resaltados antiguos (ámbar, cyan) y subrayados
        if (htmlItem.style.boxShadow && (htmlItem.style.boxShadow.includes('251, 191, 36') || htmlItem.style.boxShadow.includes('34, 211, 238'))) {
          htmlItem.style.removeProperty('box-shadow');
          htmlItem.style.removeProperty('border');
          htmlItem.style.removeProperty('border-radius');
          htmlItem.style.removeProperty('background-color');
          htmlItem.style.removeProperty('opacity');
          htmlItem.style.removeProperty('cursor');
          htmlItem.style.removeProperty('transition');
          htmlItem.style.removeProperty('color');
        }
        // Remover subrayados (border-bottom, padding-bottom, margin-bottom, display)
        if (htmlItem.style.borderBottom || htmlItem.style.paddingBottom || htmlItem.style.marginBottom || htmlItem.style.display === 'inline-block') {
          htmlItem.style.removeProperty('border-bottom');
          htmlItem.style.removeProperty('padding-bottom');
          htmlItem.style.removeProperty('margin-bottom');
          if (htmlItem.style.display === 'inline-block') {
            htmlItem.style.removeProperty('display');
          }
        }
      });
      

      // Menú Move Crew: panel full-screen (fixed inset-0 bg-black) o legacy dropdown
      const getMenuRoot = (): HTMLElement | null => {
        const panel = document.querySelector('[class*="fixed inset-0"][class*="bg-black"]');
        if (panel && panel.getBoundingClientRect().width > 0) return panel as HTMLElement;
        return document.querySelector('[class*="absolute bottom-full"]') as HTMLElement | null;
      };

      // Intentar encontrar el elemento con múltiples intentos
      const findElement = (attempt = 0) => {
        if (attempt > 20) {
          // Si no se encuentra después de 20 intentos, mantener posición por defecto
          return;
        }

        const menuRoot = getMenuRoot();
        // Verificar que el menú esté realmente abierto y visible
        if (!menuRoot || menuRoot.getBoundingClientRect().width === 0) {
          // Si el menú no está abierto, esperar un poco más antes de reintentar
          setTimeout(() => findElement(attempt + 1), 150);
          return;
        }
        
        let targetElement: HTMLElement | null = null;

        if (currentStep === 1) {
          // Paso 1: No necesita buscar elementos del menú (el menú aún no está abierto)
          // El modal se centrará sin necesidad de targetElement
          targetElement = null;
        } else if (currentStep === 2) {
          // Paso 2: Apuntar al botón "El Camino" (Programa de Movimiento)
          if (menuRoot) {
            const buttons = menuRoot.querySelectorAll('button');
            targetElement = Array.from(buttons).find(
              (el) => (el.textContent || '').includes('El Camino')
            ) as HTMLElement;
          }
        } else if (currentStep === 3) {
          // Paso 3: Apuntar a "Biblioteca de Clases"
          if (menuRoot) {
            const buttons = menuRoot.querySelectorAll('button');
            targetElement = Array.from(buttons).find(
              (el) => (el.textContent || '').includes('Biblioteca')
            ) as HTMLElement;
          }
        } else if (currentStep === 4) {
          // Paso 4: Apuntar a "Telegram"
          if (menuRoot) {
            const links = menuRoot.querySelectorAll('a');
            targetElement = Array.from(links).find(
              (el) => (el.textContent || '').includes('Telegram')
            ) as HTMLElement;
          }
        }

        if (targetElement && targetElement.getBoundingClientRect().width > 0) {
          // Aplicar subrayado según el paso (solo pasos 2-4, el paso 1 no tiene menú abierto)
          if (currentStep === 1) {
            // Paso 1: No necesita subrayado (menú no está abierto)
          } else if (currentStep === 2) {
            // Paso 2: Subrayar "Programa de Movimiento" (h2) dentro del botón "El Camino"
            const h2Element = targetElement.querySelector('h2');
            if (h2Element) {
              h2Element.style.setProperty('border-bottom', '2px solid rgba(255, 255, 255, 0.9)', 'important');
              h2Element.style.setProperty('padding-bottom', '0.25rem', 'important');
              h2Element.style.setProperty('display', 'inline-block', 'important');
            }
            targetElement.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
          } else if (currentStep === 3) {
            // Paso 3: Subrayar "Biblioteca" - buscar el h2 dentro del botón
            const h2Element = targetElement.querySelector('h2');
            if (h2Element) {
              h2Element.style.setProperty('border-bottom', '2px solid rgba(255, 255, 255, 0.9)', 'important');
              h2Element.style.setProperty('padding-bottom', '0.25rem', 'important');
              h2Element.style.setProperty('display', 'inline-block', 'important');
            }
          } else if (currentStep === 4) {
            // Paso 4: Subrayar "Telegram" - buscar el h2 "Comunidad" dentro del link
            const h2Element = targetElement.querySelector('h2');
            if (h2Element) {
              h2Element.style.setProperty('border-bottom', '2px solid rgba(255, 255, 255, 0.9)', 'important');
              h2Element.style.setProperty('padding-bottom', '0.25rem', 'important');
              h2Element.style.setProperty('display', 'inline-block', 'important');
            }
          }

          // Calcular posición del elemento objetivo
          const rect = targetElement.getBoundingClientRect();
          setTargetPosition({
            top: rect.top + rect.height / 2,
            left: rect.left + rect.width / 2,
          });

          // Calcular posición del cuadro
          const isMobile = window.innerWidth < 768;
          const boxWidth = isMobile ? Math.min(320, window.innerWidth - 32) : 384; // Más estrecho en mobile
          const boxHeight = 250;
          const spacing = 20;
          
          let boxTop: number;
          let boxLeft: number;
          let arrowX: number;
          let arrowY: number;
          
          if (isMobile) {
            if (currentStep === 1) {
              boxTop = window.innerHeight / 2 - MOBILE_BOX_HEIGHT / 2;
              boxLeft = (window.innerWidth - boxWidth) / 2;
              arrowX = boxLeft + boxWidth / 2;
              arrowY = boxTop + MOBILE_BOX_HEIGHT / 2;
            } else {
              const mobileBottom = getMobileBottom(currentStep);
              boxTop = window.innerHeight - MOBILE_BOX_HEIGHT - mobileBottom;
              boxLeft = (window.innerWidth - boxWidth) / 2;
              arrowX = boxLeft + boxWidth / 2;
              arrowY = boxTop + MOBILE_BOX_HEIGHT;
            }
          } else {
            // Web: a la izquierda del menú
            const stepOffset = -10;
            boxTop = rect.top + rect.height / 2 - boxHeight / 2 + stepOffset;
            boxLeft = Math.max(16, rect.left - boxWidth - spacing - 50);
            arrowX = boxLeft + boxWidth;
            arrowY = boxTop + boxHeight / 2;
          }
          
          setBoxPosition({ top: boxTop, left: boxLeft });
          setArrowStart({ x: arrowX, y: arrowY });
        } else {
          if (currentStep === 1) {
            const isMobile = window.innerWidth < 768;
            const boxWidth = isMobile ? Math.min(320, window.innerWidth - 32) : 384;
            const boxHeight = isMobile ? MOBILE_BOX_HEIGHT : 250;
            const boxTop = isMobile
              ? (currentStep === 1 
                  ? window.innerHeight / 2 - MOBILE_BOX_HEIGHT / 2
                  : window.innerHeight - MOBILE_BOX_HEIGHT - getMobileBottom(currentStep))
              : window.innerHeight / 2 - boxHeight / 2;
            const boxLeft = (window.innerWidth - boxWidth) / 2;
            setBoxPosition({ top: boxTop, left: boxLeft });
            return;
          }
          // Para otros pasos, reintentar después de un breve delay
          setTimeout(() => findElement(attempt + 1), 100);
        }
      };

      // Esperar un poco para que el DOM se actualice
      setTimeout(() => findElement(), 100);
    };

    calculateTargetPosition();
  }, [isOpen, currentStep, showTutorial]);

  // Efecto para mantener el menú abierto cuando cambia el paso (solo pasos 2-4, paso 1 no requiere menú abierto)
  useEffect(() => {
    if (!isOpen || !showTutorial) return;
    // Paso 1 no requiere menú abierto, saltar este efecto
    if (currentStep === 1) return;

    // Verificar que el menú esté abierto después de cambiar de paso (pasos 2-4)
    const checkAndKeepOpen = () => {
      const dropdown = document.querySelector('[class*="absolute bottom-full"]');
      const fullScreenPanel = document.querySelector('[class*="fixed inset-0"][class*="bg-black"]');
      const isVisible = (dropdown && 
                       window.getComputedStyle(dropdown).display !== 'none' && 
                       dropdown.getBoundingClientRect().width > 0) ||
                       (fullScreenPanel && fullScreenPanel.getBoundingClientRect().width > 0);
      
      if (!isVisible) {
        state.weeklyPathNavOpen = true;
      }
    };

    // Verificar inmediatamente y después de un breve delay
    checkAndKeepOpen();
    const timer = setTimeout(checkAndKeepOpen, 200);
    
    return () => clearTimeout(timer);
  }, [currentStep, isOpen, showTutorial]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      const newStep = currentStep + 1;
      
      // Si estamos en paso 1 y vamos al paso 2, abrir el menú primero
      if (currentStep === 1 && newStep === 2) {
        state.weeklyPathNavOpen = true;
        setMenuOpen(true);
        // Esperar a que el menú se abra antes de mostrar el paso 2
        setTimeout(() => {
          setIsTransitioning(true);
          // Continuar con el cálculo de posición y cambio de paso después
          setTimeout(() => {
            handleNextStep(newStep);
          }, 200);
        }, 300);
        return;
      }
      
      // Para otros pasos, continuar normalmente
      handleNextStep(newStep);
    } else {
      handleComplete();
    }
  };

  const handleNextStep = (newStep: number) => {
      // Ocultar el modal INMEDIATAMENTE
      setIsTransitioning(true);
      
      // Calcular la nueva posición ANTES de cambiar el paso usando la misma lógica del useEffect
      const getMenuRootForStep = () => {
        const panel = document.querySelector('[class*="fixed inset-0"][class*="bg-black"]');
        if (panel && panel.getBoundingClientRect().width > 0) return panel as HTMLElement;
        return document.querySelector('[class*="absolute bottom-full"]') as HTMLElement | null;
      };

      const calculateNewPositionForStep = (step: number) => {
        const navigator = document.querySelector('[class*="fixed bottom-6 right-6"]');
        const menuRoot = getMenuRootForStep();
        if (!navigator && !menuRoot) return;
        
        const rect = navigator?.getBoundingClientRect() ?? (menuRoot?.getBoundingClientRect() || { top: 0, left: 0 });
        const isMobile = window.innerWidth < 768;
        const boxWidth = isMobile ? Math.min(320, window.innerWidth - 32) : 384;
        const boxHeight = 250;
        const spacing = 20;
        
        // Limpiar subrayados anteriores de todos los elementos del menú
        if (menuRoot) {
          const allItems = menuRoot.querySelectorAll('button, a, h2');
          allItems.forEach((item) => {
            const htmlItem = item as HTMLElement;
            htmlItem.style.removeProperty('border-bottom');
            htmlItem.style.removeProperty('padding-bottom');
            htmlItem.style.removeProperty('margin-bottom');
            htmlItem.style.removeProperty('background-color');
            if (htmlItem.style.display === 'inline-block') {
              htmlItem.style.removeProperty('display');
            }
          });
        }
        
        let targetElement: HTMLElement | null = null;
        
        if (step === 1 && menuRoot) {
          const firstContent = menuRoot.querySelector('div[class*="w-full"][class*="h-full"]') || menuRoot.querySelector('div:first-child');
          targetElement = (firstContent as HTMLElement) || menuRoot;
        } else if (step === 2 && menuRoot) {
          const buttons = menuRoot.querySelectorAll('button');
          targetElement = Array.from(buttons).find((el) => (el.textContent || '').includes('El Camino')) as HTMLElement;
        } else if (step === 3 && menuRoot) {
          const buttons = menuRoot.querySelectorAll('button');
          targetElement = Array.from(buttons).find((el) => (el.textContent || '').includes('Biblioteca')) as HTMLElement;
        } else if (step === 4 && menuRoot) {
          const links = menuRoot.querySelectorAll('a');
          targetElement = Array.from(links).find((el) => (el.textContent || '').includes('Telegram')) as HTMLElement;
        }
        
        // Aplicar subrayado al elemento objetivo
        if (targetElement && targetElement.getBoundingClientRect().width > 0) {
          if (step === 2) {
            const h2Element = targetElement.querySelector('h2');
            if (h2Element) {
              h2Element.style.setProperty('border-bottom', '2px solid rgba(255, 255, 255, 0.9)', 'important');
              h2Element.style.setProperty('padding-bottom', '0.25rem', 'important');
              h2Element.style.setProperty('display', 'inline-block', 'important');
            }
            targetElement.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
          } else if (step === 3) {
            const h2Element = targetElement.querySelector('h2');
            if (h2Element) {
              h2Element.style.setProperty('border-bottom', '2px solid rgba(255, 255, 255, 0.9)', 'important');
              h2Element.style.setProperty('padding-bottom', '0.25rem', 'important');
              h2Element.style.setProperty('display', 'inline-block', 'important');
            }
            targetElement.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
          } else if (step === 4) {
            const h2Element = targetElement.querySelector('h2');
            if (h2Element) {
              h2Element.style.setProperty('border-bottom', '2px solid rgba(255, 255, 255, 0.9)', 'important');
              h2Element.style.setProperty('padding-bottom', '0.25rem', 'important');
              h2Element.style.setProperty('display', 'inline-block', 'important');
            }
            targetElement.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
          }
        }
        
        let boxTop: number;
        let boxLeft: number;
        
        if (targetElement && targetElement.getBoundingClientRect().width > 0) {
          const targetRect = targetElement.getBoundingClientRect();
          if (isMobile) {
            if (step === 1) {
              boxTop = window.innerHeight / 2 - MOBILE_BOX_HEIGHT / 2;
              boxLeft = (window.innerWidth - boxWidth) / 2;
            } else {
              const mobileBottom = getMobileBottom(step);
              boxTop = window.innerHeight - MOBILE_BOX_HEIGHT - mobileBottom;
              boxLeft = (window.innerWidth - boxWidth) / 2;
            }
          } else {
            if (step === 1) {
              boxTop = window.innerHeight / 2 - boxHeight / 2;
              boxLeft = window.innerWidth / 2 - boxWidth / 2;
            } else {
              const stepOffset = -10;
              boxTop = targetRect.top + targetRect.height / 2 - boxHeight / 2 + stepOffset;
              boxLeft = Math.max(16, targetRect.left - boxWidth - spacing);
            }
          }
        } else {
          if (isMobile) {
            if (step === 1) {
              boxTop = window.innerHeight / 2 - MOBILE_BOX_HEIGHT / 2;
              boxLeft = (window.innerWidth - boxWidth) / 2;
            } else {
              const mobileBottom = getMobileBottom(step);
              boxTop = window.innerHeight - MOBILE_BOX_HEIGHT - mobileBottom;
              boxLeft = (window.innerWidth - boxWidth) / 2;
            }
          } else {
            if (step === 1) {
              boxTop = window.innerHeight / 2 - boxHeight / 2;
              boxLeft = window.innerWidth / 2 - boxWidth / 2;
            } else {
              const stepOffset = -20;
              boxTop = rect.top - boxHeight / 2 + stepOffset;
              boxLeft = Math.max(16, rect.left - boxWidth - spacing);
            }
          }
        }
        
        setBoxPosition({ top: boxTop, left: boxLeft });
      };
      
      setTimeout(() => {
        calculateNewPositionForStep(newStep);
        setCurrentStep(newStep);
        
        // Mostrar el modal después de que la posición esté establecida
        setTimeout(() => {
          setIsTransitioning(false);
        }, 150);
      }, 50);
  };

  const handlePrevious = () => {
    if (currentStep > 2 && !isTransitioning) {
      setIsTransitioning(true);
      
      const newStep = currentStep - 1;
      
      // Definir la función para calcular la nueva posición (similar a handleNext)
      const getMenuRootForStep = () => {
        const panel = document.querySelector('[class*="fixed inset-0"][class*="bg-black"]');
        if (panel && panel.getBoundingClientRect().width > 0) return panel as HTMLElement;
        return document.querySelector('[class*="absolute bottom-full"]') as HTMLElement | null;
      };

      const calculateNewPositionForStep = (step: number) => {
        const navigator = document.querySelector('[class*="fixed bottom-6 right-6"]');
        const menuRoot = getMenuRootForStep();
        if (!navigator && !menuRoot) return;
        
        const rect = navigator?.getBoundingClientRect() ?? (menuRoot?.getBoundingClientRect() || { top: 0, left: 0 });
        const isMobile = window.innerWidth < 768;
        const boxWidth = isMobile ? Math.min(320, window.innerWidth - 32) : 384;
        const boxHeight = 250;
        const spacing = 20;
        
        // Limpiar subrayados anteriores de todos los elementos del menú
        if (menuRoot) {
          const allItems = menuRoot.querySelectorAll('button, a, h2');
          allItems.forEach((item) => {
            const htmlItem = item as HTMLElement;
            htmlItem.style.removeProperty('border-bottom');
            htmlItem.style.removeProperty('padding-bottom');
            htmlItem.style.removeProperty('margin-bottom');
            htmlItem.style.removeProperty('background-color');
            if (htmlItem.style.display === 'inline-block') {
              htmlItem.style.removeProperty('display');
            }
          });
        }
        
        let targetElement: HTMLElement | null = null;
        
        if (step === 1 && menuRoot) {
          const firstContent = menuRoot.querySelector('div[class*="w-full"][class*="h-full"]') || menuRoot.querySelector('div:first-child');
          targetElement = (firstContent as HTMLElement) || menuRoot;
        } else if (step === 2 && menuRoot) {
          const buttons = menuRoot.querySelectorAll('button');
          targetElement = Array.from(buttons).find((el) => (el.textContent || '').includes('El Camino')) as HTMLElement;
        } else if (step === 3 && menuRoot) {
          const buttons = menuRoot.querySelectorAll('button');
          targetElement = Array.from(buttons).find((el) => (el.textContent || '').includes('Biblioteca')) as HTMLElement;
        } else if (step === 4 && menuRoot) {
          const links = menuRoot.querySelectorAll('a');
          targetElement = Array.from(links).find((el) => (el.textContent || '').includes('Telegram')) as HTMLElement;
        }
        
        // Aplicar subrayado al elemento objetivo
        if (targetElement && targetElement.getBoundingClientRect().width > 0) {
          if (step === 2) {
            const h2Element = targetElement.querySelector('h2');
            if (h2Element) {
              h2Element.style.setProperty('border-bottom', '2px solid rgba(255, 255, 255, 0.9)', 'important');
              h2Element.style.setProperty('padding-bottom', '0.25rem', 'important');
              h2Element.style.setProperty('display', 'inline-block', 'important');
            }
            targetElement.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
          } else if (step === 3) {
            const h2Element = targetElement.querySelector('h2');
            if (h2Element) {
              h2Element.style.setProperty('border-bottom', '2px solid rgba(255, 255, 255, 0.9)', 'important');
              h2Element.style.setProperty('padding-bottom', '0.25rem', 'important');
              h2Element.style.setProperty('display', 'inline-block', 'important');
            }
            targetElement.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
          } else if (step === 4) {
            const h2Element = targetElement.querySelector('h2');
            if (h2Element) {
              h2Element.style.setProperty('border-bottom', '2px solid rgba(255, 255, 255, 0.9)', 'important');
              h2Element.style.setProperty('padding-bottom', '0.25rem', 'important');
              h2Element.style.setProperty('display', 'inline-block', 'important');
            }
            targetElement.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
          }
        }
        
        let boxTop: number;
        let boxLeft: number;
        
        if (targetElement && targetElement.getBoundingClientRect().width > 0) {
          const targetRect = targetElement.getBoundingClientRect();
          if (isMobile) {
            if (step === 1) {
              boxTop = window.innerHeight / 2 - MOBILE_BOX_HEIGHT / 2;
              boxLeft = (window.innerWidth - boxWidth) / 2;
            } else {
              const mobileBottom = getMobileBottom(step);
              boxTop = window.innerHeight - MOBILE_BOX_HEIGHT - mobileBottom;
              boxLeft = (window.innerWidth - boxWidth) / 2;
            }
          } else {
            if (step === 1) {
              boxTop = window.innerHeight / 2 - boxHeight / 2;
              boxLeft = window.innerWidth / 2 - boxWidth / 2;
            } else {
              const stepOffset = -10;
              boxTop = targetRect.top + targetRect.height / 2 - boxHeight / 2 + stepOffset;
              boxLeft = Math.max(16, targetRect.left - boxWidth - spacing);
            }
          }
        } else {
          if (isMobile) {
            if (step === 1) {
              boxTop = window.innerHeight / 2 - MOBILE_BOX_HEIGHT / 2;
              boxLeft = (window.innerWidth - boxWidth) / 2;
            } else {
              const mobileBottom = getMobileBottom(step);
              boxTop = window.innerHeight - MOBILE_BOX_HEIGHT - mobileBottom;
              boxLeft = (window.innerWidth - boxWidth) / 2;
            }
          } else {
            if (step === 1) {
              boxTop = window.innerHeight / 2 - boxHeight / 2;
              boxLeft = window.innerWidth / 2 - boxWidth / 2;
            } else {
              const stepOffset = -20;
              boxTop = rect.top - boxHeight / 2 + stepOffset;
              boxLeft = Math.max(16, rect.left - boxWidth - spacing);
            }
          }
        }
        
        setBoxPosition({ top: boxTop, left: boxLeft });
      };
      
      setTimeout(() => {
        calculateNewPositionForStep(newStep);
        setCurrentStep(newStep);
        
        // Mostrar el modal después de que la posición esté establecida
        setTimeout(() => {
          setIsTransitioning(false);
        }, 150);
      }, 50);
    }
  };

  const handleComplete = async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    setIsExiting(true);
    
    // Limpiar TODOS los estilos aplicados por el tutorial
    const cleanAllStyles = () => {
      // Limpiar subrayados de todos los elementos del menú
      const allItems = document.querySelectorAll('button, a, h2, span');
      allItems.forEach((item) => {
        const htmlItem = item as HTMLElement;
        htmlItem.style.removeProperty('border-bottom');
        htmlItem.style.removeProperty('padding-bottom');
        htmlItem.style.removeProperty('margin-bottom');
        htmlItem.style.removeProperty('background-color');
        if (htmlItem.style.display === 'inline-block') {
          htmlItem.style.removeProperty('display');
        }
      });
      
      // Limpiar subrayado del botón Move Crew
      const moveCrewButtons = document.querySelectorAll('[data-tutorial-move-crew-target]');
      moveCrewButtons.forEach((btn) => {
        const button = btn as HTMLElement;
        button.style.removeProperty('border-bottom');
        button.style.removeProperty('padding-bottom');
        button.style.removeProperty('display');
        const spans = button.querySelectorAll('span');
        spans.forEach(span => {
          span.style.removeProperty('border-bottom');
          span.style.removeProperty('padding-bottom');
          span.style.removeProperty('display');
        });
      });
    };
    
    // Limpiar estilos inmediatamente
    cleanAllStyles();
    
    // Ocultar el tutorial inmediatamente
    setShowTutorial(false);
    setBoxPosition(null);
    
    // Quitar la clase que bloquea el botón (pero NO cerrar el menú: así un solo clic en "Cerrar" lo cierra)
    document.body.classList.remove('tutorial-active');
    
    try {
      const response = await fetch('/api/onboarding/complete-bitacora-tutorial', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Limpiar estilos nuevamente después de un breve delay para asegurar
        setTimeout(() => {
          cleanAllStyles();
          onComplete();
        }, 100);
      } else {
        setTimeout(() => {
          cleanAllStyles();
          onComplete();
        }, 100);
      }
    } catch (error) {
      console.error('Error completando tutorial:', error);
      setTimeout(() => {
        cleanAllStyles();
        onComplete();
      }, 100);
    } finally {
      // Limpiar estilos una vez más antes de resetear estados
      setTimeout(() => {
        cleanAllStyles();
        setIsCompleting(false);
        setIsExiting(false);
      }, 200);
    }
  };


  if (!isOpen || !showTutorial) return null;

  return (
    <AnimatePresence>
      {/* Overlay de loading cuando se está completando */}
      {isCompleting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center font-montserrat bg-palette-ink/60 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-palette-cream/30 border-t-palette-cream rounded-full animate-spin" />
            <p className="text-palette-cream text-sm font-light">Completando...</p>
          </div>
        </motion.div>
      )}
      
      <motion.div 
        className="fixed inset-0 z-[201] font-montserrat"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: isExiting ? 0.3 : 0.3 }}
      >
        {/* Overlay de fondo solo para paso 1 - bloquea interacción con la página */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-palette-ink/60 backdrop-blur-sm"
            style={{ pointerEvents: 'auto', zIndex: 199 }}
            onClick={(e) => {
              // Bloquear todos los clics en el overlay excepto en el botón Move Crew
              e.preventDefault();
              e.stopPropagation();
            }}
          />
        )}
        
        {/* Asegurar que el botón Move Crew esté por encima del overlay en paso 1 y agregar animación de pulso */}
        {currentStep === 1 && (
          <style jsx global>{`
            [data-tutorial-move-crew-target] {
              position: relative !important;
              z-index: 10 !important;
              pointer-events: auto !important;
              animation: pulse-tutorial 2s ease-in-out infinite !important;
            }
            
            @keyframes pulse-tutorial {
              0%, 100% {
                opacity: 1;
                transform: scale(1);
              }
              50% {
                opacity: 0.8;
                transform: scale(1.05);
              }
            }
          `}</style>
        )}

        {/* Flecha de Canva (SVG inline) con efecto al cargar - solo en paso 1 */}
        {currentStep === 1 && !isTransitioning && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 3750 3749.999967"
            preserveAspectRatio="xMidYMid meet"
            version="1.0"
            className="absolute pointer-events-none"
            style={{
              zIndex: 200,
              left: isMobile ? '50%' : 'auto',
              right: isMobile ? 'auto' : '15%',
              top: isMobile ? '75%' : '25%',
              width: isMobile ? 300 : 400,
              height: isMobile ? 300 : 400,
              transform: isMobile
                ? 'translate(-50%, -50%) rotate(150deg)'
                : 'translate(0, -50%) rotate(20deg)',
              transformOrigin: 'center center',
              opacity: 0.95,
              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))',
            }}
          >
            <g className="tutorial-arrow-inner">
              <path
                fill="white"
                fillOpacity={1}
                fillRule="nonzero"
                d="M 427.851562 3502.246094 C 350.277344 3239.585938 405.433594 2957.632812 548.078125 2727.316406 C 624.296875 2604.257812 724.105469 2495.96875 838.941406 2407.976562 C 966.613281 2310.125 1111.800781 2240.429688 1263.292969 2187.828125 C 1588.109375 2075.058594 1932.734375 2033.828125 2257.761719 1921.769531 C 2558.628906 1818.039062 2836.886719 1640.757812 3032.835938 1387.015625 C 3132.675781 1257.742188 3208.078125 1110.132812 3249.507812 951.878906 C 3292.824219 786.414062 3298.644531 611.871094 3265.40625 444.042969 C 3257.214844 402.726562 3246.605469 361.976562 3233.875 321.835938 C 3229.746094 308.769531 3209.109375 314.359375 3213.277344 327.515625 C 3266.082031 494.152344 3279.347656 672.007812 3250.644531 844.535156 C 3222.800781 1011.851562 3156.996094 1171.03125 3061.675781 1311.128906 C 2881.074219 1576.617188 2606.039062 1769.28125 2307.683594 1881.164062 C 1985.398438 2002.019531 1640.648438 2043.707031 1313.589844 2148.539062 C 1160.191406 2197.707031 1010.585938 2261.402344 877.699219 2353.417969 C 759.375 2435.355469 654.832031 2536.824219 571.207031 2654.0625 C 415.53125 2872.34375 336.835938 3147 384.800781 3413.578125 C 390.535156 3445.425781 398.101562 3476.878906 407.269531 3507.90625 C 411.132812 3521.082031 431.765625 3515.492188 427.851562 3502.246094 Z M 427.851562 3502.246094 "
              />
              <path
                fill="white"
                fillOpacity={1}
                fillRule="nonzero"
                d="M 3409.707031 444.113281 C 3382.089844 407.90625 3354.476562 371.714844 3326.882812 335.507812 C 3313.085938 317.402344 3299.269531 299.300781 3285.46875 281.195312 C 3273.988281 266.136719 3263 249.882812 3246.570312 239.753906 C 3229.992188 229.535156 3209.519531 228.519531 3192.089844 237.191406 C 3177.613281 244.398438 3166.949219 258.175781 3159.597656 272.207031 C 3155.644531 279.753906 3152.527344 287.691406 3149.574219 295.667969 C 3146.011719 305.296875 3142.488281 314.929688 3139 324.578125 C 3133.320312 340.332031 3127.746094 356.121094 3122.246094 371.929688 C 3111.222656 403.667969 3100.238281 435.410156 3088.667969 466.933594 C 3086.816406 471.988281 3084.945312 477.046875 3083.058594 482.101562 C 3081.117188 487.351562 3085.230469 494.027344 3090.519531 495.238281 C 3096.570312 496.609375 3101.574219 493.40625 3103.65625 487.78125 C 3115.675781 455.417969 3127.160156 422.875 3138.445312 390.265625 C 3143.539062 375.558594 3148.648438 360.875 3153.863281 346.222656 C 3160.167969 328.492188 3166.257812 310.601562 3173.269531 293.15625 C 3173.554688 292.464844 3173.839844 291.785156 3174.125 291.09375 C 3172.773438 294.546875 3174.070312 291.253906 3174.390625 290.523438 C 3175.140625 288.867188 3175.90625 287.210938 3176.707031 285.574219 C 3178.308594 282.351562 3180.035156 279.183594 3181.941406 276.121094 C 3182.867188 274.625 3183.828125 273.148438 3184.84375 271.707031 C 3185.394531 270.90625 3185.984375 270.121094 3186.570312 269.339844 C 3186.996094 268.75 3187.816406 268.128906 3185.964844 270.121094 C 3186.355469 269.714844 3186.695312 269.195312 3187.070312 268.769531 C 3189.382812 265.957031 3191.929688 263.304688 3194.6875 260.917969 C 3195.257812 260.421875 3195.898438 259.992188 3196.453125 259.460938 C 3194.03125 261.808594 3196.253906 259.621094 3197.019531 259.101562 C 3198.570312 258.015625 3200.191406 257.039062 3201.863281 256.148438 C 3202.539062 255.792969 3203.214844 255.453125 3203.910156 255.132812 C 3206.546875 253.90625 3201.792969 255.898438 3204.535156 254.882812 C 3206.261719 254.242188 3208.023438 253.710938 3209.820312 253.28125 C 3210.695312 253.085938 3211.566406 252.925781 3212.457031 252.75 C 3214.203125 252.429688 3211.546875 252.871094 3211.40625 252.871094 C 3211.90625 252.871094 3212.421875 252.75 3212.9375 252.710938 C 3214.984375 252.535156 3217.050781 252.480469 3219.117188 252.570312 C 3220.148438 252.625 3221.5 252.980469 3222.515625 252.855469 C 3222.300781 252.871094 3219.84375 252.410156 3221.660156 252.765625 C 3222.089844 252.855469 3222.535156 252.925781 3222.960938 253.015625 C 3225.078125 253.441406 3227.179688 254.046875 3229.210938 254.796875 C 3229.621094 254.9375 3230.011719 255.097656 3230.402344 255.257812 C 3232.488281 256.023438 3228.570312 254.402344 3229.90625 255.0625 C 3230.757812 255.488281 3231.632812 255.882812 3232.484375 256.308594 C 3234.375 257.289062 3236.1875 258.390625 3237.933594 259.585938 C 3238.644531 260.066406 3239.324219 260.5625 3240.015625 261.0625 C 3241.832031 262.34375 3238.484375 259.816406 3239.625 260.742188 C 3240.035156 261.078125 3240.460938 261.398438 3240.871094 261.738281 C 3242.4375 263.039062 3243.933594 264.390625 3245.394531 265.796875 C 3248.226562 268.519531 3250.878906 271.421875 3253.40625 274.414062 C 3254.617188 275.835938 3255.792969 277.296875 3256.949219 278.757812 C 3257.269531 279.164062 3257.570312 279.558594 3257.890625 279.964844 C 3258.800781 281.105469 3256.238281 277.777344 3257.519531 279.484375 C 3258.355469 280.589844 3259.191406 281.691406 3260.027344 282.777344 C 3273.472656 300.402344 3286.914062 318.042969 3300.371094 335.667969 C 3327.363281 371.054688 3354.335938 406.425781 3381.328125 441.816406 C 3384.636719 446.160156 3387.96875 450.523438 3391.277344 454.863281 C 3393.042969 457.179688 3394.75 458.976562 3397.671875 459.777344 C 3400.234375 460.492188 3403.632812 460.167969 3405.894531 458.710938 C 3410.257812 455.898438 3413.335938 448.867188 3409.707031 444.113281 Z M 3409.707031 444.113281 "
              />
            </g>
          </svg>
        )}
        
        {/* Asegurar que el WeeklyPathNavigator y el tutorial estén al mismo nivel */}
        {/* SOLO aplicar estos estilos cuando el tutorial esté activo */}
        {isOpen && (
          <style jsx global>{`
            /* Flecha tutorial: aparece desde abajo al cargar */
            .tutorial-arrow-inner {
              animation: tutorial-arrow-appear 1.4s ease-out forwards;
            }
            @keyframes tutorial-arrow-appear {
              from {
                opacity: 0;
                transform: translateY(24px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            /* El WeeklyPathNavigator ya tiene z-[200], mantenerlo */
            [class*="fixed bottom-6 right-6"] {
              z-index: 200 !important;
              pointer-events: auto !important;
            }
            
            /* El panel full-screen del menú Move Crew debe estar por debajo del tutorial */
            [class*="fixed inset-0"][class*="bg-black"] {
              z-index: 200 !important;
            }
            
            /* El dropdown del navigator - SOLO z-index, sin modificar NADA más del CSS */
            [class*="absolute bottom-full"] {
              z-index: 201 !important;
            }
            
            /* El cuadro del tutorial debe estar por encima del menú full-screen */
            .tutorial-box {
              z-index: 202 !important;
            }
            
            /* La flecha debe estar por encima del cuadro pero por debajo del overlay */
            .tutorial-arrow {
              z-index: 201 !important;
            }
            
            /* Bloquear el overlay del menú de camino en mobile durante el tutorial */
            @media (max-width: 640px) {
              [class*="fixed inset-0 bg-black/20"][class*="z-[199]"] {
                display: none !important;
                pointer-events: none !important;
                opacity: 0 !important;
              }
            }
            
            /* Bloquear el cierre del menú durante el tutorial */
            /* Prevenir que el botón del navigator cierre el menú durante el tutorial */
            [class*="fixed bottom-6 right-6"] button[aria-label="Navegador de Camino"] {
              pointer-events: auto !important;
            }
            
            /* Ocultar completamente el botón de cerrar del dropdown durante el tutorial */
            /* Solo ocultar el botón que está en el header con aria-label="Cerrar" */
            [class*="absolute bottom-full"] button[aria-label="Cerrar"],
            [class*="absolute bottom-full"] button[aria-label="close"],
            [class*="absolute bottom-full"] button[aria-label="cerrar"] {
              display: none !important;
            }
            
            /* Prevenir que los clics fuera del dropdown cierren el menú durante el tutorial */
            body.tutorial-active {
              overflow: hidden !important;
            }
            
            /* Bloquear completamente el cierre del menú durante el tutorial */
            body.tutorial-active [class*="fixed bottom-6 right-6"] {
              pointer-events: auto !important;
            }
            
            /* Prevenir que el event listener del WeeklyPathNavigator cierre el menú */
            body.tutorial-active * {
              user-select: none;
            }
            
            body.tutorial-active .tutorial-box,
            body.tutorial-active .tutorial-box *,
            body.tutorial-active [class*="fixed bottom-6 right-6"],
            body.tutorial-active [class*="fixed bottom-6 right-6"] * {
              user-select: auto !important;
              pointer-events: auto !important;
            }
            
            /* El dropdown debe mantener su CSS original, solo permitir interacción */
            body.tutorial-active [class*="absolute bottom-full"],
            body.tutorial-active [class*="absolute bottom-full"] * {
              user-select: auto !important;
              pointer-events: auto !important;
            }
          `}</style>
        )}


        {/* Contenido del tutorial - Posicionado dinámicamente según el paso */}
        {boxPosition ? (
          <motion.div
            key="tutorial-box"
            initial={false}
            animate={{ 
              opacity: isTransitioning || isExiting ? 0 : 1,
              y: isExiting ? 100 : 0,
              scale: isExiting ? 0.9 : 1,
              x: isMobile ? '-50%' : 0,
            }}
            exit={{ 
              opacity: 0,
              y: 100,
              scale: 0.9,
              transition: { duration: 0.3, ease: 'easeIn' }
            }}
            ref={boxRef}
            className="fixed bg-palette-cream border border-palette-stone/10 rounded-2xl shadow-[0_8px_32px_rgba(20,20,17,0.12)] max-w-[85vw] md:max-w-md w-full p-0 overflow-visible tutorial-box text-palette-ink"
            style={{
              ...(isMobile
                ? currentStep === 1
                  ? { top: boxPosition.top, left: '50%' }
                  : { bottom: getMobileBottom(currentStep), left: '50%' }
                : { top: boxPosition.top, left: boxPosition.left }),
              transition: isTransitioning ? 'opacity 0.1s linear' : isExiting ? 'opacity 0.3s ease-in, transform 0.3s ease-in' : (isMobile ? (currentStep === 1 ? 'top 0.15s ease-out, left 0.15s ease-out' : 'bottom 0.15s ease-out, left 0.15s ease-out') : 'top 0.15s ease-out, left 0.15s ease-out'),
              pointerEvents: (isTransitioning || isExiting) ? 'none' : 'auto',
              visibility: (isTransitioning || isExiting) ? 'hidden' : 'visible',
            }}
          >
            {/* Triángulo indicador minimalista - Web: apunta a la derecha hacia el menú (oculto en paso 1) */}
            {currentStep !== 1 && (
              <div 
                className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[12px] border-l-palette-cream z-50"
                style={{ 
                  filter: 'drop-shadow(2px 0 3px rgba(0,0,0,0.15))'
                }}
              />
            )}
            {/* Triángulo indicador minimalista - Mobile: apunta arriba hacia el menú (oculto en paso 1) */}
            {currentStep !== 1 && (
              <div 
                className="md:hidden absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-palette-cream z-50"
                style={{ 
                  filter: 'drop-shadow(0 -2px 3px rgba(0,0,0,0.15))'
                }}
              />
            )}
            
            <div
              className="relative bg-palette-cream text-palette-ink p-6 md:p-8 rounded-2xl"
              style={{
                opacity: isTransitioning ? 0.5 : 1,
                pointerEvents: isTransitioning ? 'none' : 'auto',
              }}
            >
            
            {/* Indicador de pasos minimalista */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-[0.2em] text-palette-stone font-montserrat">
                {currentStep} / {totalSteps}
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-0.5 transition-all ${
                      i + 1 <= currentStep ? 'w-6 bg-palette-ink' : 'w-2 bg-palette-stone/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Contenido según el paso */}
            <AnimatePresence mode="wait" initial={false}>
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ 
                    duration: 0.1,
                    ease: 'easeOut'
                  }}
                  className="space-y-4 relative z-0"
                  style={{ pointerEvents: 'none' }}
                >
                  <h3 className="text-lg md:text-xl font-semibold text-palette-ink font-montserrat tracking-tight mb-3">
                    Menú Principal
                  </h3>
                  <p className="text-sm md:text-base text-palette-stone leading-relaxed font-montserrat font-light">
                    Toca el botón <span className="text-palette-ink font-normal">Move Crew</span> en el header para abrir tu navegador central y acceder a todas las secciones.
                  </p>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ 
                    duration: 0.1,
                    ease: 'easeOut'
                  }}
                  className="space-y-4 relative z-0"
                  style={{ pointerEvents: 'none' }}
                >
                  <h3 className="text-lg md:text-xl font-semibold text-palette-ink font-montserrat tracking-tight mb-3">
                    El Camino
                  </h3>
                  <p className="text-sm md:text-base text-palette-stone leading-relaxed font-montserrat font-light">
                    Contenido semanal guiado, progreso y Unidades de Coherencia (U.C.).
                  </p>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ 
                    duration: 0.1,
                    ease: 'easeOut'
                  }}
                  className="space-y-4 relative z-0"
                  style={{ pointerEvents: 'none' }}
                >
                  <h3 className="text-lg md:text-xl font-semibold text-palette-ink font-montserrat tracking-tight mb-3">
                    Biblioteca de Clases
                  </h3>
                  <p className="text-sm md:text-base text-palette-stone leading-relaxed font-montserrat font-light">
                    Clases on-demand y programas disponibles. A tu ritmo, cuando quieras.
                  </p>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ 
                    duration: 0.1,
                    ease: 'easeOut'
                  }}
                  className="space-y-4 relative z-0"
                  style={{ pointerEvents: 'none' }}
                >
                  <h3 className="text-lg md:text-xl font-semibold text-palette-ink font-montserrat tracking-tight mb-3">
                    Grupo de Telegram
                  </h3>
                  <p className="text-sm md:text-base text-palette-stone leading-relaxed font-montserrat font-light">
                    Únete a la comunidad. Comparte avances, pregunta dudas y recibe soporte.
                  </p>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Botones de navegación minimalistas - Ocultos en paso 1 */}
            {currentStep !== 1 && (
            <div 
              className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-palette-stone/10 relative z-10"
              style={{
                opacity: isTransitioning ? 0 : 1,
                pointerEvents: isTransitioning ? 'none' : 'auto',
                display: isTransitioning ? 'none' : 'flex',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handlePrevious();
                }}
                disabled={currentStep === 1 || currentStep === 2 || isTransitioning}
                className={`px-4 py-2 text-xs md:text-sm font-medium font-montserrat transition-all relative z-20 ${
                  currentStep === 1 || currentStep === 2
                    ? 'text-palette-stone/40 cursor-not-allowed'
                    : 'text-palette-stone hover:text-palette-ink cursor-pointer'
                }`}
                style={{ 
                  pointerEvents: currentStep === 1 || currentStep === 2 || isTransitioning ? 'none' : 'auto',
                  position: 'relative',
                  zIndex: 20,
                }}
              >
                Anterior
              </button>
              <button
                onClick={() => {
                  if (currentStep === totalSteps) {
                    handleComplete();
                  } else {
                    handleNext();
                  }
                }}
                disabled={isCompleting || isTransitioning}
                className={`flex-1 text-palette-ink font-medium py-2.5 px-4 rounded-lg transition-all duration-200 text-xs md:text-sm font-montserrat relative z-50 border border-palette-ink ${
                  isCompleting || isTransitioning
                    ? 'opacity-50 cursor-not-allowed bg-palette-cream' 
                    : 'bg-palette-cream hover:bg-palette-ink hover:text-palette-cream'
                }`}
                style={{ 
                  position: 'relative',
                  zIndex: 50,
                }}
              >
                {isCompleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-palette-cream" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Cargando...
                  </span>
                ) : (
                  currentStep === totalSteps ? 'Finalizar' : 'Siguiente'
                )}
              </button>
            </div>
            )}
            </div>
          </motion.div>
        ) : (
          // Fallback: mostrar el cuadro en una posición por defecto si no se calculó
          <div className="relative z-10 h-full flex items-end justify-end p-4 md:p-8 pb-[420px] md:pb-[450px]">
            <div className="relative">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-palette-cream border border-palette-stone/10 rounded-2xl shadow-[0_8px_32px_rgba(20,20,17,0.12)] max-w-[85vw] md:max-w-md w-full p-6 md:p-8 relative overflow-visible text-palette-ink"
              >
                {/* Indicador de pasos minimalista */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <span className="text-xs uppercase tracking-[0.2em] text-palette-stone font-montserrat">
                    {currentStep} / {totalSteps}
                  </span>
                  <div className="flex gap-1.5">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-0.5 transition-all ${
                          i + 1 <= currentStep ? 'w-6 bg-palette-ink' : 'w-2 bg-palette-stone/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Contenido según el paso - Mismo contenido que arriba */}
                <AnimatePresence mode="wait" initial={false}>
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg md:text-xl font-semibold text-palette-ink font-montserrat tracking-tight mb-3">
                        Menú Principal
                      </h3>
                      <p className="text-sm md:text-base text-palette-stone leading-relaxed font-montserrat font-light">
                        Toca el botón <span className="text-palette-ink font-normal">Move Crew</span> en el header para abrir tu navegador central y acceder a todas las secciones.
                      </p>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step-2-fallback"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ 
                        duration: 0.1,
                        ease: 'easeOut'
                      }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg md:text-xl font-semibold text-palette-ink font-montserrat tracking-tight mb-3">
                        El Camino
                      </h3>
                      <p className="text-sm md:text-base text-palette-stone leading-relaxed font-montserrat font-light">
                        Contenido semanal guiado, progreso y Unidades de Coherencia (U.C.).
                      </p>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step-3-fallback"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ 
                        duration: 0.1,
                        ease: 'easeOut'
                      }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg md:text-xl font-semibold text-palette-ink font-montserrat tracking-tight mb-3">
                    Biblioteca de Clases
                  </h3>
                      <p className="text-sm md:text-base text-palette-stone leading-relaxed font-montserrat font-light">
                        Clases on-demand y programas disponibles. A tu ritmo, cuando quieras.
                  </p>
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div
                      key="step-4-fallback"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ 
                        duration: 0.1,
                        ease: 'easeOut'
                      }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg md:text-xl font-semibold text-palette-ink font-montserrat tracking-tight mb-3">
                    Grupo de Telegram
                  </h3>
                      <p className="text-sm md:text-base text-palette-stone leading-relaxed font-montserrat font-light">
                        Únete a la comunidad. Comparte avances, pregunta dudas y recibe soporte.
                  </p>
                    </motion.div>
                  )}

                </AnimatePresence>

                {/* Botones de navegación minimalistas - Ocultos en paso 1 */}
                {currentStep !== 1 && (
                <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-palette-stone/10">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1 || currentStep === 2}
                    className={`px-4 py-2 text-xs md:text-sm font-medium font-montserrat transition-all ${
                      currentStep === 1 || currentStep === 2
                        ? 'text-palette-stone/40 cursor-not-allowed'
                        : 'text-palette-stone hover:text-palette-ink cursor-pointer'
                    }`}
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => {
                      if (currentStep === totalSteps) {
                        handleComplete();
                      } else {
                        handleNext();
                      }
                    }}
                    className="flex-1 text-palette-ink font-medium py-2.5 px-4 rounded-lg transition-all duration-200 text-xs md:text-sm font-montserrat border border-palette-ink bg-palette-cream hover:bg-palette-ink hover:text-palette-cream"
                  >
                    {currentStep === totalSteps ? 'Finalizar' : 'Siguiente'}
                  </button>
                </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default WeeklyPathMenuTutorial;

