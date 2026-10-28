'use client'
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import MainSideBar from '../../MainSidebar/MainSideBar';
import FooterProfile from '../Profile/FooterProfile';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';
import { useAuth } from '../../../hooks/useAuth';
import { Plan } from '../../../../typings';
import { CursoPlanPago } from '../../../types/cursoLanding';
import CourseHero from './CourseHero';
import CourseFounder from './CourseFounder';
import CourseBetweenHeroSection from './CourseBetweenHeroSection';
import CourseFullWidthBanner from './CourseFullWidthBanner';
import CourseOutcomesHighlights from './CourseOutcomesHighlights';
import CourseHighlightsIntro from './CourseHighlightsIntro';
import CourseCTA from './CourseCTA';
import CourseScheduleCall from './CourseScheduleCall';
import CourseMobileBottomBar from './CourseMobileBottomBar';
import PromocionFooter from '../Membership/PromocionFooter';
import { useCursoLanding } from './CursoLandingContext';
import { userHasCourseAccessBySlug } from '../../../lib/clientCourseAccess';
import { CURSO_SALES_CALL_BOOKING_URL } from '../../../constants/cursoSalesCall';

// Below-the-fold: se cargan aparte del bundle inicial para no bloquear el primer render del hero.
const CourseHighlights = dynamic(() => import('./CourseHighlights'), { ssr: false });
const CourseTestimonials = dynamic(() => import('./CourseTestimonials'), { ssr: false });
const CoursePlans = dynamic(() => import('./CoursePlans'), { ssr: false });
const CourseFAQ = dynamic(() => import('./CourseFAQ'), { ssr: false });
const CourseWhatWeTeach = dynamic(() => import('./CourseWhatWeTeach'), { ssr: false });

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
  const { scrollToPlans, slug, cursoConfig } = useCursoLanding();
  const ventaPorLlamada = Boolean(cursoConfig.planes.ventaPorLlamada);
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
    if (ventaPorLlamada) {
      window.open(CURSO_SALES_CALL_BOOKING_URL, '_blank', 'noopener,noreferrer');
      return;
    }
    scrollToPlans();
  };



  return (
    <div
      ref={scrollContainerRef}
      className="relative lg:h-full min-h-screen overflow-scroll overflow-x-hidden bg-palette-cream"
    >
      <MainSideBar where={'membership'}>
        <CourseHero />
        <CourseBetweenHeroSection />
        <CourseHighlightsIntro />
        <CourseFullWidthBanner />
        <CourseOutcomesHighlights />
        <CourseHighlights hideIntro />
        <CourseFounder />
        <CourseTestimonials variant="written" showCta={false} />
        <CourseWhatWeTeach showModulos={false} />
        <CoursePlans plans={plans} promociones={promociones} checkoutPlans={checkoutPlans} />
        {ventaPorLlamada || slug === 'cuerpo-autonomo' ? (
          <CourseScheduleCall
            tone="quiet"
            hideHost
            showEyebrow={false}
            title="Si tenés dudas, podemos conversarlo."
            body="Si querés saber si Cuerpo Autónomo encaja con lo que estás buscando, podés agendar una llamada corta y sin compromiso."
            ctaLabel="Tengo una duda, quiero conversar"
          />
        ) : null}
        <CourseFAQ />
        <CourseCTA />

        <FooterProfile />
        {promocionActiva && !ventaPorLlamada && !userHasCourseAccessBySlug(auth.user, slug) && (
          <div className="pb-24 md:pb-28">
            <PromocionFooter
              promocion={promocionActiva}
              onCtaClick={handlePromocionClick}
              variant="movecrew"
              plans={plans}
            />
          </div>
        )}
        {(ventaPorLlamada || !promocionActiva) && <CourseMobileBottomBar />}
      </MainSideBar>
    </div>
  );
};

export default Course;
