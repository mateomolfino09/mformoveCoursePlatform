'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowRightIcon, FireIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSnapshot } from 'valtio';
import { routes } from '../../../constants/routes';
import state from '../../../valtio';

interface BitacoraMenuTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
}

const BitacoraMenuTutorial = ({ isOpen, onComplete }: BitacoraMenuTutorialProps) => {
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
  const step0CardRef = useRef<HTMLDivElement>(null);
  const [arrowPoints, setArrowPoints] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);

  // Paso 0: activar/desactivar resaltado del botón Move Crew (sombra celeste + titilar)
  useEffect(() => {
    const inStep0 = isOpen && !showTutorial;
    state.bitacoraTutorialHighlightButton = inStep0;
    return () => {
      state.bitacoraTutorialHighlightButton = false;
    };
  }, [isOpen, showTutorial]);

  // Paso 0: medir posiciones del cartel y del botón Move Crew para dibujar la flecha curvada
  useEffect(() => {
    if (!isOpen || showTutorial) return;
    const measure = () => {
      const card = step0CardRef.current;
      const candidates = document.querySelectorAll('[data-tutorial-move-crew-target]');
      let btn: HTMLElement | null = null;
      for (const el of Array.from(candidates)) {
        const r = (el as HTMLElement).getBoundingClientRect();
        const style = window.getComputedStyle(el as HTMLElement);
        if (r.width > 0 && r.height > 0 && style.display !== 'none' && style.visibility !== 'hidden') {
          btn = el as HTMLElement;
          break;
        }
      }
      if (!btn) btn = document.querySelector('[data-tutorial-move-crew-target]') as HTMLElement;
      if (!card || !btn) return;
      const cardRect = card.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setArrowPoints({
        start: { x: cardRect.left + cardRect.width / 2, y: cardRect.bottom - 8 },
        end: { x: btnRect.left + btnRect.width / 2, y: btnRect.top + btnRect.height / 2 },
      });
    };
    const t = setTimeout(measure, 350);
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen, showTutorial]);

  // Paso 0: cuando el usuario abre el menú Move Crew (botón en header o barra inferior), disparar el popup
  useEffect(() => {
    if (!isOpen || showTutorial) return;
    if (snap.bitacoraNavOpen) {
      setMenuOpen(true);
      setTimeout(() => setShowTutorial(true), 300);
    }
  }, [isOpen, showTutorial, snap.bitacoraNavOpen]);

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
    // Usar capture phase para interceptar ANTES que el BitacoraNavigator
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
    // El BitacoraNavigator también usa capture, así que debemos estar primero
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
        state.bitacoraNavOpen = true;
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

    // Establecer posición por defecto inmediatamente
    const setDefaultPosition = () => {
      const navigator = document.querySelector('[class*="fixed bottom-6 right-6"]');
      if (navigator) {
        const rect = navigator.getBoundingClientRect();
        setTargetPosition({
          top: rect.top,
          left: rect.left,
        });
        setBoxPosition({
          top: rect.top - 300,
          left: Math.max(16, rect.left - 200),
        });
      } else {
        // Si no hay navigator, usar posición de pantalla
        setTargetPosition({
          top: window.innerHeight - 100,
          left: window.innerWidth - 100,
        });
        setBoxPosition({
          top: window.innerHeight - 400,
          left: window.innerWidth - 400,
        });
      }
    };

    // Establecer posición por defecto primero
    const navigator = document.querySelector('[class*="fixed bottom-6 right-6"]');
    if (navigator) {
      const rect = navigator.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      const boxWidth = 384;
      const boxHeight = 250;
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
        // Mobile: arriba del menú
        boxTop = Math.max(16, rect.top - boxHeight - spacing);
        boxLeft = Math.max(16, rect.left - boxWidth / 2 + 50);
        arrowX = boxLeft + boxWidth / 2;
        arrowY = boxTop + boxHeight;
      } else {
        // Web: a la izquierda del menú, un poco más arriba para alinear el triángulo
        // En el paso 1, subir un poco más el tutorial
        const step1Offset = currentStep === 1 ? -50 : -20;
        boxTop = rect.top - boxHeight / 2 + step1Offset;
        boxLeft = Math.max(16, rect.left - boxWidth - spacing - 50); // Más a la izquierda (+80px)
        arrowX = boxLeft + boxWidth;
        arrowY = boxTop + boxHeight / 2;
      }
      
      setBoxPosition({ top: boxTop, left: boxLeft });
      setArrowStart({ x: arrowX, y: arrowY });
    } else {
      // Si no hay navigator, usar posición de pantalla
      const isMobile = window.innerWidth < 768;
      setTargetPosition({
        top: window.innerHeight - 100,
        left: window.innerWidth - 100,
      });
      if (isMobile) {
        setBoxPosition({
          top: window.innerHeight - 400,
          left: 16,
        });
        setArrowStart({
          x: 16 + 192,
          y: window.innerHeight - 150,
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

    // Calcular la posición del elemento objetivo según el paso
    const calculateTargetPosition = () => {
      // Remover todos los resaltados anteriores
      const allItems = document.querySelectorAll('button, a, div');
      allItems.forEach((item) => {
        const htmlItem = item as HTMLElement;
        // Remover resaltados antiguos (ámbar) y nuevos (cyan)
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
      });
      

      // Menú Move Crew: panel full-screen (fixed inset-0 bg-black) o legacy dropdown
      const getMenuRoot = (): HTMLElement | null => {
        const panel = document.querySelector('[class*="fixed inset-0"][class*="bg-black"]');
        if (panel && panel.getBoundingClientRect().width > 0) return panel as HTMLElement;
        return document.querySelector('[class*="absolute bottom-full"]') as HTMLElement | null;
      };

      // Intentar encontrar el elemento con múltiples intentos
      const findElement = (attempt = 0) => {
        if (attempt > 10) {
          // Si no se encuentra después de 10 intentos, mantener posición por defecto
          return;
        }

        const menuRoot = getMenuRoot();
        let targetElement: HTMLElement | null = null;

        if (currentStep === 1) {
          // Paso 1: Apuntar al menú completo (contenedor principal)
          if (menuRoot) {
            const firstContent = menuRoot.querySelector('div[class*="w-full"][class*="h-full"]') || menuRoot.querySelector('div:first-child');
            targetElement = (firstContent as HTMLElement) || menuRoot;
          }
        } else if (currentStep === 2) {
          // Paso 2: Apuntar al botón "Tu Camino"
          if (menuRoot) {
            const buttons = menuRoot.querySelectorAll('button');
            targetElement = Array.from(buttons).find(
              (el) => (el.textContent || '').includes('Tu Camino')
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
          // Paso 4: Apuntar a "WhatsApp"
          if (menuRoot) {
            const links = menuRoot.querySelectorAll('a');
            targetElement = Array.from(links).find(
              (el) => (el.textContent || '').includes('Telegram')
            ) as HTMLElement;
          }
        }

        if (targetElement && targetElement.getBoundingClientRect().width > 0) {
          // Resaltar el elemento con el nuevo esquema de colores cyan
          // Usar setProperty con !important para sobrescribir cualquier CSS
          targetElement.style.setProperty('box-shadow', '0 0 20px rgba(34, 211, 238, 0.6)', 'important');
          targetElement.style.setProperty('border', '2px solid rgba(34, 211, 238, 0.8)', 'important');
          targetElement.style.setProperty('border-radius', '0.5rem', 'important');
          
          // En el paso 2, hacer que "Tu Camino" se vea activo/hover
          // Agregar background-color Y mantener el borde celeste con !important
          if (currentStep === 2) {
            targetElement.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
            // Asegurar que el borde celeste se mantenga con !important
            targetElement.style.setProperty('border', '2px solid rgba(34, 211, 238, 0.8)', 'important');
            targetElement.style.setProperty('box-shadow', '0 0 20px rgba(34, 211, 238, 0.6)', 'important');
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
            // Mobile: arriba del menú, centrado y más arriba, más pequeño
            const mobileBoxHeight = 220; // Más pequeño
            boxTop = Math.max(16, rect.top - mobileBoxHeight - spacing - 40); // Más arriba
            boxLeft = (window.innerWidth - boxWidth) / 2; // Centrado
            // Flecha desde el centro inferior del cuadro
            arrowX = boxLeft + boxWidth / 2;
            arrowY = boxTop + mobileBoxHeight;
          } else {
            // Web: a la izquierda del menú, un poco más arriba para alinear el triángulo
            // En el paso 1, subir un poco más el tutorial
            const step1Offset = currentStep === 1 ? -30 : -10;
            boxTop = rect.top + rect.height / 2 - boxHeight / 2 + step1Offset;
            boxLeft = Math.max(16, rect.left - boxWidth - spacing - 50); // Más a la izquierda (+80px)
            // Flecha desde el lado derecho del cuadro (centro vertical)
            arrowX = boxLeft + boxWidth;
            arrowY = boxTop + boxHeight / 2;
          }
          
          setBoxPosition({ top: boxTop, left: boxLeft });
          setArrowStart({ x: arrowX, y: arrowY });
        } else {
          // Reintentar después de un breve delay
          setTimeout(() => findElement(attempt + 1), 100);
        }
      };

      // Esperar un poco para que el DOM se actualice
      setTimeout(() => findElement(), 100);
    };

    calculateTargetPosition();
  }, [isOpen, currentStep]);

  // Efecto para mantener el menú abierto cuando cambia el paso
  useEffect(() => {
    if (!isOpen || !showTutorial) return;

    // Verificar que el menú esté abierto después de cambiar de paso
    const checkAndKeepOpen = () => {
      const dropdown = document.querySelector('[class*="absolute bottom-full"]');
      const fullScreenPanel = document.querySelector('[class*="fixed inset-0"][class*="bg-black"]');
      const isVisible = (dropdown && 
                       window.getComputedStyle(dropdown).display !== 'none' && 
                       dropdown.getBoundingClientRect().width > 0) ||
                       (fullScreenPanel && fullScreenPanel.getBoundingClientRect().width > 0);
      
      if (!isVisible) {
        state.bitacoraNavOpen = true;
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
        
        let targetElement: HTMLElement | null = null;
        
        if (step === 1 && menuRoot) {
          const firstContent = menuRoot.querySelector('div[class*="w-full"][class*="h-full"]') || menuRoot.querySelector('div:first-child');
          targetElement = (firstContent as HTMLElement) || menuRoot;
        } else if (step === 2 && menuRoot) {
          const buttons = menuRoot.querySelectorAll('button');
          targetElement = Array.from(buttons).find((el) => (el.textContent || '').includes('Tu Camino')) as HTMLElement;
        } else if (step === 3 && menuRoot) {
          const buttons = menuRoot.querySelectorAll('button');
          targetElement = Array.from(buttons).find((el) => (el.textContent || '').includes('Biblioteca')) as HTMLElement;
        } else if (step === 4 && menuRoot) {
          const links = menuRoot.querySelectorAll('a');
          targetElement = Array.from(links).find((el) => (el.textContent || '').includes('WhatsApp')) as HTMLElement;
        }
        
        let boxTop: number;
        let boxLeft: number;
        
        if (targetElement && targetElement.getBoundingClientRect().width > 0) {
          const targetRect = targetElement.getBoundingClientRect();
          if (isMobile) {
            const mobileBoxHeight = 220;
            boxTop = Math.max(16, targetRect.top - mobileBoxHeight - spacing - 40);
            boxLeft = (window.innerWidth - boxWidth) / 2;
          } else {
            // En el paso 1, subir un poco más el tutorial
            const step1Offset = step === 1 ? -30 : -10;
            boxTop = targetRect.top + targetRect.height / 2 - boxHeight / 2 + step1Offset;
            boxLeft = Math.max(16, targetRect.left - boxWidth - spacing);
          }
        } else {
          // Fallback a posición del navigator
          if (isMobile) {
            const mobileBoxHeight = 220;
            boxTop = Math.max(16, rect.top - mobileBoxHeight - spacing - 40);
            boxLeft = (window.innerWidth - boxWidth) / 2;
          } else {
            // En el paso 1, subir un poco más el tutorial
            const step1Offset = step === 1 ? -50 : -20;
            boxTop = rect.top - boxHeight / 2 + step1Offset;
            boxLeft = Math.max(16, rect.left - boxWidth - spacing);
          }
        }
        
        // Actualizar la posición INMEDIATAMENTE antes de cambiar el paso
        setBoxPosition({ top: boxTop, left: boxLeft });
      };
      
      // Usar setTimeout para asegurar que el estado se actualice y el modal se oculte primero
      setTimeout(() => {
        // Calcular posición para el nuevo paso
        calculateNewPositionForStep(newStep);
        
        // Cambiar el paso
        setCurrentStep(newStep);
        
        // Mostrar el modal después de que la posición esté establecida
        setTimeout(() => {
          setIsTransitioning(false);
        }, 150);
      }, 50);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1 && !isTransitioning) {
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
        const boxWidth = isMobile ? Math.min(320, window.innerWidth * 0.8) : 360;
        const boxHeight = isMobile ? 220 : 280;
        const spacing = isMobile ? 20 : 30;
        
        let targetElement: HTMLElement | null = null;
        
        if (step === 1 && menuRoot) {
          const firstContent = menuRoot.querySelector('div[class*="w-full"][class*="h-full"]') || menuRoot.querySelector('div:first-child');
          targetElement = (firstContent as HTMLElement) || menuRoot;
        } else if (step === 2 && menuRoot) {
          const buttons = menuRoot.querySelectorAll('button');
          targetElement = Array.from(buttons).find((el) => (el.textContent || '').includes('Tu Camino')) as HTMLElement;
        } else if (step === 3 && menuRoot) {
          const buttons = menuRoot.querySelectorAll('button');
          targetElement = Array.from(buttons).find((el) => (el.textContent || '').includes('Biblioteca')) as HTMLElement;
        } else if (step === 4 && menuRoot) {
          const links = menuRoot.querySelectorAll('a');
          targetElement = Array.from(links).find((el) => (el.textContent || '').includes('WhatsApp')) as HTMLElement;
        }
        
        let boxTop: number;
        let boxLeft: number;
        
        if (targetElement && targetElement.getBoundingClientRect().width > 0) {
          const targetRect = targetElement.getBoundingClientRect();
          if (isMobile) {
            const mobileBoxHeight = 220;
            boxTop = Math.max(16, targetRect.top - mobileBoxHeight - spacing - 40);
            boxLeft = (window.innerWidth - boxWidth) / 2;
          } else {
            // En el paso 1, subir un poco más el tutorial
            const step1Offset = step === 1 ? -30 : -10;
            boxTop = targetRect.top + targetRect.height / 2 - boxHeight / 2 + step1Offset;
            boxLeft = Math.max(16, targetRect.left - boxWidth - spacing);
          }
        } else {
          // Fallback a posición del navigator
          if (isMobile) {
            const mobileBoxHeight = 220;
            boxTop = Math.max(16, rect.top - mobileBoxHeight - spacing - 40);
            boxLeft = (window.innerWidth - boxWidth) / 2;
          } else {
            // En el paso 1, subir un poco más el tutorial
            const step1Offset = step === 1 ? -50 : -20;
            boxTop = rect.top - boxHeight / 2 + step1Offset;
            boxLeft = Math.max(16, rect.left - boxWidth - spacing);
          }
        }
        
        // Actualizar la posición INMEDIATAMENTE antes de cambiar el paso
        setBoxPosition({ top: boxTop, left: boxLeft });
      };
      
      // Ocultar primero, luego calcular posición y cambiar paso
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
    document.body.classList.remove('tutorial-active');
    
    // Cerrar el menú de navegación (tanto el dropdown local como el menú de Move Crew)
    const navigatorButton = document.querySelector('[aria-label="Navegador de Camino"]') as HTMLElement;
    if (navigatorButton) {
      const dropdown = document.querySelector('[class*="absolute bottom-full"]');
      const isVisible = dropdown && 
                       window.getComputedStyle(dropdown).display !== 'none' && 
                       dropdown.getBoundingClientRect().width > 0;

      if (isVisible) {
        navigatorButton.click();
      }
    }
    
    // Cerrar el menú de Move Crew y el dropdown del navegador (header móvil)
    state.systemNavOpen = false;
    state.bitacoraNavOpen = false;
    
    // Esperar un poco para que el menú se cierre antes de animar la salida
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Esperar a que el popup se anime saliendo de la pantalla
    await new Promise(resolve => setTimeout(resolve, 400));
    
    try {
      const response = await fetch('/api/onboarding/complete-bitacora-tutorial', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setShowTutorial(false);
        setTimeout(() => {
          onComplete();
        }, 100);
      } else {
        setShowTutorial(false);
        setTimeout(() => {
          onComplete();
        }, 100);
      }
    } catch (error) {
      console.error('Error completando tutorial:', error);
      setShowTutorial(false);
      setTimeout(() => {
        onComplete();
      }, 100);
    } finally {
      setIsCompleting(false);
      setIsExiting(false);
    }
  };


  if (!isOpen) return null;

  // Paso 0: obligar al usuario a tocar el botón Move Crew antes de mostrar el popup
  if (isOpen && !showTutorial) {
    const sx = arrowPoints?.start.x ?? 0;
    const sy = arrowPoints?.start.y ?? 0;
    const ex = arrowPoints?.end.x ?? 0;
    const ey = arrowPoints?.end.y ?? 0;
    // Punta de la flecha un poco antes del botón; un poquito más lejos
    const tipRatio = 0.76;
    const tipX = sx + (ex - sx) * tipRatio;
    const tipY = sy + (ey - sy) * tipRatio;
    // Panza: misma curva desde el cartel
    const cpx = sx + (ex - sx) * 0.5;
    const cpy = Math.min(sy, ey) - 110;
    // Pico de la panza: punto donde termina la primera curva y empieza la segunda
    const midX = tipX - (tipX - sx) * 0.14;
    const midY = tipY + 36;
    // Segunda curva bien redonda: control en el centro del tramo (mid→tip) y por debajo = arco suave
    const ctrlUpX = (midX + tipX) * 0.5;
    const ctrlUpY = (midY + tipY) * 0.5 + 28;
    const pathD = arrowPoints
      ? `M ${sx} ${sy} Q ${cpx} ${cpy} ${midX} ${midY} Q ${ctrlUpX} ${ctrlUpY} ${tipX} ${tipY}`
      : '';

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[198] font-montserrat"
          style={{ pointerEvents: 'none' }}
        >
          <div className="absolute inset-0 bg-palette-ink/60 backdrop-blur-sm" />
          {/* Flecha curvada imagen apuntando al botón Move Crew */}
          {arrowPoints && arrowLength > 0 && (
            <img
              src="/images/svg/arrow curve.png"
              alt=""
              className="absolute pointer-events-none"
              style={{
                zIndex: 1,
                left: `${arrowX}px`,
                top: `${arrowY}px`,
                transform: `translate(-50%, -50%) rotate(${angle}deg) scale(${scale})`,
                transformOrigin: 'center center',
                opacity: 0.92,
              }}
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center md:justify-start md:pt-32 px-4" style={{ zIndex: 2 }}>
            <motion.div
              ref={step0CardRef}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-palette-cream border border-palette-stone/10 rounded-2xl shadow-[0_8px_32px_rgba(20,20,17,0.12)] max-w-md w-full p-6 md:p-8 text-center"
            >
              <p className="text-palette-ink font-montserrat font-medium text-lg md:text-xl mb-2">
                Primer paso
              </p>
              <p className="text-palette-stone font-montserrat font-light text-sm md:text-base leading-relaxed">
                Toca el botón <strong className="text-palette-ink">Move Crew</strong> en la parte superior (o en la barra inferior en móvil) para abrir el menú y continuar con el tutorial.
              </p>
              <div className="mt-4 flex justify-center">
                <span className="inline-flex h-2 w-2 rounded-full bg-palette-sage animate-pulse" aria-hidden />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

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
        className="fixed inset-0 z-[201] md:z-[199] font-montserrat"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: isExiting ? 0.3 : 0.3 }}
      >
        {/* Overlay minimalista */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: isExiting ? 0.3 : 0.3 }}
          className="absolute inset-0 bg-palette-ink/70 backdrop-blur-sm"
          style={{ zIndex: 199 }}
          onClick={(e) => {
            // Bloquear TODOS los clics en el overlay durante el tutorial
            // No permitir cerrar el menú ni el tutorial
            e.preventDefault();
            e.stopPropagation();
          }}
        />
        
        {/* Asegurar que el BitacoraNavigator y el tutorial estén al mismo nivel */}
        {/* SOLO aplicar estos estilos cuando el tutorial esté activo */}
        {isOpen && (
          <style jsx global>{`
            /* El BitacoraNavigator ya tiene z-[200], mantenerlo */
            [class*="fixed bottom-6 right-6"] {
              z-index: 200 !important;
              pointer-events: auto !important;
            }
            
            /* El dropdown del navigator - SOLO z-index, sin modificar NADA más del CSS */
            [class*="absolute bottom-full"] {
              z-index: 201 !important;
            }
            
            /* El cuadro del tutorial debe estar al mismo nivel que el dropdown (z-[201]) o ligeramente por encima */
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
            
            /* Prevenir que el event listener del BitacoraNavigator cierre el menú */
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
              top: boxPosition.top,
              left: boxPosition.left,
              transition: isTransitioning ? 'opacity 0.1s linear' : isExiting ? 'opacity 0.3s ease-in, transform 0.3s ease-in' : 'top 0.15s ease-out, left 0.15s ease-out',
              pointerEvents: (isTransitioning || isExiting) ? 'none' : 'auto',
              visibility: (isTransitioning || isExiting) ? 'hidden' : 'visible',
            }}
          >
            {/* Triángulo indicador minimalista - Web: apunta a la derecha hacia el menú */}
            <div 
              className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[12px] border-l-palette-cream z-50"
              style={{ 
                filter: 'drop-shadow(2px 0 3px rgba(0,0,0,0.15))'
              }}
            />
            {/* Triángulo indicador minimalista - Mobile: apunta abajo hacia el menú */}
            <div 
              className="md:hidden absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-palette-cream z-50"
              style={{ 
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))'
              }}
            />
            
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
                    Tu navegador central para acceder a todas las secciones de Move Crew.
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
                    Tu Camino
                  </h3>
                  <p className="text-sm md:text-base text-palette-stone leading-relaxed font-montserrat font-light">
                    Contenido nuevo cada semana, guiado y progresivo. Una semana completada = 1 U.C.
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
                    Programas de entrenamiento y clases individuales guiadas. A tu ritmo, cuando quieras.
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
                    Grupo de WhatsApp
                  </h3>
                  <p className="text-sm md:text-base text-palette-stone leading-relaxed font-montserrat font-light">
                    Únete a la comunidad. Comparte avances, pregunta dudas y recibe soporte.
                  </p>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Botones de navegación minimalistas */}
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
                disabled={currentStep === 1 || isTransitioning}
                className={`px-4 py-2 text-xs md:text-sm font-medium font-montserrat transition-all relative z-20 ${
                  currentStep === 1
                    ? 'text-palette-stone/40 cursor-not-allowed'
                    : 'text-palette-stone hover:text-palette-ink cursor-pointer'
                }`}
                style={{ 
                  pointerEvents: currentStep === 1 || isTransitioning ? 'none' : 'auto',
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
                        Tu navegador central para acceder a todas las secciones de Move Crew.
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
                        Tu Camino
                      </h3>
                      <p className="text-sm md:text-base text-palette-stone leading-relaxed font-montserrat font-light">
                        Contenido nuevo cada semana, guiado y progresivo. Una semana completada = 1 U.C.
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
                        Programas de entrenamiento y clases individuales guiadas. A tu ritmo, cuando quieras.
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
                    Grupo de WhatsApp
                  </h3>
                      <p className="text-sm md:text-base text-palette-stone leading-relaxed font-montserrat font-light">
                        Únete a la comunidad. Comparte avances, pregunta dudas y recibe soporte.
                  </p>
                    </motion.div>
                  )}

                </AnimatePresence>

                {/* Botones de navegación minimalistas */}
                <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-palette-stone/10">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className={`px-4 py-2 text-xs md:text-sm font-medium font-montserrat transition-all ${
                      currentStep === 1
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
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default BitacoraMenuTutorial;

