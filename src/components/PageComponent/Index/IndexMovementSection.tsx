'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, type RefObject, type Ref } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import { routes } from '../../../constants/routes';
import MentorshipApplyButton from '../../../components/PageComponent/Mentorship/MentorshipApplyButton';
import { MENTORSHIP_LANDING_CTA } from '../../../constants/mentorshipCta';
import {
  landingCtaPrimary,
  landingEyebrow,
  landingEyebrowDark,
  landingFadeUp,
  landingSectionBody,
  landingSectionBodyDark,
  landingSectionBodyMuted,
  landingSectionContainer,
  landingSectionShell,
  landingSectionTitle,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';
import imageLoader from '../../../../imageLoader';
import type { IndexLatestCursoPayload } from '../../../types/indexLatestCurso';

const MENTORSHIP_PILLARS = [
  {
    label: 'Handbalance',
    poster:
      'https://res.cloudinary.com/dbeem2avp/image/upload/v1764272388/my_uploads/fondos/DSC01472_mvzgw7.jpg',
    blurb: 'Progresión guiada en equilibrio y control.',
  },
  {
    label: 'Movilidad',
    poster:
      'https://res.cloudinary.com/dbeem2avp/image/upload/v1765658798/my_uploads/fondos/DSC01753_qdv9o0.jpg',
    blurb: 'Más rango, menos rigidez, con criterio.',
  },
  {
    label: 'Locomociones',
    poster:
      'https://res.cloudinary.com/dbeem2avp/image/upload/v1769777236/DSC01884_grva4a.jpg',
    blurb: 'Patrones de movimiento en el suelo y en transición.',
  },
] as const;

const MENTORSHIP_CTA_BG = 'my_uploads/plaza/DSC03350_vgjrrh';

/** Misma escala para todos los CTAs del bloque (un poco más chicos que la landing). */
const landingCtaOutline =
  'group inline-flex w-full max-w-full min-w-0 items-center justify-center gap-2 rounded-full border-2 border-palette-ink bg-transparent px-5 py-2.5 text-center font-montserrat text-xs font-semibold uppercase tracking-[0.16em] text-palette-ink transition-all duration-200 hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink sm:w-auto sm:px-6 sm:py-3 sm:text-[13px]'

const landingCtaOutlineOnDark =
  'group inline-flex w-full max-w-full min-w-0 items-center justify-center gap-2 rounded-full border-2 border-palette-cream/80 bg-transparent px-5 py-2.5 text-center font-montserrat text-xs font-semibold uppercase tracking-[0.16em] text-palette-cream transition-all duration-200 hover:border-white hover:bg-white/10 sm:w-auto sm:px-6 sm:py-3 sm:text-[13px]'

const ctaMatchOutline =
  'w-full max-w-full min-w-0 justify-center !px-5 !py-2.5 text-xs tracking-[0.16em] sm:w-auto sm:!px-6 sm:!py-3 sm:text-[13px]'

function MentorshipCtaActions({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex w-full min-w-0 flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4 ${className}`}
    >
      <MentorshipApplyButton variant="primary" className={ctaMatchOutline} />
      <Link href={MENTORSHIP_LANDING_CTA.href} className={landingCtaOutline}>
        {MENTORSHIP_LANDING_CTA.label}
        <span className="shrink-0 opacity-80 transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      </Link>
    </div>
  );
}

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
      className={`relative w-full overflow-hidden ${landingSectionShell}`}
    >
      <motion.div style={{ y, opacity }} className={`${landingSectionContainer} min-w-0`}>
        <div className="mx-auto max-w-3xl min-w-0 px-0.5 text-center">
          <p className={`${landingEyebrow} break-words`}>Mentoría 1:1</p>
          <h2 className={`${landingSectionTitle} max-w-full break-words text-balance`}>
            Acompañamiento personalizado
          </h2>
          <p className={`${landingSectionBodyMuted} mx-auto max-w-2xl break-words`}>
            Trabajá handbalance, movilidad y locomociones con seguimiento semanal, feedback y una
            llamada al mes.
          </p>
        </div>

        <motion.div
          {...landingFadeUp}
          className="mx-auto mt-12 mb-14 grid w-full max-w-5xl grid-cols-1 gap-6 md:mt-16 md:mb-16 md:grid-cols-3 md:gap-8 lg:gap-10"
        >
          {MENTORSHIP_PILLARS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex w-full flex-col items-center"
            >
              <div className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-palette-stone/20 bg-palette-stone/10 shadow-[0_16px_48px_-20px_rgba(20,20,17,0.14)] transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_20px_50px_-24px_rgba(20,20,17,0.16)] md:rounded-3xl">
                <Image
                  src={item.poster}
                  alt={item.label}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loader={imageLoader}
                />
              </div>
              <span className="mt-4 text-sm font-semibold tracking-[0.08em] text-palette-ink">
                {item.label}
              </span>
              <p className="mt-2 max-w-[14rem] text-center text-sm font-normal leading-relaxed text-palette-stone">
                {item.blurb}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div {...landingFadeUp} transition={{ ...landingFadeUp.transition, delay: 0.12 }}>
          <MentorshipCtaActions />
        </motion.div>
      </motion.div>
    </section>
  );
}

function IndexMentorshipBand() {
  return (
    <motion.div
      {...landingFadeUp}
      className="mx-auto mt-6 w-full min-w-0 max-w-6xl md:mt-10"
    >
      <div className="relative overflow-hidden rounded-2xl border border-palette-stone/25 md:rounded-3xl">
        <div className="pointer-events-none absolute inset-0 z-0">
          <CldImage
            src={MENTORSHIP_CTA_BG}
            alt=""
            fill
            sizes="(max-width: 1280px) 92vw, 1152px"
            className="object-cover object-[center_42%] opacity-80"
            loader={imageLoader}
            preserveTransformations
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-palette-ink/90 via-palette-ink/70 to-palette-ink/35" />
        <div className="absolute inset-0 z-[1] bg-palette-ink/20" />

        <div className="relative z-[2] box-border w-full min-w-0 overflow-hidden px-4 py-8 text-center sm:px-6 sm:py-10 md:px-10 md:py-12 md:text-left">
          <p className={`${landingEyebrowDark} break-words !text-palette-cream/70`}>Mentoría 1:1</p>
          <h3
            className={`${landingSectionTitleDark} !mt-2 mx-auto max-w-full break-words text-balance !text-[1.45rem] !leading-[1.2] sm:!text-[2.15rem] md:mx-0 md:max-w-2xl md:!text-[2.85rem] lg:!text-[3.35rem]`}
          >
            ¿Preferís un acompañamiento personalizado?
          </h3>
          <p
            className={`${landingSectionBodyDark} mx-auto max-w-full break-words !text-[15px] md:mx-0 md:max-w-xl md:!text-[18px]`}
          >
            Handbalance, movilidad y locomociones con seguimiento semanal, feedback y una llamada al
            mes.
          </p>

          <div className="mt-7 flex w-full min-w-0 flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-start sm:gap-4">
            <MentorshipApplyButton
              variant="inverted"
              className={`${ctaMatchOutline} !justify-center`}
            />
            <Link href={MENTORSHIP_LANDING_CTA.href} className={landingCtaOutlineOnDark}>
              {MENTORSHIP_LANDING_CTA.label}
              <span className="shrink-0 opacity-80 transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
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

  return (
    <section
      ref={sectionRef}
      className={`relative w-full overflow-hidden ${landingSectionShell}`}
    >
      <motion.div style={{ y, opacity }} className={`${landingSectionContainer} min-w-0`}>
        <div className="mx-auto max-w-3xl min-w-0 text-center">
          {loading ? (
            <span
              className="mx-auto mb-3 inline-block h-10 w-40 animate-pulse rounded bg-palette-stone/15 md:h-12 md:w-52"
              aria-hidden
            />
          ) : (
            <p className={`${landingEyebrow} break-words`}>Programa</p>
          )}

          <h2 className={`${landingSectionTitle} max-w-full break-words text-balance`}>
            {loading ? (
              <span
                className="mx-auto inline-block h-12 w-64 max-w-full animate-pulse rounded-lg bg-palette-stone/15 md:h-16"
                aria-hidden
              />
            ) : (
              curso?.titulo
            )}
          </h2>

          {loading ? (
            <div
              className="mx-auto mt-5 h-14 max-w-xl animate-pulse rounded-lg bg-palette-stone/15"
              aria-hidden
            />
          ) : curso?.subtitulo ? (
            <p className={`${landingSectionBodyMuted} mx-auto max-w-2xl break-words`}>
              {curso.subtitulo}
            </p>
          ) : null}
        </div>

        {!loading && curso?.cuerpoIntro ? (
          <motion.div
            {...landingFadeUp}
            className="mx-auto mt-12 mb-14 grid max-w-6xl min-w-0 grid-cols-1 items-start gap-10 md:mb-16 md:mt-16 lg:grid-cols-2 lg:gap-14"
          >
            <div className="relative aspect-[4/5] w-full min-w-0 overflow-hidden rounded-2xl border border-palette-stone/20 bg-palette-stone/10 shadow-[0_16px_48px_-20px_rgba(20,20,17,0.14)] md:rounded-3xl md:shadow-[0_20px_50px_-24px_rgba(20,20,17,0.12)]">
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
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-palette-cream to-palette-stone/20 font-normal text-palette-stone">
                  Imagen del programa
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-col justify-center">
              <p className={`${landingSectionBody} !mt-0 break-words whitespace-pre-line`}>
                {curso.cuerpoIntro}
              </p>
              <Link
                href={cursoHref}
                className={`${landingCtaPrimary} mt-8 w-full max-w-full min-w-0 !px-5 !py-2.5 text-xs tracking-[0.16em] sm:w-auto sm:!px-6 sm:!py-3 sm:text-[13px]`}
              >
                Ver página del programa
                <span className="shrink-0 opacity-80 transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          </motion.div>
        ) : null}

        {!loading ? <IndexMentorshipBand /> : null}
      </motion.div>
    </section>
  );
}
