'use client'
import { useEffect, useRef, useState } from 'react';
import MainSideBar from '../../MainSidebar/MainSideBar';
import FooterProfile from '../Profile/FooterProfile';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerHomeSlice';
import { useAuth } from '../../../hooks/useAuth';
import { Plan } from '../../../../typings';
import MoveCrewHero from './MoveCrewHero';
import MoveCrewHighlights from './MoveCrewHighlights';
import MoveCrewMethodVideo from './MoveCrewMethodVideo';
import MoveCrewIsForYou from './MoveCrewIsForYou';
import MoveCrewCommunitySlider from './MoveCrewCommunitySlider';
import MoveCrewTestimonials from './MoveCrewTestimonials';
import MoveCrewResultsSlider from './MoveCrewResultsSlider';
import MoveCrewPlans from './MoveCrewPlans';
import MoveCrewDescription from './MoveCrewDescription';
import MoveCrewStructure from './MoveCrewStructure';
import MoveCrewFAQ from './MoveCrewFAQ';
import MoveCrewCTA from './MoveCrewCTA';
import PromocionFooter from '../Membership/PromocionFooter';

interface Promocion {
  _id: string;
  nombre: string;
  descripcion?: string;
  porcentajeDescuento: number;
  frecuenciasAplicables: string[];
  fechaFin: string;
  codigoPromocional?: string;
}

interface MoveCrewProps {
  plans: Plan[];
  promociones?: Promocion[];
}

const MoveCrew = ({ plans, promociones = [] }: MoveCrewProps) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const [promocionActiva, setPromocionActiva] = useState<Promocion | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(toggleScroll(false));
  }, [dispatch]);

  // Propaga el scroll del contenedor a un evento global para que el header reaccione
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let lastScrollTop = el.scrollTop;
    let rafId: number | null = null;

    const emitScrollEvent = () => {
      const scrollTop = el.scrollTop;
      
      // Siempre emitir cuando el scroll llega a 0 o cuando cambia significativamente
      const isAtTop = scrollTop === 0;
      const hasChanged = Math.abs(scrollTop - lastScrollTop) >= 1;
      
      if (!isAtTop && !hasChanged) return;
      
      lastScrollTop = scrollTop;
      
      window.dispatchEvent(
        new CustomEvent('movecrew-scroll', {
          detail: {
            scrollTop: scrollTop,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
          },
        })
      );
    };

    const handleScroll = () => {
      // Usar requestAnimationFrame para optimizar
      if (rafId !== null) return;
      
      rafId = requestAnimationFrame(() => {
        emitScrollEvent();
        rafId = null;
      });
    };

    // Emitir una vez al montar para establecer el estado inicial
    const timeoutId = setTimeout(() => {
      emitScrollEvent();
    }, 100);

    el.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
      if (rafId !== null) cancelAnimationFrame(rafId);
      el.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Obtener la promoción más reciente y activa
    if (promociones && promociones.length > 0) {
      const ahora = new Date();
      const promocionesValidas = promociones.filter((p: Promocion) => {
        const fechaFin = new Date(p.fechaFin);
        return fechaFin > ahora;
      });
      
      if (promocionesValidas.length > 0) {
        setPromocionActiva(promocionesValidas[0]);
      }
    }
  }, [promociones]);

  const handlePromocionClick = () => {
    // Scroll a la sección de planes
    const plansSection = document.getElementById('move-crew-plans');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };



  return (
    <div
      ref={scrollContainerRef}
      className="relative lg:h-full min-h-screen overflow-scroll overflow-x-hidden bg-black"
    >
      <MainSideBar where={'move-crew'}>
        {/* 1. Hero - Hook emocional inicial */}
        <MoveCrewHero />
        
        {/* 2. Highlights - Valor inmediato (qué recibís) */}
        <MoveCrewHighlights />
        
        {/* 2.5. Method Video - Demostración del método (después de valor) */}
        <MoveCrewMethodVideo />
        
        {/* 3. IsForYou - Calificación temprana (filtra antes de precios) */}
        <MoveCrewIsForYou />
        
        {/* 3.5. Community Slider - Refuerzo social (después de identificación) */}
        <MoveCrewCommunitySlider />
        
        {/* 4. Testimonials - Prueba social (construye confianza) */}
        <MoveCrewTestimonials />
        
        {/* 4.5. Results Slider - Impulso final (antes del precio) */}
        <MoveCrewResultsSlider />
        
        {/* 5. Plans - Precios y CTA principal (momento de decisión) */}
        <MoveCrewPlans plans={plans} promociones={promociones} />
        
        {/* 6. Description - Profundizar el "por qué" (después de ver precio) */}
        <MoveCrewDescription />
        
        {/* 7. Structure - Cómo funciona (refuerza después de precio) */}
        <MoveCrewStructure />
        
        {/* 8. FAQ - Objecciones finales (resuelve dudas) */}
        <MoveCrewFAQ />
        
        {/* 9. CTA Final - Última oportunidad */}
        <MoveCrewCTA />
        
        <FooterProfile />
        {promocionActiva && !auth.user?.subscription?.active && (
          <div className="pb-24 md:pb-28">
            <PromocionFooter promocion={promocionActiva} onCtaClick={handlePromocionClick} variant="movecrew" plans={plans} />
          </div>
        )}
      </MainSideBar>
    </div>
  );
};

export default MoveCrew;
