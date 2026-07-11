'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, type RefObject, type Ref } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { CldImage } from 'next-cloudinary';
import { routes } from '../../../constants/routes';
import MentorshipApplyButton from '../../../components/PageComponent/Mentorship/MentorshipApplyButton';
import { MENTORSHIP_LANDING_CTA } from '../../../constants/mentorshipCta';
import imageLoader from '../../../../imageLoader';
import type { IndexLatestCursoPayload } from '../../../types/indexLatestCurso';

const MENTORSHIP_PILLARS = [
  {
    label: 'Handbalance',
    poster:
      'https://res.cloudinary.com/dbeem2avp/image/upload/v1764272388/my_uploads/fondos/DSC01472_mvzgw7.jpg',
  },
  {
    label: 'Movilidad',
    poster:
      'https://res.cloudinary.com/dbeem2avp/image/upload/v1765658798/my_uploads/fondos/DSC01753_qdv9o0.jpg',
  },
  {
    label: 'Locomociones',
    poster:
      'https://res.cloudinary.com/dbeem2avp/image/upload/v1769777236/DSC01884_grva4a.jpg',
  },
] as const;

function IndexMentorshipPromoSection({
  sectionRef,
  y,
  opacity,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  y: MotionValue<number>;
  opacity: MotionValue<number>;
}) {
  return (
    <section
      ref={sectionRef as Ref<HTMLElement>}
      className="relative w-full font-montserrat overflow-hidden flex justify-center"
      style={{ backgroundColor: '#FAF8F5' }}
    >
      <motion.div
        style={{ y, opacity }}
        className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-16"
      >
        <p className="text-xs md:text-sm font-light tracking-[0.2em] uppercase text-gray-500 mb-4 text-center">
          Mentoría 1:1
        </p>

        <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-gray-900 tracking-tight mb-3 text-center">
          Acompañamiento personalizado
        </h2>

        <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mb-16 md:mb-20 mx-auto text-center">
          Trabajá handbalance, movilidad y locomociones con seguimiento semanal, feedback y una llamada al mes.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 mb-16 w-full max-w-5xl mx-auto"
        >
          {MENTORSHIP_PILLARS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="w-full flex flex-col items-center"
            >
              <div className="group relative w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-gray-200/80 shadow-sm ring-1 ring-black/5 transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg hover:ring-black/10">
                <Image
                  src={item.poster}
                  alt={item.label}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loader={imageLoader}
                />
              </div>
              <span className="mt-4 text-sm font-medium tracking-wide text-gray-700">{item.label}</span>
              <p className="mt-2 text-center text-sm text-gray-500 font-light max-w-[14rem]">
                {item.label === 'Handbalance' && 'Progresión guiada en equilibrio y control.'}
                {item.label === 'Movilidad' && 'Más rango, menos rigidez, con criterio.'}
                {item.label === 'Locomociones' && 'Patrones de movimiento en el suelo y en transición.'}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 px-2"
        >
          <MentorshipApplyButton
            variant="custom"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-8 py-3 text-sm font-medium text-[#FAF8F5] transition-all duration-300 hover:bg-gray-800 md:text-base"
            showArrow={false}
          />
          <Link
            href={MENTORSHIP_LANDING_CTA.href}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border-2 border-gray-900 text-gray-900 font-medium text-sm md:text-base hover:bg-palette-sage hover:border-palette-sage hover:text-palette-ink transition-all duration-300"
          >
            {MENTORSHIP_LANDING_CTA.label}
            <ArrowRightIcon className="w-4 h-4 shrink-0" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default function IndexMovementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 0.15, 0.5], [24, 0, -12]);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.2], [0.6, 1, 1]);

  const [curso, setCurso] = useState<IndexLatestCursoPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/product/index-latest-curso', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { curso: null }))
      .then((data: { curso?: IndexLatestCursoPayload | null }) => {
        if (!cancelled) setCurso(data?.curso ?? null);
      })
      .catch(() => {
        if (!cancelled) setCurso(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && !curso) {
    return <IndexMentorshipPromoSection sectionRef={sectionRef} y={y} opacity={opacity} />;
  }

  const cursoHref = curso ? routes.navegation.membership.curso(curso.slug) : routes.navegation.mentorship;
  const primaryLabel =
    curso?.titulo?.trim() ||
    (!loading ? 'Explorar MMOVE Academy' : 'Cargando…');

  return (
    <section
      ref={sectionRef}
      className="relative w-full font-montserrat overflow-hidden flex justify-center"
      style={{ backgroundColor: '#FAF8F5' }}
    >
      <motion.div
        style={{ y, opacity }}
        className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-16"
      >
        <motion.h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-gray-900 tracking-tight mb-3 text-center">
          {loading ? (
            <span className="inline-block h-12 md:h-16 w-64 mx-auto rounded-lg bg-gray-200/70 animate-pulse" aria-hidden />
          ) : (
            curso?.titulo
          )}
        </motion.h2>

        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          {loading ? (
            <motion.div
              style={{ opacity }}
              className="h-14 mx-auto max-w-xl rounded-lg bg-gray-200/70 animate-pulse"
              aria-hidden
            />
          ) : curso?.subtitulo ? (
            <motion.p style={{ opacity }} className="text-lg md:text-xl text-gray-600 font-light">
              {curso.subtitulo}
            </motion.p>
          ) : null}
        </div>

        {!loading && curso?.cuerpoIntro ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start mb-14 md:mb-20 max-w-6xl mx-auto"
          >
            <motion.div
              style={{ opacity }}
              className="relative w-full aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden bg-gray-200/80 shadow-sm ring-1 ring-black/5"
            >
              {curso.imagenIntroPublicId ? (
                <CldImage
                  src={curso.imagenIntroPublicId}
                  alt={curso.titulo}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  loader={imageLoader}
                />
              ) : (
                <motion.div
                  style={{ opacity }}
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200/90 text-gray-500 font-light"
                >
                  Imagen del programa
                </motion.div>
              )}
            </motion.div>
            <motion.div style={{ opacity }} className="flex flex-col justify-center">
              <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed whitespace-pre-line">
                {curso.cuerpoIntro}
              </p>
              <Link
                href={cursoHref}
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-gray-900 group w-fit"
              >
                <span className="relative before:content-[''] before:h-[1px] before:absolute before:w-full before:bottom-[-3px] before:left-0 before:bg-gray-900/40 group-hover:before:bg-gray-900 before:transition-colors">
                  Ver página del programa
                </span>
                <ArrowRightIcon className="w-4 h-4 text-gray-700 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        ) : null}


      </motion.div>
    </section>
  );
}
