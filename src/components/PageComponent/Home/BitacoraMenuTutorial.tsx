'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowRightIcon, FireIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { routes } from '../../../constants/routes';

interface BitacoraMenuTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
}

const BitacoraMenuTutorial = ({ isOpen, onComplete }: BitacoraMenuTutorialProps) => {
  const router = useRouter();
  const navigatorRef = useRef<HTMLElement | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;
  const [targetPosition, setTargetPosition] = useState<{ top: number; left: number } | null>(null);
  const [boxPosition, setBoxPosition] = useState<{ top: number; left: number } | null>(null);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Abrir automáticamente el BitacoraNavigator inmediatamente
    const openNavigator = () => {
      // Buscar el botón del BitacoraNavigator
      const navigatorButton = document.querySelector('[aria-label="Navegador de Camino"]') as HTMLElement;
      if (navigatorButton) {
        navigatorRef.current = navigatorButton;
        // Hacer clic inmediatamente para abrir el menú
        navigatorButton.click();
        
        // Verificar que el dropdown esté completamente renderizado
        const checkDropdown = () => {
          const dropdown = document.querySelector('[class*="absolute bottom-full"]');
          const tuCaminoButton = dropdown?.querySelector('button')?.textContent?.includes('Tu Camino');
          
          if (dropdown && tuCaminoButton) {
            // El menú está completamente renderizado
            setMenuOpen(true);
            // Mostrar el tutorial inmediatamente después de que el menú esté listo
            setTimeout(() => {
              setShowTutorial(true);
            }, 200);
          } else {
            // Esperar un poco más y reintentar
            setTimeout(checkDropdown, 100);
          }
        };
        
        // Verificar después de un breve delay para que el menú se abra
        setTimeout(checkDropdown, 300);
      } else {
        // Si no se encuentra el botón, reintentar
        setTimeout(openNavigator, 200);
      }
    };

    // Intentar abrir el navigator inmediatamente cuando el componente se monta
    const timer = setTimeout(openNavigator, 100);
    
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Detectar cuando el menú está abierto y bloquear su cierre
  useEffect(() => {
    if (!isOpen) {
      setMenuOpen(false);
      setShowTutorial(false);
      setCurrentStep(1); // Resetear al paso 1 cuando se cierra el tutorial
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
      const isDropdownVisible = dropdown && 
                                window.getComputedStyle(dropdown).display !== 'none' && 
                                dropdown.getBoundingClientRect().width > 0;
      
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
      
      // Permitir que el botón del navigator abra el menú SOLO si está cerrado
      const isNavigatorButton = navigator && target.closest('button[aria-label="Navegador de Camino"]');
      if (isNavigatorButton) {
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
      const isVisible = dropdown && 
                       window.getComputedStyle(dropdown).display !== 'none' && 
                       dropdown.getBoundingClientRect().width > 0;
      
      if (isVisible && !menuOpen) {
        setMenuOpen(true);
        // Esperar un poco para que el menú termine de animarse antes de mostrar el tutorial
        setTimeout(() => {
          setShowTutorial(true);
        }, 300);
      } else if (!isVisible && menuOpen && showTutorial) {
        // Si el menú se cierra pero el tutorial está activo, forzar que se mantenga abierto
        const navigatorButton = document.querySelector('[aria-label="Navegador de Camino"]') as HTMLElement;
        if (navigatorButton) {
          // Forzar que el menú se mantenga abierto inmediatamente
          const dropdown = document.querySelector('[class*="absolute bottom-full"]');
          if (!dropdown || window.getComputedStyle(dropdown).display === 'none') {
            // Usar un pequeño delay para evitar conflictos con el bloqueo
            setTimeout(() => {
              // Temporalmente deshabilitar el bloqueo para permitir la apertura
              const tempHandler = (e: MouseEvent) => {
                e.stopImmediatePropagation();
              };
              document.addEventListener('mousedown', tempHandler, { capture: true, once: true });
              navigatorButton.click();
            }, 50);
          }
        }
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
        boxTop = rect.top - boxHeight / 2 - 20; // Ajuste de -20px para subir el modal
        boxLeft = Math.max(16, rect.left - boxWidth - spacing);
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
      

      // Intentar encontrar el elemento con múltiples intentos
      const findElement = (attempt = 0) => {
        if (attempt > 10) {
          // Si no se encuentra después de 10 intentos, mantener posición por defecto
          return;
        }

        let targetElement: HTMLElement | null = null;

        if (currentStep === 1) {
          // Paso 1: Apuntar al menú completo (header del dropdown)
          const dropdown = document.querySelector('[class*="absolute bottom-full"]');
          if (dropdown) {
            targetElement = dropdown.querySelector('div:first-child') as HTMLElement;
          }
        } else if (currentStep === 2) {
          // Paso 2: Apuntar específicamente al botón "Tu Camino"
          const dropdown = document.querySelector('[class*="absolute bottom-full"]');
          
          if (dropdown) {
            const buttons = dropdown.querySelectorAll('button');
            
            targetElement = Array.from(buttons).find(
              (el) => {
                const text = el.textContent || '';
                const hasTuCamino = text.includes('Tu Camino');
                const hasVerContenido = text.includes('Ver contenido del mes actual');
                return hasTuCamino && hasVerContenido;
              }
            ) as HTMLElement;
            
            // Si no se encuentra con el texto completo, buscar solo "Tu Camino"
            if (!targetElement) {
              targetElement = Array.from(buttons).find(
                (el) => {
                  const text = el.textContent || '';
                  return text.includes('Tu Camino');
                }
              ) as HTMLElement;
            }
          }
        } else if (currentStep === 3) {
          // Paso 3: Apuntar a "Biblioteca de Clases"
          const dropdown = document.querySelector('[class*="absolute bottom-full"]');
          if (dropdown) {
            const buttons = dropdown.querySelectorAll('button');
            targetElement = Array.from(buttons).find(
              (el) => el.textContent?.includes('Biblioteca')
            ) as HTMLElement;
          }
        } else if (currentStep === 4) {
          // Paso 4: Apuntar a "Grupo de Telegram"
          const dropdown = document.querySelector('[class*="absolute bottom-full"]');
          if (dropdown) {
            const links = dropdown.querySelectorAll('a');
            targetElement = Array.from(links).find(
              (el) => el.textContent?.includes('Telegram')
            ) as HTMLElement;
          }
        } else if (currentStep === 5) {
          // Paso 5: Apuntar a "Tu Camino" nuevamente
          const dropdown = document.querySelector('[class*="absolute bottom-full"]');
          if (dropdown) {
            const buttons = dropdown.querySelectorAll('button');
            targetElement = Array.from(buttons).find(
              (el) => el.textContent?.includes('Tu Camino') || el.textContent?.includes('Camino')
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
            boxTop = rect.top + rect.height / 2 - boxHeight / 2 - 10; // Ajuste de -20px para subir el modal
            boxLeft = Math.max(16, rect.left - boxWidth - spacing);
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
      const isVisible = dropdown && 
                       window.getComputedStyle(dropdown).display !== 'none' && 
                       dropdown.getBoundingClientRect().width > 0;
      
      if (!isVisible) {
        const navigatorButton = document.querySelector('[aria-label="Navegador de Camino"]') as HTMLElement;
        if (navigatorButton) {
          navigatorButton.click();
          // Verificar nuevamente después de un breve delay
          setTimeout(() => {
            const dropdownAfter = document.querySelector('[class*="absolute bottom-full"]');
            if (!dropdownAfter || window.getComputedStyle(dropdownAfter).display === 'none') {
              navigatorButton.click();
            }
          }, 300);
        }
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
      const calculateNewPositionForStep = (step: number) => {
        const navigator = document.querySelector('[class*="fixed bottom-6 right-6"]');
        if (!navigator) return;
        
        const rect = navigator.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;
        const boxWidth = isMobile ? Math.min(320, window.innerWidth - 32) : 384;
        const boxHeight = 250;
        const spacing = 20;
        
        // Intentar encontrar el elemento objetivo para el nuevo paso
        const dropdown = document.querySelector('[class*="absolute bottom-full"]');
        let targetElement: HTMLElement | null = null;
        
        if (step === 1) {
          if (dropdown) {
            targetElement = dropdown.querySelector('div:first-child') as HTMLElement;
          }
        } else if (step === 2) {
          if (dropdown) {
            const buttons = dropdown.querySelectorAll('button');
            targetElement = Array.from(buttons).find(
              (el) => {
                const text = el.textContent || '';
                return text.includes('Tu Camino');
              }
            ) as HTMLElement;
          }
        } else if (step === 3) {
          if (dropdown) {
            const buttons = dropdown.querySelectorAll('button');
            targetElement = Array.from(buttons).find(
              (el) => el.textContent?.includes('Biblioteca')
            ) as HTMLElement;
          }
        } else if (step === 4) {
          if (dropdown) {
            const links = dropdown.querySelectorAll('a');
            targetElement = Array.from(links).find(
              (el) => el.textContent?.includes('Telegram')
            ) as HTMLElement;
          }
        } else if (step === 5) {
          if (dropdown) {
            const buttons = dropdown.querySelectorAll('button');
            targetElement = Array.from(buttons).find(
              (el) => el.textContent?.includes('Tu Camino') || el.textContent?.includes('Camino')
            ) as HTMLElement;
          }
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
            boxTop = targetRect.top + targetRect.height / 2 - boxHeight / 2 - 10;
            boxLeft = Math.max(16, targetRect.left - boxWidth - spacing);
          }
        } else {
          // Fallback a posición del navigator
          if (isMobile) {
            const mobileBoxHeight = 220;
            boxTop = Math.max(16, rect.top - mobileBoxHeight - spacing - 40);
            boxLeft = (window.innerWidth - boxWidth) / 2;
          } else {
            boxTop = rect.top - boxHeight / 2 - 20;
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
      const calculateNewPositionForStep = (step: number) => {
        const navigator = document.querySelector('[class*="fixed bottom-6 right-6"]');
        if (!navigator) return;
        
        const rect = navigator.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;
        const boxWidth = isMobile ? Math.min(320, window.innerWidth * 0.8) : 360;
        const boxHeight = isMobile ? 220 : 280;
        const spacing = isMobile ? 20 : 30;
        
        // Intentar encontrar el elemento objetivo para el nuevo paso
        const dropdown = document.querySelector('[class*="absolute bottom-full"]');
        let targetElement: HTMLElement | null = null;
        
        if (step === 1) {
          if (dropdown) {
            targetElement = dropdown.querySelector('div:first-child') as HTMLElement;
          }
        } else if (step === 2) {
          if (dropdown) {
            const buttons = dropdown.querySelectorAll('button');
            targetElement = Array.from(buttons).find(
              (el) => {
                const text = el.textContent || '';
                return text.includes('Tu Camino');
              }
            ) as HTMLElement;
          }
        } else if (step === 3) {
          if (dropdown) {
            const buttons = dropdown.querySelectorAll('button');
            targetElement = Array.from(buttons).find(
              (el) => el.textContent?.includes('Biblioteca')
            ) as HTMLElement;
          }
        } else if (step === 4) {
          if (dropdown) {
            const links = dropdown.querySelectorAll('a');
            targetElement = Array.from(links).find(
              (el) => el.textContent?.includes('Telegram')
            ) as HTMLElement;
          }
        } else if (step === 5) {
          if (dropdown) {
            const buttons = dropdown.querySelectorAll('button');
            targetElement = Array.from(buttons).find(
              (el) => el.textContent?.includes('Tu Camino') || el.textContent?.includes('Camino')
            ) as HTMLElement;
          }
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
            boxTop = targetRect.top + targetRect.height / 2 - boxHeight / 2 - 10;
            boxLeft = Math.max(16, targetRect.left - boxWidth - spacing);
          }
        } else {
          // Fallback a posición del navigator
          if (isMobile) {
            const mobileBoxHeight = 220;
            boxTop = Math.max(16, rect.top - mobileBoxHeight - spacing - 40);
            boxLeft = (window.innerWidth - boxWidth) / 2;
          } else {
            boxTop = rect.top - boxHeight / 2 - 20;
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
    if (isCompleting) return; // Prevenir múltiples llamadas
    
    // Remover la clase tutorial-active del body para permitir que el menú se cierre
    document.body.classList.remove('tutorial-active');
    
    // Cerrar el menú de navegación INMEDIATAMENTE cuando se activa el loading
    const navigatorButton = document.querySelector('[aria-label="Navegador de Camino"]') as HTMLElement;
    if (navigatorButton) {
      const dropdown = document.querySelector('[class*="absolute bottom-full"]');
      const isVisible = dropdown && 
                       window.getComputedStyle(dropdown).display !== 'none' && 
                       dropdown.getBoundingClientRect().width > 0;

      console.log('isVisible', isVisible);
      console.log('navigatorButton', navigatorButton);
      if (isVisible) {
        // Hacer click para cerrar el menú
        navigatorButton.click();
        // También intentar cerrar directamente después de un pequeño delay
        setTimeout(() => {
          navigatorButton.click();
        }, 100);
      }
    }
    
    setIsCompleting(true);
    
    try {
      // Esperar un poco para que el menú se cierre completamente
      await new Promise(resolve => setTimeout(resolve, 300));

      // Marcar el tutorial como completado en el servidor
      const response = await fetch('/api/onboarding/complete-bitacora-tutorial', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Llamar a onComplete para actualizar el estado local
        onComplete();
        
        // Esperar un momento para que el estado se actualice
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Redirigir a la bitácora base
        router.push('/onboarding/bitacora-base');
      } else {
        // Si hay error, aún así completar localmente y redirigir
        onComplete();
        router.push('/onboarding/bitacora-base');
      }
    } catch (error) {
      console.error('Error completando tutorial:', error);
      // Aún así completar el tutorial localmente y redirigir
      onComplete();
      router.push('/onboarding/bitacora-base');
    } finally {
      setIsCompleting(false);
    }
  };


  if (!isOpen || !showTutorial) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[201] md:z-[199] font-montserrat"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Overlay oscuro que bloquea todo excepto el BitacoraNavigator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-none md:backdrop-blur-sm"
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
              opacity: isTransitioning ? 0 : 1,
            }}
            ref={boxRef}
            className="fixed bg-white/95 border border-slate-200 rounded-xl shadow-2xl max-w-[80vw] md:max-w-sm w-full p-0 overflow-visible tutorial-box text-slate-900"
            style={{
              top: boxPosition.top,
              left: boxPosition.left,
              transition: isTransitioning ? 'opacity 0.1s linear' : 'top 0.15s ease-out, left 0.15s ease-out',
              opacity: isTransitioning ? 0 : 1,
              pointerEvents: isTransitioning ? 'none' : 'auto',
              visibility: isTransitioning ? 'hidden' : 'visible',
            }}
          >
            <div
              className="relative bg-gradient-to-br from-white via-sky-50 to-slate-100 text-slate-900 p-4 md:p-6 overflow-hidden rounded-xl"
              style={{
                opacity: isTransitioning ? 0.5 : 1,
                pointerEvents: isTransitioning ? 'none' : 'auto',
              }}
            >
            {/* Decoración de fondo con gradiente del menú de bitácora */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-100/80 via-white/80 to-blue-100/70 rounded-xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/40 to-transparent rounded-xl pointer-events-none" />
            
            {/* Triángulo indicador - Web: derecha, Mobile: abajo */}
            {/* Web: triángulo a la derecha apuntando al menú */}
            {/* En paso 1, el triángulo está a 7rem del top para apuntar al header del navegador */}
            {/* En paso 2, el triángulo está a 4rem del top para apuntar a "Tu Camino" */}
            <div 
              className={`hidden md:block absolute -right-3 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[10px] border-l-sky-300/50 ${
                currentStep === 1 ? 'top-[6rem]' : currentStep === 2 ? 'top-[8.5rem]' : 'top-1/2 -translate-y-1/2'
              }`}
            />
            <div 
              className={`hidden md:block absolute -right-[9px] w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-white ${
                currentStep === 1 ? 'top-[6rem]' : currentStep === 2 ? 'top-[8.5rem]' : 'top-1/2 -translate-y-1/2'
              }`}
            />
            
            {/* Mobile: triángulo abajo apuntando al menú */}
            <div className="md:hidden absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-sky-300/50" />
            <div className="md:hidden absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
            
            {/* Indicador de pasos */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-amber-400 flex items-center justify-center shadow-sm z-10">
                  <FireIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-900" />
                </div>
                <span className="text-xs text-black z-10 font-montserrat">
                  Paso {currentStep} de {totalSteps}
                </span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i + 1 <= currentStep ? 'bg-sky-400' : 'bg-sky-200/60'
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
                  <h3 className="text-base md:text-lg font-bold text-slate-900 font-montserrat">
                    Bienvenido al Menú Principal
                  </h3>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-montserrat">
                    Este es tu <strong className="text-sky-600">Navegador All In One</strong>, el menú principal de la Move Crew.
                  </p>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-montserrat">
                    Desde acá podes acceder a todas las secciones importantes de la plataforma.
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
                  <h3 className="text-base md:text-lg font-bold text-slate-900 font-montserrat">
                    Tu Camino - El Camino del Gorila
                  </h3>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-montserrat">
                    Este es tu <strong className="text-sky-600">camino semanal</strong> donde vas a encontrar:
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1 ml-4 list-disc font-montserrat">
                    <li>Contenido semanal guiado</li>
                    <li>Camino de progreso</li>
                    <li>Unidades de Coherencia (U.C.)</li>
                  </ul>
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
                  <h3 className="text-base md:text-lg font-bold text-slate-900 font-montserrat">
                    Biblioteca de Clases
                  </h3>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-montserrat">
                    Accede a todas las <strong className="text-sky-600">clases on-demand</strong> y programas disponibles.
                  </p>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-montserrat">
                    Podes verlas cuando quieras, en tu espacio y a tu ritmo.
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
                  <h3 className="text-base md:text-lg font-bold text-slate-900 font-montserrat">
                    Grupo de Telegram
                  </h3>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-montserrat">
                    Unite a la <strong className="text-sky-600">comunidad de Move Crew</strong> en Telegram.
                  </p>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-montserrat">
                    Compartí avances, preguntá dudas y recibí soporte.
                  </p>
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div
                  key="step-5"
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
                  <h3 className="text-base md:text-lg font-bold text-slate-900 font-montserrat">
                    Hora de empezar tu Camino:
                  </h3>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-montserrat">
                    Te recomendamos empezar con el <strong className="text-sky-600">Camino Base</strong>.
                  </p>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-montserrat">
                    Es opcional, pero te va a ayudar a ganar tus primeras U.C., a crear hábitos corporales básicos y a entender mejor el sistema.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botones de navegación */}
            <div 
              className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200 relative z-10"
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
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold font-montserrat transition-all relative z-20 ${
                  currentStep === 1
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-white text-slate-700 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
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
                className={`flex-1 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 text-white font-semibold py-1.5 px-3 md:py-2 md:px-4 rounded-lg transition-all duration-200 shadow-lg text-xs md:text-sm font-montserrat relative z-50 ${
                  isCompleting || isTransitioning
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-sky-500 hover:via-sky-600 hover:to-blue-700 hover:shadow-xl hover:scale-105'
                }`}
                style={{ 
                  position: 'relative',
                  zIndex: 50,
                }}
              >
                {isCompleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Cargando...
                  </span>
                ) : (
                  currentStep === totalSteps ? 'Ir a el Camino Base' : 'Siguiente'
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
                className="bg-gradient-to-br from-white via-sky-50 to-slate-100 border border-slate-200 rounded-xl shadow-2xl max-w-[85vw] md:max-w-sm w-full p-4 md:p-6 relative overflow-visible text-slate-900"
              >
                {/* Decoración de fondo */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-100/60 to-amber-50/60" />
                
                {/* Indicador de pasos */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-amber-400 flex items-center justify-center shadow-sm z-10">
                      <FireIcon className="w-4 h-4 text-slate-900" />
                    </div>
                    <span className="text-xs text-slate-900 font-montserrat z-10">
                      Paso {currentStep} de {totalSteps}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i + 1 <= currentStep ? 'bg-sky-400' : 'bg-sky-200/60'
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
                      <h3 className="text-lg font-bold text-slate-900 font-montserrat">
                        Bienvenido al Menú Principal
                      </h3>
                      <p className="text-sm text-slate-700 leading-relaxed font-montserrat">
                        Este es tu <strong className="text-sky-600">Navegador de Camino</strong>, el menú principal de Move Crew.
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed font-montserrat">
                        Desde aquí podrás acceder a todas las secciones importantes de la plataforma.
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
                      <h3 className="text-lg font-bold text-slate-900 font-montserrat">
                        Tu Camino - El Camino del Gorila
                      </h3>
                      <p className="text-sm text-slate-700 leading-relaxed font-montserrat">
                        Esta es tu <strong className="text-sky-600">camino semanal</strong> donde encontrarás:
                      </p>
                      <ul className="text-xs text-slate-600 space-y-1 ml-4 list-disc font-montserrat">
                        <li>Contenido semanal guiado</li>
                        <li>Camino de progreso</li>
                        <li>Unidades de Coherencia (U.C.)</li>
                      </ul>
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
                      <h3 className="text-base md:text-lg font-bold text-slate-900 font-montserrat">
                    Biblioteca de Clases
                  </h3>
                      <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-montserrat">
                        Accede a todas las <strong className="text-sky-600">clases on-demand</strong> y programas disponibles.
                  </p>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-montserrat">
                        Puedes verlas cuando quieras, a tu ritmo.
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
                      <h3 className="text-base md:text-lg font-bold text-slate-900 font-montserrat">
                    Grupo de Telegram
                  </h3>
                      <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-montserrat">
                        Únete a la <strong className="text-sky-600">comunidad de Move Crew</strong> en Telegram.
                  </p>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-montserrat">
                        Recibe soporte, avisos y comparte con otros miembros.
                      </p>
                    </motion.div>
                  )}

                  {currentStep === 5 && (
                    <motion.div
                      key="step-5-fallback"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ 
                        duration: 0.1,
                        ease: 'easeOut'
                      }}
                      className="space-y-4"
                    >
                      <h3 className="text-base md:text-lg font-bold text-slate-900 font-montserrat">
                    ¡Comienza tu Camino!
                  </h3>
                      <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-montserrat">
                        Te recomendamos empezar con la <strong className="text-sky-600">Camino Base</strong>.
                  </p>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-montserrat">
                        Es opcional, pero te ayudará a ganar tus primeras U.C. y entender mejor el sistema.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botones de navegación */}
                <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-200">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold font-montserrat transition-all border ${
                      currentStep === 1
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-700 border-slate-200 hover:shadow-md hover:-translate-y-0.5'
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
                    className="flex-1 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-montserrat"
                  >
                    {currentStep === totalSteps ? 'Ir a el Camino Base' : 'Siguiente'}
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

