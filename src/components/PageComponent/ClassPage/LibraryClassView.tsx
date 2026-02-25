'use client';

import React, { useEffect, useState } from 'react';
import { IndividualClass, Question } from '../../../../typings';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import MainSideBar from '../../MainSidebar/MainSideBar';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';
import { useAuth } from '../../../hooks/useAuth';
import OnboardingGuard from '../../OnboardingGuard';
import Footer from '../../Footer';
import MoveCrewVideoPlayer from './MoveCrewVideoPlayer';
import ClassQuestions from './ClassQuestions';
import ClassResources from './ClassResources';
import RecommendedClasses from './RecommendedClasses';
import state from '../../../valtio';
import { useSnapshot } from 'valtio';
import { routes } from '../../../constants/routes';

interface Props {
  clase: IndividualClass;
  questions: Question[] | undefined;
}

export default function LibraryClassView({ clase, questions }: Props) {
  const router = useRouter();
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const snap = useSnapshot(state);
  const [hasWindow, setHasWindow] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') setHasWindow(true);
  }, []);

  useEffect(() => {
    if (!state.classHeaders || state.classHeaders === 'Temario') state.classHeaders = 'Preguntas';
  }, []);

  useEffect(() => {
    if (clase?.isFree) {
      if (typeof window !== 'undefined') setHasWindow(true);
      return;
    }
    const cookies = typeof document !== 'undefined' ? document.cookie : '';
    const hasCookie = !!cookies.split(';').some((c) => c.trim().startsWith('userToken='));
    if (!hasCookie) {
      router.push('/move-crew');
      return;
    }
    if (!auth.user || typeof auth.user.subscription === 'undefined') {
      auth.fetchUser();
      return;
    }
    const hasAccess =
      auth.user.subscription?.active || auth.user.isVip || auth.user.rol === 'Admin';
    if (!hasAccess) {
      router.push('/move-crew');
      return;
    }
    if (typeof window !== 'undefined') setHasWindow(true);
  }, [router, auth.user, clase?.isFree, auth]);

  useEffect(() => {
    const handleScroll = () => dispatch(toggleScroll(window.scrollY > 0));
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  return (
    <OnboardingGuard>
      <MainSideBar where="library">
        <div className="relative min-h-screen bg-palette-cream overflow-x-hidden font-montserrat">
          <main className="relative flex flex-col">
            {/* Breadcrumb: solo desktop; en móvil no se muestra para dar más espacio al video */}
            <section className="hidden md:block bg-palette-cream pt-16 md:pt-24 lg:pt-28">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-4 md:py-5">
                <nav className="flex items-center gap-2 text-sm text-palette-stone">
                  <Link
                    href={routes.navegation.membership.library}
                    className="hover:text-palette-ink transition-colors"
                  >
                    Biblioteca
                  </Link>
                  <span aria-hidden>/</span>
                  <Link
                    href={routes.navegation.membership.individualClasses}
                    className="hover:text-palette-ink transition-colors"
                  >
                    Clases individuales
                  </Link>
                  <span aria-hidden>/</span>
                  <span className="text-palette-ink font-medium truncate max-w-[180px] md:max-w-none">
                    {clase.name}
                  </span>
                </nav>
              </div>
            </section>

            {/* Video: en móvil ancho completo bajo el header; flecha atrás solo móvil */}
            <section className="bg-palette-cream pt-14 md:pt-8 pb-8 md:pb-12">
              <div className="relative w-full md:max-w-7xl md:mx-auto md:px-12 lg:px-16 xl:px-24 2xl:px-32">
                {/* Flecha volver a clases individuales (solo móvil) */}
                <Link
                  href={routes.navegation.membership.individualClasses}
                  className="md:hidden absolute left-3 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-palette-ink/80 text-palette-cream backdrop-blur-sm hover:bg-palette-ink focus:outline-none focus:ring-2 focus:ring-palette-sage"
                  aria-label="Volver a clases individuales"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </Link>
                {hasWindow && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full rounded-none md:rounded-2xl lg:rounded-3xl overflow-hidden bg-palette-ink ring-0 md:ring-1 md:ring-palette-stone/10 md:shadow-xl"
                  >
                    <MoveCrewVideoPlayer videoId={clase.link} userStartsPlayback className="rounded-none md:rounded-2xl lg:rounded-3xl" />
                  </motion.div>
                )}
              </div>
            </section>

            {/* Contenido debajo del video: alineado a la izquierda en web */}
            <section className="bg-palette-cream pb-12 md:pb-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
                <div className="max-w-3xl mr-auto text-left space-y-6 md:space-y-8">
                  {/* Título y meta */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="space-y-2 md:space-y-3"
                  >
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-medium text-palette-ink tracking-tight leading-tight">
                      {clase.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-palette-stone">
                      <span>{clase.minutes} min</span>
                      {clase.type && (
                        <>
                          <span className="text-palette-stone/50">·</span>
                          <span className="uppercase tracking-wide">{clase.type}</span>
                        </>
                      )}
                    </div>
                    {clase.tags && clase.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {clase.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs font-medium text-palette-stone"
                          >
                            {tag.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* Descripción: sin caja, texto directo */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                  >
                    <p className="text-palette-ink/90 text-[15px] sm:text-base md:text-lg font-light leading-relaxed">
                      {clase.description}
                    </p>
                  </motion.div>

                  {/* Tabs Recursos / Preguntas - línea sutil */}
                  <div className="border-b border-palette-stone/10">
                    <div className="flex gap-0.5">
                      <button
                        type="button"
                        onClick={() => { state.classHeaders = 'Recursos'; }}
                        className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                          snap.classHeaders === 'Recursos'
                            ? 'text-palette-ink'
                            : 'text-palette-stone hover:text-palette-ink'
                        }`}
                      >
                        Recursos
                        {snap.classHeaders === 'Recursos' && (
                          <motion.div
                            layoutId="libraryActiveTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-palette-sage"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => { state.classHeaders = 'Preguntas'; }}
                        className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                          snap.classHeaders === 'Preguntas' || snap.classHeaders === 'Temario' || !snap.classHeaders
                            ? 'text-palette-ink'
                            : 'text-palette-stone hover:text-palette-ink'
                        }`}
                      >
                        Preguntas
                        {(snap.classHeaders === 'Preguntas' || !snap.classHeaders || snap.classHeaders === 'Temario') && (
                          <motion.div
                            layoutId="libraryActiveTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-palette-sage"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Contenido del tab activo */}
                  <div className="min-h-[280px] md:min-h-[320px]">
                    {snap.classHeaders === 'Recursos' ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ClassResources clase={clase} />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ClassQuestions
                          user={auth.user}
                          clase={clase}
                          questionsDB={questions ?? []}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Recomendadas */}
            <RecommendedClasses
              currentClassId={clase._id || clase.id}
              currentClassType={clase.type}
              classLinkBase="/library/individual-classes"
            />

            <section className="mt-24 md:mt-32 w-full">
              <Footer />
            </section>
          </main>
        </div>
      </MainSideBar>
    </OnboardingGuard>
  );
}
