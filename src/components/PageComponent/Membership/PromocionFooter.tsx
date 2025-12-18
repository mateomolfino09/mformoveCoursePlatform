'use client';
import React, { useEffect, useState, useRef } from 'react';
import { ArrowRightIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

interface Promocion {
  _id: string;
  nombre: string;
  descripcion?: string;
  porcentajeDescuento: number;
  frecuenciasAplicables: string[];
  fechaFin: string;
  codigoPromocional?: string;
}

interface Plan {
  _id: string;
  frequency_type?: string;
  frequency_label?: string;
}

interface PromocionFooterProps {
  promocion: Promocion;
  onCtaClick: () => void;
  variant?: 'default' | 'movecrew';
  plans?: Plan[];
}

const PromocionFooter: React.FC<PromocionFooterProps> = ({ promocion, onCtaClick, variant = 'default', plans = [] }) => {
  const isMoveCrew = variant === 'movecrew';
  const textColor = isMoveCrew ? 'text-amber-700' : 'text-[#ae9359]';
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [scrollOpacity, setScrollOpacity] = useState(0.3); // Comienza con opacidad baja (30%)
  const [arrowDirection, setArrowDirection] = useState<'down' | 'right' | 'up'>('down');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Función para encontrar el plan correspondiente a la promoción
  const findPlanForPromocion = (): Plan | null => {
    if (!plans || plans.length === 0) return null;

    const frecuenciasPromocion = promocion.frecuenciasAplicables;
    
    // Si la promoción aplica a "ambas", devolver el primer plan activo
    if (frecuenciasPromocion.includes('ambas')) {
      return plans.find(p => (p as any).active !== false) || plans[0] || null;
    }

    // Buscar plan que coincida con la frecuencia de la promoción
    const planesCoincidentes: Plan[] = [];
    
    for (const plan of plans) {
      const frecuenciaPlan = plan.frequency_label?.toLowerCase() || '';
      const frequencyType = plan.frequency_type?.toLowerCase() || '';
      
      // Mapear frecuencia del plan a frecuencia de promoción
      let frecuenciaPlanNormalizada = '';
      if (frecuenciaPlan.includes('mensual') || 
          frequencyType === 'month' || 
          frequencyType === 'monthly' ||
          frequencyType === 'mensual') {
        frecuenciaPlanNormalizada = 'mensual';
      } else if (frecuenciaPlan.includes('trimestral') || 
                 frequencyType === 'quarter' || 
                 frequencyType === 'quarterly' ||
                 frequencyType === 'trimestral') {
        frecuenciaPlanNormalizada = 'trimestral';
      } else if (frecuenciaPlan.includes('anual') || 
                 frequencyType === 'year' || 
                 frequencyType === 'yearly' ||
                 frequencyType === 'anual') {
        // Los planes anuales pueden aplicar a promociones trimestrales o ambas
        frecuenciaPlanNormalizada = 'trimestral';
      }

      // Si coincide con alguna frecuencia de la promoción, agregarlo a la lista
      if (frecuenciasPromocion.includes(frecuenciaPlanNormalizada)) {
        planesCoincidentes.push(plan);
      }
    }

    // Priorizar planes activos
    const planActivo = planesCoincidentes.find(p => (p as any).active !== false);
    if (planActivo) return planActivo;
    
    // Si hay coincidencias, devolver la primera
    if (planesCoincidentes.length > 0) {
      return planesCoincidentes[0];
    }

    // Si no se encuentra coincidencia exacta, devolver el primer plan activo o el primero
    return plans.find(p => (p as any).active !== false) || plans[0] || null;
  };

  const handleAprovecharOferta = () => {
    const plan = findPlanForPromocion();
    
    if (plan && isMoveCrew) {
      // En Move Crew, hacer scroll a la tarjeta específica del plan
      const planCard = document.getElementById(`plan-card-${plan._id}`);
      if (planCard) {
        // Usar scrollIntoView con opciones para mejor posicionamiento
        planCard.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        
        // Resaltar la tarjeta brevemente con animación
        planCard.classList.add('ring-4', 'ring-amber-500', 'ring-opacity-75', 'transition-all', 'duration-500');
        setTimeout(() => {
          planCard.classList.remove('ring-4', 'ring-amber-500', 'ring-opacity-75');
        }, 2000);
      } else {
        // Fallback: scroll a la sección de planes
        onCtaClick();
      }
    } else if (plan && !isMoveCrew) {
      // Para Membership, hacer scroll a la sección de planes
      // El plan se seleccionará automáticamente si hay un selector
      onCtaClick();
    } else {
      // Si no hay plan encontrado, usar el callback original
      onCtaClick();
    }
  };

  // Función para actualizar la dirección de la flecha según la posición del scroll
  useEffect(() => {
    if (!isMoveCrew) {
      setArrowDirection('down');
      return;
    }

    const updateArrowDirection = () => {
      const plan = findPlanForPromocion();
      if (!plan) {
        setArrowDirection('down');
        return;
      }

      const planCard = document.getElementById(`plan-card-${plan._id}`);
      if (!planCard) {
        setArrowDirection('down');
        return;
      }

      // Buscar el contenedor con scroll
      let scrollContainer: HTMLElement | null = null;
      const footerElement = document.querySelector('[data-promocion-footer]');
      if (footerElement) {
        let parent = footerElement.parentElement;
        while (parent) {
          const style = window.getComputedStyle(parent);
          if (style.overflow === 'auto' || style.overflow === 'scroll' || 
              style.overflowY === 'auto' || style.overflowY === 'scroll' ||
              parent.classList.contains('overflow-scroll') || 
              parent.classList.contains('overflow-y-auto')) {
            scrollContainer = parent as HTMLElement;
            break;
          }
          parent = parent.parentElement;
        }
      }

      let cardRect: DOMRect;
      let viewportHeight: number;
      let cardTop: number;
      let cardBottom: number;
      let cardCenter: number;

      if (scrollContainer) {
        // Usar el contenedor con scroll
        const containerRect = scrollContainer.getBoundingClientRect();
        cardRect = planCard.getBoundingClientRect();
        viewportHeight = containerRect.height;
        cardTop = cardRect.top - containerRect.top;
        cardBottom = cardRect.bottom - containerRect.top;
        cardCenter = cardTop + (cardRect.height / 2);
      } else {
        // Usar window scroll como fallback
        cardRect = planCard.getBoundingClientRect();
        viewportHeight = window.innerHeight;
        cardTop = cardRect.top;
        cardBottom = cardRect.bottom;
        cardCenter = cardRect.top + cardRect.height / 2;
      }

      const viewportCenter = viewportHeight / 2;
      const threshold = viewportHeight * 0.15; // 15% del viewport como umbral

      // Determinar dirección basada en la posición de la tarjeta
      if (cardTop > viewportHeight) {
        // La tarjeta está completamente abajo del viewport, flecha hacia abajo
        setArrowDirection('down');
      } else if (cardBottom < 0) {
        // La tarjeta está completamente arriba del viewport, flecha hacia arriba
        setArrowDirection('up');
      } else if (Math.abs(cardCenter - viewportCenter) < threshold) {
        // La tarjeta está cerca del centro del viewport, flecha hacia la derecha (adentro)
        setArrowDirection('right');
      } else if (cardCenter < viewportCenter) {
        // La tarjeta está en la mitad superior, flecha hacia arriba
        setArrowDirection('up');
      } else {
        // La tarjeta está en la mitad inferior, flecha hacia abajo
        setArrowDirection('down');
      }
    };

    // Actualizar dirección inicial
    const timeoutId = setTimeout(updateArrowDirection, 200);

    // Escuchar eventos de scroll
    const handleMoveCrewScroll = () => {
      updateArrowDirection();
    };

    const handleWindowScroll = () => {
      updateArrowDirection();
    };

    window.addEventListener('movecrew-scroll', handleMoveCrewScroll as EventListener);
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    // También escuchar scroll del contenedor si existe
    const footerElement = document.querySelector('[data-promocion-footer]');
    let containerCleanup: (() => void) | null = null;
    
    if (footerElement) {
      let parent = footerElement.parentElement;
      while (parent) {
        const style = window.getComputedStyle(parent);
        if (style.overflow === 'auto' || style.overflow === 'scroll' || 
            style.overflowY === 'auto' || style.overflowY === 'scroll' ||
            parent.classList.contains('overflow-scroll') || 
            parent.classList.contains('overflow-y-auto')) {
          parent.addEventListener('scroll', handleMoveCrewScroll, { passive: true });
          containerCleanup = () => {
            parent?.removeEventListener('scroll', handleMoveCrewScroll);
          };
          break;
        }
        parent = parent.parentElement;
      }
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('movecrew-scroll', handleMoveCrewScroll as EventListener);
      window.removeEventListener('scroll', handleWindowScroll);
      if (containerCleanup) containerCleanup();
    };
  }, [promocion, isMoveCrew, plans]);
  
  // Estilos dinámicos basados en scroll
  const bgStyle = {
    backgroundColor: isMoveCrew 
      ? `rgba(180, 83, 9, ${scrollOpacity})` // amber-700 con opacidad
      : `rgba(174, 147, 89, ${scrollOpacity})`, // color dorado con opacidad
    backgroundImage: scrollOpacity > 0
      ? isMoveCrew
        ? `linear-gradient(to right, rgba(180, 83, 9, ${scrollOpacity}), rgba(194, 65, 12, ${scrollOpacity}))`
        : `linear-gradient(to right, rgba(174, 147, 89, ${scrollOpacity}), rgba(201, 168, 106, ${scrollOpacity}))`
      : 'none',
    transition: 'background-color 0.3s ease, background-image 0.3s ease',
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(promocion.fechaFin).getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    calculateTimeLeft();
    intervalRef.current = setInterval(calculateTimeLeft, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [promocion.fechaFin]);

  useEffect(() => {
    const handleMoveCrewScroll = (event: CustomEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = event.detail;
      
      // Calcular el porcentaje de scroll (0 a 1)
      // Comenzamos a mostrar el color después del 30% del scroll
      const scrollStart = clientHeight * 0.3;
      const scrollEnd = clientHeight * 0.8;
      
      // Opacidad base (mínima)
      const baseOpacity = 0.8;
      let opacity = baseOpacity;
      
      if (scrollTop >= scrollStart) {
        // Calcular opacidad basada en el scroll (de 0.3 a 1)
        const scrollProgress = Math.min(
          (scrollTop - scrollStart) / (scrollEnd - scrollStart),
          1
        );
        // Interpolar entre baseOpacity (0.3) y 1
        opacity = baseOpacity + (scrollProgress * (1 - baseOpacity));
      }
      
      setScrollOpacity(opacity);
    };

    const handleWindowScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Calcular el porcentaje de scroll (0 a 1)
      // Comenzamos a mostrar el color después del 30% del scroll
      const scrollStart = windowHeight * 0.3;
      const scrollEnd = windowHeight * 0.8;
      
      // Opacidad base (mínima)
      const baseOpacity = 0.8;
      let opacity = baseOpacity;
      
      if (scrollPosition >= scrollStart) {
        // Calcular opacidad basada en el scroll (de 0.3 a 1)
        const scrollProgress = Math.min(
          (scrollPosition - scrollStart) / (scrollEnd - scrollStart),
          1
        );
        // Interpolar entre baseOpacity (0.3) y 1
        opacity = baseOpacity + (scrollProgress * (1 - baseOpacity));
      }
      
      setScrollOpacity(opacity);
    };

    // Escuchar evento personalizado de Move Crew
    window.addEventListener('movecrew-scroll', handleMoveCrewScroll as EventListener);
    
    // También escuchar scroll de window como fallback
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    
    // Ejecutar una vez al montar para establecer el estado inicial
    setTimeout(() => {
      handleWindowScroll();
      // Intentar encontrar contenedor con scroll
      const footerElement = document.querySelector('[data-promocion-footer]');
      if (footerElement) {
        let parent = footerElement.parentElement;
        while (parent) {
          const style = window.getComputedStyle(parent);
          if (style.overflow === 'auto' || style.overflow === 'scroll' || 
              style.overflowY === 'auto' || style.overflowY === 'scroll' ||
              parent.classList.contains('overflow-scroll') || 
              parent.classList.contains('overflow-y-auto')) {
            const handleContainerScroll = () => {
              const scrollTop = (parent as HTMLElement).scrollTop;
              const clientHeight = (parent as HTMLElement).clientHeight;
              const scrollStart = clientHeight * 0.3;
              const scrollEnd = clientHeight * 0.8;
              
              // Opacidad base (mínima)
              const baseOpacity = 0.8;
              let opacity = baseOpacity;
              
              if (scrollTop >= scrollStart) {
                const scrollProgress = Math.min(
                  (scrollTop - scrollStart) / (scrollEnd - scrollStart),
                  1
                );
                // Interpolar entre baseOpacity (0.3) y 1
                opacity = baseOpacity + (scrollProgress * (1 - baseOpacity));
              }
              setScrollOpacity(opacity);
            };
            parent.addEventListener('scroll', handleContainerScroll, { passive: true });
            handleContainerScroll();
            break;
          }
          parent = parent.parentElement;
        }
      }
    }, 100);

    return () => {
      window.removeEventListener('movecrew-scroll', handleMoveCrewScroll as EventListener);
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, []);

  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0');
  };

  return (
    <div 
      data-promocion-footer
      className="fixed bottom-0 md:bottom-0 left-0 right-0 z-50 bg-gradient-to-r  from-amber-500/30 via-orange-500/30 to-rose-500/30 backdrop-blur-md text-white shadow-2xl border-t border-amber-300/40 transition-opacity duration-300"
      style={{ opacity: scrollOpacity }}
    >
      <div className="container mx-auto px-4 md:px-12 py-2 md:py-2">
        {/* Layout para web: nombre/descripción a la izquierda, contador centrado, botón a la derecha */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
          {/* Nombre y descripción a la izquierda - solo en web */}
          <div className="hidden md:flex flex-col items-start justify-center flex-shrink-0">
            <h3 className="text-base lg:text-lg text-black/90 font-bold">
              {promocion.porcentajeDescuento}% OFF - {promocion.nombre}
            </h3>
            {promocion.descripcion && (
              <p className="text-xs lg:text-sm text-black/90 opacity-90 mt-0.5">{promocion.descripcion}</p>
            )}
          </div>
          
          {/* Nombre centrado para mobile - sin descripción */}
          <div className="flex md:hidden items-center justify-center">
            <h3 className="text-xs text-black/90 font-bold">
              {promocion.porcentajeDescuento}% OFF - {promocion.nombre}
            </h3>
          </div>
        
          {/* Contador centrado */}
          <div className="flex items-center gap-1 md:gap-4 justify-center flex-1">
            <div className="flex items-center gap-0.5 md:gap-1 lg:gap-2">
              <div className="bg-black/20 rounded-lg px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 text-center min-w-[40px] md:min-w-[50px] lg:min-w-[60px]">
                <div className="text-[10px] md:text-xs lg:text-sm font-light">Días</div>
                <div className="text-sm md:text-lg lg:text-xl font-bold">{formatTime(timeLeft.days)}</div>
              </div>
              <span className="text-base md:text-xl lg:text-2xl">:</span>
              <div className="bg-black/20 rounded-lg px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 text-center min-w-[40px] md:min-w-[50px] lg:min-w-[60px]">
                <div className="text-[10px] md:text-xs lg:text-sm font-light">Horas</div>
                <div className="text-sm md:text-lg lg:text-xl font-bold">{formatTime(timeLeft.hours)}</div>
              </div>
              <span className="text-base md:text-xl lg:text-2xl">:</span>
              <div className="bg-black/20 rounded-lg px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 text-center min-w-[40px] md:min-w-[50px] lg:min-w-[60px]">
                <div className="text-[10px] md:text-xs lg:text-sm font-light">Min</div>
                <div className="text-sm md:text-lg lg:text-xl font-bold">{formatTime(timeLeft.minutes)}</div>
              </div>
              <span className="text-base md:text-xl lg:text-2xl">:</span>
              <div className="bg-black/20 rounded-lg px-1.5 md:px-2 lg:px-3 py-0.5 md:py-1 text-center min-w-[40px] md:min-w-[50px] lg:min-w-[60px]">
                <div className="text-[10px] md:text-xs lg:text-sm font-light">Seg</div>
                <div className="text-sm md:text-lg lg:text-xl font-bold">{formatTime(timeLeft.seconds)}</div>
              </div>
            </div>
          </div>

          {/* Botón completo para desktop - a la derecha */}
          <button
            onClick={handleAprovecharOferta}
            className="hidden md:flex bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md text-white px-6 md:px-8 py-2 md:py-3 rounded-2xl font-semibold font-montserrat border border-amber-300/40 shadow-2xl shadow-amber-500/10 hover:from-amber-400/30 hover:via-orange-400/30 hover:to-rose-400/30 hover:text-white transition-all duration-300 items-center gap-2 whitespace-nowrap flex-shrink-0"
          >
            {arrowDirection === 'right' ? 'Aprovechar Oferta' : 'Ver Oferta'}
            {arrowDirection === 'down' && <ArrowDownIcon className="w-4 h-4 md:w-5 md:h-5" />}
            {arrowDirection === 'right' && <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5" />}
            {arrowDirection === 'up' && <ArrowUpIcon className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          
          {/* Flecha sutil para mobile - siempre visible, cambia de dirección */}
          <button
            onClick={handleAprovecharOferta}
            className="md:hidden bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-all duration-300 flex items-center justify-center absolute right-10 top-1/2 -translate-y-1/2"
            aria-label="Aprovechar oferta"
          >
            {arrowDirection === 'down' && <ArrowDownIcon className="w-5 h-5 text-white transition-transform duration-300" />}
            {arrowDirection === 'right' && <ArrowRightIcon className="w-5 h-5 text-white transition-transform duration-300" />}
            {arrowDirection === 'up' && <ArrowUpIcon className="w-5 h-5 text-white transition-transform duration-300" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromocionFooter;


