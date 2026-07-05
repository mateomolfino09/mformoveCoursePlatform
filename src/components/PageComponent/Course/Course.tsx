'use client'
import { useEffect, useRef, useState } from 'react';
import MainSideBar from '../../MainSidebar/MainSideBar';
import FooterProfile from '../Profile/FooterProfile';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';
import { useAuth } from '../../../hooks/useAuth';
import { Plan } from '../../../../typings';
import { CursoPlanPago } from '../../../types/cursoLanding';
import CourseHero from './CourseHero';
import CourseBetweenHeroSection from './CourseBetweenHeroSection';
import CourseFullWidthBanner from './CourseFullWidthBanner';
import CourseOutcomesHighlights from './CourseOutcomesHighlights';
import CourseHighlightsIntro from './CourseHighlightsIntro';
import CourseHighlights from './CourseHighlights';
import CourseTestimonials from './CourseTestimonials';
import CoursePlans from './CoursePlans';
import CourseFAQ from './CourseFAQ';
import CourseWhatsAppBanner from './CourseWhatsAppBanner';
import CourseCTA from './CourseCTA';
import PromocionFooter from '../Membership/PromocionFooter';
import CourseWhatWeTeach from './CourseWhatWeTeach';
import { useCursoLanding } from './CursoLandingContext';

interface Promocion {
  _id: string;
  nombre: string;
  descripcion?: string;
  porcentajeDescuento: number;
  frecuenciasAplicables: string[];
  fechaFin: string;
  codigoPromocional?: string;
}

interface CourseProps {
  plans?: Plan[];
  promociones?: Promocion[];
  checkoutPlans?: CursoPlanPago[];
}

const Course = ({ plans = [], promociones = [], checkoutPlans = [] }: CourseProps) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const { scrollToPlans } = useCursoLanding();
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
        new CustomEvent('course-scroll', {
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
    scrollToPlans();
  };



  return (
    <div
      ref={scrollContainerRef}
      className="relative lg:h-full min-h-screen overflow-scroll overflow-x-hidden bg-palette-cream"
    >
      <MainSideBar where={'membership'}>
        {/* 1. Hero - Hook emocional inicial */}
        <CourseHero />

        {/* 1.5. Nueva narrativa - pantalla completa */}
        <CourseBetweenHeroSection />

        <CourseFullWidthBanner />

        {/* 2. Testimonios en video (tras el banner); los escritos van después de Outcomes */}
        <CourseTestimonials variant="clientVideos" showCta={false} />

        {/* 3. Intro método (banda + texto/foto) */}
        <CourseHighlightsIntro />

        {/* 3.b Resultados esperables (outcomes) */}
        <CourseOutcomesHighlights />

        <CourseTestimonials variant="written" />

        {/* 3.c Highlights - Línea de tiempo del método (sin intro duplicada) */}
        <CourseHighlights hideIntro />
        
        {/* 3.5. Lo que enseñamos - Disciplinas (fotos de Index) */}
        <CourseWhatWeTeach />
        
        {/* 6. Plans - Precios y CTA principal (momento de decisión) */}
        <CoursePlans plans={plans} promociones={promociones} checkoutPlans={checkoutPlans} />

        {/* 9. FAQ - Objecciones finales (resuelve dudas antes del cierre) */}
        <CourseFAQ />

        {/* Contacto — full width */}
        <CourseWhatsAppBanner />
        
        {/* 10. CTA Final - Última oportunidad */}
        <CourseCTA />
        
        <FooterProfile />
        {promocionActiva && !auth.user?.subscription?.active && (
          <div className="pb-24 md:pb-28">
            <PromocionFooter
              promocion={promocionActiva}
              onCtaClick={handlePromocionClick}
              variant="movecrew"
              plans={plans}
            />
          </div>
        )}
      </MainSideBar>
    </div>
  );
};

export default Course;
