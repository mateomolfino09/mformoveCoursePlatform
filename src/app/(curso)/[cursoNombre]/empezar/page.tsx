'use client';

import { useEffect, useRef } from 'react';
import MainSideBar from '../../../../components/MainSidebar/MainSideBar';
import FooterProfile from '../../../../components/PageComponent/Profile/FooterProfile';
import CourseCheckoutStart from '../../../../components/PageComponent/Course/CourseCheckoutStart';
import { CourseCheckoutSkeletonBody } from '../../../../components/PageComponent/Course/CourseCheckoutSkeleton';
import { CursoLandingProvider } from '../../../../components/PageComponent/Course/CursoLandingContext';
import state from '../../../../valtio';
import { formatTitleCaseWords } from '../../../../lib/formatDisplayTitle';
import { useCursoEmpezarBootstrap } from '../../../../hooks/useCursoEmpezarBootstrap';
import { useAppDispatch } from '../../../../redux/hooks';
import { toggleScroll } from '../../../../redux/features/headerLibrarySlice';

interface CursoEmpezarPageProps {
  params: {
    cursoNombre: string;
  };
}

export default function CursoEmpezarPage({ params }: CursoEmpezarPageProps) {
  const bootstrap = useCursoEmpezarBootstrap(params.cursoNombre);
  const dispatch = useAppDispatch();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // El header (landing de curso) usa el estado de scroll de Redux para pintar su fondo.
  // En esta página el scroll ocurre dentro del contenedor (overflow-y), no en la ventana,
  // así que escuchamos ese contenedor (con fallback a window) y actualizamos el estado.
  useEffect(() => {
    const el = scrollContainerRef.current;
    dispatch(toggleScroll(false));

    let rafId: number | null = null;
    const update = () => {
      const scrollTop = (el?.scrollTop || 0) || window.scrollY;
      dispatch(toggleScroll(scrollTop > 0));
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        update();
      });
    };

    update();
    el?.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
      dispatch(toggleScroll(false));
    };
  }, [dispatch]);

  useEffect(() => {
    if (bootstrap.status !== 'checkout') return;
    const landing = bootstrap.payload;
    const raw =
      landing.product?.nombre?.trim() ||
      landing.cursoConfig.introHighlights.titulo?.trim() ||
      '';
    state.cursoHeaderTitle = raw ? formatTitleCaseWords(raw) : null;
  }, [bootstrap]);

  useEffect(() => {
    return () => {
      state.cursoHeaderTitle = null;
    };
  }, []);

  if (bootstrap.status === 'error') {
    return (
      <div className="min-h-screen bg-palette-cream flex flex-col items-center justify-center text-palette-ink font-montserrat px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Tuvimos un problema</h1>
        <p className="text-base md:text-lg text-palette-stone max-w-xl mb-6">
          {bootstrap.message}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-palette-ink text-palette-cream border-2 border-palette-ink hover:bg-palette-sage hover:border-palette-sage hover:text-palette-ink rounded-xl font-semibold transition-all duration-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const isLoading = bootstrap.status === 'loading';
  const landing = bootstrap.status === 'checkout' ? bootstrap.payload : null;

  return (
    <div
      ref={scrollContainerRef}
      className="relative min-h-screen overflow-x-hidden bg-palette-cream font-montserrat text-palette-ink"
    >
      <MainSideBar where="membership" forceStandardHeader>
        {isLoading ? (
          <CourseCheckoutSkeletonBody />
        ) : landing ? (
          <CursoLandingProvider
            cursoConfig={landing.cursoConfig}
            productName={landing.product?.nombre || landing.cursoConfig.introHighlights.titulo}
            slug={params.cursoNombre}
          >
            <CourseCheckoutStart
              checkoutPlans={landing.opcionesPago}
              checkoutImagePublicId={
                landing.cursoConfig.imagenCheckoutPublicId || landing.product?.portada || ''
              }
              productId={
                landing.product?._id != null ? String(landing.product._id) : undefined
              }
              pricingModo={landing.pricingModo}
              preventaTierIndex={landing.preventaTierIndex}
            />
          </CursoLandingProvider>
        ) : null}
        <FooterProfile />
      </MainSideBar>
    </div>
  );
}
