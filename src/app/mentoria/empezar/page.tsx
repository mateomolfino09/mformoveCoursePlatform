'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import MainSideBar from '../../../components/MainSidebar/MainSideBar';
import FooterProfile from '../../../components/PageComponent/Profile/FooterProfile';
import MentorshipCheckoutStart from '../../../components/PageComponent/Mentorship/MentorshipCheckoutStart';
import { useMentorshipEmpezarBootstrap } from '../../../hooks/useMentorshipEmpezarBootstrap';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';

export default function MentoriaEmpezarPage() {
  const searchParams = useSearchParams();
  const interval = searchParams.get('interval');
  const bootstrap = useMentorshipEmpezarBootstrap(interval);
  const dispatch = useAppDispatch();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

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

  if (bootstrap.status === 'error') {
    return (
      <div className="min-h-screen bg-palette-cream flex flex-col items-center justify-center text-palette-ink font-montserrat px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Tuvimos un problema</h1>
        <p className="text-base md:text-lg text-palette-stone max-w-xl mb-6">{bootstrap.message}</p>
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

  return (
    <div
      ref={scrollContainerRef}
      className="relative min-h-screen overflow-x-hidden bg-palette-cream font-montserrat text-palette-ink"
    >
      <MainSideBar where="membership" forceStandardHeader>
        {bootstrap.status === 'loading' ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-palette-stone">Cargando checkout…</p>
          </div>
        ) : (
          <MentorshipCheckoutStart payload={bootstrap.payload} />
        )}
        <FooterProfile />
      </MainSideBar>
    </div>
  );
}
