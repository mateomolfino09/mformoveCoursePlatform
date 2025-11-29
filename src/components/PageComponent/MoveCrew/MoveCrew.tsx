'use client'
import { useEffect } from 'react';
import MainSideBar from '../../MainSidebar/MainSideBar';
import FooterProfile from '../Profile/FooterProfile';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerHomeSlice';
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

interface MoveCrewProps {
  plans: Plan[];
}

const MoveCrew = ({ plans }: MoveCrewProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(toggleScroll(false));
  }, [dispatch]);

  const handleScroll = (event: any) => {
    const isTop = event.target.scrollTop === 0;
    dispatch(toggleScroll(!isTop));
  };

  return (
    <div
      className="relative lg:h-full min-h-screen overflow-scroll overflow-x-hidden bg-black"
      onScroll={handleScroll}
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
        <MoveCrewPlans plans={plans} />
        
        {/* 6. Description - Profundizar el "por qué" (después de ver precio) */}
        <MoveCrewDescription />
        
        {/* 7. Structure - Cómo funciona (refuerza después de precio) */}
        <MoveCrewStructure />
        
        {/* 8. FAQ - Objecciones finales (resuelve dudas) */}
        <MoveCrewFAQ />
        
        {/* 9. CTA Final - Última oportunidad */}
        <MoveCrewCTA />
        
        <FooterProfile />
      </MainSideBar>
    </div>
  );
};

export default MoveCrew;
