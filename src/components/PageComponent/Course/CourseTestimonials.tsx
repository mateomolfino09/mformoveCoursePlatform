'use client'
import { motion, useReducedMotion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { useCursoLanding } from './CursoLandingContext';
import {
  landingEyebrow,
  landingSectionContainer,
  landingSectionShell,
  landingSectionTitle,
} from '../../../constants/landingSectionDesign';

export type CourseTestimonialsVariant = 'community' | 'clientVideos' | 'written';

type CourseTestimonialsProps = {
  variant?: CourseTestimonialsVariant;
  /** Si es false, no muestra el CTA inferior (ej. primera de dos secciones seguidas). */
  showCta?: boolean;
};

/** Grano sutil para el panel de citas (marca de lectura, sin ruido fuerte). */
const WRITTEN_CARD_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

const CourseTestimonials = ({
  variant = 'community',
  showCta = true,
}: CourseTestimonialsProps) => {
  const reduceMotion = useReducedMotion();
  const { cursoConfig, scrollToPlans } = useCursoLanding();
  const { presentacionTestimonios } = cursoConfig;
  const testimonials = cursoConfig.testimoniosEscritos.map((item) => ({
    name: item.nombre,
    plan: item.planEtiqueta,
    photo: item.imagenUrl,
    text: item.texto,
  }));
  const videoTestimonials = cursoConfig.testimoniosGrabados.filter((item) =>
    Boolean(item.videoVimeoId?.trim())
  );

  if (variant === 'clientVideos' && videoTestimonials.length === 0) {
    return null;
  }

  const variantHeadings: Record<
    CourseTestimonialsVariant,
    { eyebrow: string | null; title: string; subtitle?: string | null }
  > = {
    community: {
      eyebrow: 'Comunidad',
      title: 'Lo que dice la comunidad...',
    },
    clientVideos: {
      eyebrow: null,
      title: presentacionTestimonios.tituloVideos,
      subtitle: null,
    },
    written: {
      eyebrow: presentacionTestimonios.eyebrowEscritos || null,
      title: presentacionTestimonios.tituloEscritos,
    },
  };

  const { eyebrow, title, subtitle } = variantHeadings[variant];
  const showHeader = variant !== 'written';
  const showCommunityCards = variant === 'community';
  const showWrittenDialogs = variant === 'written';
  const showVideoGrid = variant === 'clientVideos';

  const sectionId =
    variant === 'clientVideos'
      ? presentacionTestimonios.anclaVideos
      : variant === 'written'
        ? presentacionTestimonios.anclaEscritos
        : undefined;

  return (
    <section
      id={sectionId}
      className={`${landingSectionShell} relative isolate py-12 md:py-16 ${
        variant === 'written'
          ? 'text-palette-ink'
          : 'text-palette-ink'
      }`}
    >
      {variant === 'written' ? (
        <>
          <div
            className="pointer-events-none absolute -top-24 right-[-14%] h-[min(300px,48vw)] w-[min(300px,48vw)] rounded-full bg-palette-sage/12 blur-[100px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-[-8%] left-[-10%] h-[240px] w-[320px] rounded-full bg-palette-steel/10 blur-[96px]"
            aria-hidden
          />
        </>
      ) : null}

      <div className={`relative ${landingSectionContainer}`}>
        {showHeader && (eyebrow || title || subtitle) ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-36px' }}
            className="mx-auto mb-8 max-w-3xl text-center md:mb-10"
          >
            {eyebrow ? (
              <p className={`${landingEyebrow} mb-3`}>
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className={`${landingSectionTitle} mb-4`}>
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mx-auto max-w-2xl text-[15px] font-light leading-[1.65] text-palette-stone md:text-[16px]">
                {subtitle}
              </p>
            ) : null}
          </motion.div>
        ) : null}

        {showVideoGrid ? (
          <div className="mx-auto mb-10 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {videoTestimonials.map((item, index) => (
              <motion.div
                key={`${item.videoVimeoId}-${index}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                viewport={{ once: true }}
                className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-palette-steel/25 bg-palette-cream/50 md:rounded-3xl"
              >
                <iframe
                  src={`https://player.vimeo.com/video/${item.videoVimeoId}`}
                  title={item.titulo || `Testimonio ${index + 1}`}
                  className="h-full w-full rounded-2xl md:rounded-3xl"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </motion.div>
            ))}
          </div>
        ) : null}

        {showCommunityCards ? (
          <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-palette-steel/20 bg-palette-cloud/[0.45] p-6 shadow-[0_8px_32px_-8px_rgba(20,20,17,0.06)] backdrop-blur-[2px] md:rounded-3xl md:p-7"
              >
                <div className="absolute right-0 top-0 size-28 rounded-full bg-palette-sage/15 blur-2xl" />

                <div className="relative z-10">
                  <div className="mb-6">
                    <svg viewBox="0 0 24 24" className="h-8 w-8 text-palette-steel/40">
                      <path
                        fill="currentColor"
                        d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"
                      />
                    </svg>
                  </div>

                  <div className="mb-8 flex-1">
                    <p className="text-center text-base font-normal leading-relaxed text-palette-ink/92 md:text-lg">
                      {testimonial.text}
                    </p>
                  </div>

                  <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-palette-steel/35 to-transparent" />
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <div className="relative flex h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-palette-steel/30">
                      <CldImage
                        src={testimonial.photo}
                        alt={testimonial.name}
                        fill
                        className="object-cover grayscale-[30%]"
                        loader={imageLoader}
                        sizes="48px"
                      />
                    </div>
                    <div className="text-center">
                      <h4 className="mb-1 font-montserrat text-base font-semibold text-palette-ink md:text-lg">
                        {testimonial.name}
                      </h4>
                      <p className="font-light text-palette-stone text-sm md:text-base">{testimonial.plan}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}

        {showWrittenDialogs ? (
          <div className="relative mx-auto mb-10 w-full max-w-5xl md:mb-14">
  

            <div className="flex flex-col gap-14 md:gap-[4.5rem] lg:gap-24">
              {testimonials.map((testimonial, index) => {
                const photoOnRight = index % 2 === 0;

                return (
                  <motion.article
                    key={testimonial.name}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.48, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true, margin: '-48px' }}
                    className={`flex flex-col items-center gap-8 md:flex-row md:items-stretch md:gap-10 lg:gap-14 ${
                      index % 2 === 0 ? 'md:translate-y-0.5 lg:translate-y-1' : 'md:-translate-y-0.5 lg:-translate-y-px'
                    }`}
                  >
                    <div
                      className={`order-1 flex shrink-0 justify-center md:w-[min(100%,17.5rem)] lg:w-[min(100%,18.5rem)] ${
                        photoOnRight ? 'md:order-2 md:justify-end' : 'md:order-1 md:justify-start'
                      }`}
                    >
                      <div
                        className={`relative flex size-[min(13.5rem,74vw)] items-center justify-center sm:size-56 md:size-64 lg:size-[17rem] ${
                          photoOnRight ? 'md:rotate-[2deg]' : 'md:-rotate-[2deg]'
                        }`}
                      >
                        <div
                          className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-palette-sage/25 via-transparent to-palette-steel/20 opacity-90 blur-md md:opacity-100"
                          aria-hidden
                        />
                        <div className="absolute inset-2 rounded-full border border-palette-sage/20 md:inset-3" aria-hidden />
                        <div className="relative z-[1] h-full w-full overflow-hidden rounded-full shadow-[0_22px_48px_-16px_rgba(20,20,17,0.22)] ring-[3px] ring-palette-sage/30 ring-offset-2 ring-offset-palette-cream">
                          <CldImage
                            src={testimonial.photo}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                            loader={imageLoader}
                            sizes="(max-width: 640px) 74vw, (max-width: 1024px) 16rem, 17rem"
                          />
                        </div>
                        <span
                          className="pointer-events-none absolute -bottom-1 left-1/2 z-[2] hidden h-2 w-2 -translate-x-1/2 rounded-full bg-palette-sage/40 shadow-[0_0_12px_rgba(172,174,137,0.35)] md:block"
                          aria-hidden
                        />
                      </div>
                    </div>

                    <div
                      className={`order-2 flex min-w-0 flex-1 flex-col justify-center ${
                        photoOnRight ? 'md:order-1' : 'md:order-2'
                      }`}
                    >
                      <div className="relative w-full min-w-0">
                        {/* Sombra ambiental animada (detrás del globo) */}
                        {!reduceMotion ? (
                          <motion.div
                            aria-hidden
                            className="pointer-events-none absolute -inset-6 -z-10 rounded-[1.75rem] bg-gradient-to-br from-palette-sage/20 via-palette-granite/[0.15] to-transparent blur-2xl"
                            animate={{
                              opacity: [0.28, 0.48, 0.28],
                              scale: [1, 1.04, 1],
                            }}
                            transition={{
                              duration: 5.2 + index * 0.25,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: index * 0.2,
                            }}
                          />
                        ) : (
                          <div
                            aria-hidden
                            className="pointer-events-none absolute -inset-5 -z-10 rounded-[1.75rem] bg-gradient-to-br from-palette-sage/15 via-transparent to-palette-granite/20 opacity-50 blur-2xl"
                          />
                        )}

                        <motion.div
                          className="group/card relative z-[1] overflow-visible"
                          animate={
                            reduceMotion
                              ? undefined
                              : {
                                  y: [0, -5, 0],
                                }
                          }
                          transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: index * 0.38,
                          }}
                        >
                          <div
                            className={`relative flex overflow-hidden rounded-2xl border border-palette-skysteel/22 bg-palette-cream/95 shadow-[0_4px_0_0_rgba(20,20,17,0.06),0_24px_52px_-22px_rgba(10,10,8,0.55),inset_0_1px_0_rgba(255,253,253,0.75)] transition-[box-shadow,border-color] duration-300 ease-out md:rounded-[1.35rem] md:hover:border-palette-steel/42 md:hover:shadow-[0_6px_0_0_rgba(20,20,17,0.05),0_36px_70px_-28px_rgba(10,10,8,0.58),inset_0_1px_0_rgba(255,253,253,0.85)] motion-reduce:transition-none ${photoOnRight ? 'flex-row' : 'flex-row-reverse'}`}
                          >
                            {/* Franja lateral: comillas hacia el borde exterior (lejos de la foto) */}
                            <div
                              className={`relative flex w-[2.65rem] shrink-0 flex-col items-center justify-between bg-palette-cloud/45 py-7 md:w-[3.15rem] md:py-8 ${photoOnRight ? 'border-r border-palette-ink/[0.07]' : 'border-l border-palette-ink/[0.07]'}`}
                              aria-hidden
                            >
                              <span className="font-serif text-[2.85rem] leading-[0.8] text-palette-deepmoka/[0.13] md:text-[3.35rem]">
                                &ldquo;
                              </span>
                              <span className="font-serif text-[1.65rem] leading-none text-palette-deepmoka/[0.08] md:text-[1.85rem]">
                                &rdquo;
                              </span>
                            </div>

                            <div className="relative min-w-0 flex-1 px-5 py-7 md:px-8 md:py-8">
                              <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 opacity-[0.042] mix-blend-multiply"
                                style={{ backgroundImage: WRITTEN_CARD_NOISE, backgroundSize: '100px 100px' }}
                              />
                              <span
                                aria-hidden
                                className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-palette-skysteel/5 to-transparent md:inset-x-8"
                              />
                              <div className="relative z-[1]">
                                <blockquote className="font-raleway text-[1rem] font-normal leading-[1.74] text-palette-ink [text-wrap:pretty] md:text-[1.085rem] md:leading-[1.72]">
                                  <span className="sr-only">Cita: </span>
                                  {testimonial.text}
                                </blockquote>
                                <footer className="mt-6 border-t border-palette-ink/[0.08] pt-5 not-italic">
                                  <p className="font-montserrat text-base font-semibold text-palette-ink md:text-lg">
                                    {testimonial.name}
                                  </p>
                                  <p className="mt-1 font-raleway text-sm text-palette-stone md:text-[0.9375rem]">
                                    <span className="inline-flex items-center rounded-md border border-palette-steel/25 bg-palette-cloud/90 px-2 py-0.5 font-montserrat text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-palette-stone/90">
                                      {testimonial.plan}
                                    </span>
                                  </p>
                                </footer>
                              </div>
                            </div>
                          </div>

                          {/* Mobile: pico hacia la foto (arriba, centrado en el globo) */}
                          <div
                            className="pointer-events-none absolute left-1/2 top-0 z-20 h-0 w-0 -translate-x-1/2 md:hidden"
                            style={{
                              marginTop: '-13px',
                              borderLeft: '12px solid transparent',
                              borderRight: '12px solid transparent',
                              borderBottom: '14px solid rgba(250, 248, 244, 0.95)',
                              filter: 'drop-shadow(0 -1px 0 rgba(20,20,17,0.08))',
                            }}
                            aria-hidden
                          />
                          {/* Desktop: pico lateral hacia el retrato, centrado en altura */}
                          {photoOnRight ? (
                            <div
                              className="pointer-events-none absolute right-0 top-1/2 z-20 hidden h-0 w-0 -translate-y-1/2 md:block"
                              style={{
                                marginRight: '-14px',
                                borderTop: '15px solid transparent',
                                borderBottom: '15px solid transparent',
                                borderLeft: '16px solid rgba(250, 248, 244, 0.95)',
                                filter: 'drop-shadow(2px 0 1px rgba(20,20,17,0.07))',
                              }}
                              aria-hidden
                            />
                          ) : (
                            <div
                              className="pointer-events-none absolute left-0 top-1/2 z-20 hidden h-0 w-0 -translate-y-1/2 md:block"
                              style={{
                                marginLeft: '-14px',
                                borderTop: '15px solid transparent',
                                borderBottom: '15px solid transparent',
                                borderRight: '16px solid rgba(250, 248, 244, 0.95)',
                                filter: 'drop-shadow(-2px 0 1px rgba(20,20,17,0.07))',
                              }}
                              aria-hidden
                            />
                          )}
                        </motion.div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        ) : null}

      </div>
    </section>
  );
};

export default CourseTestimonials;

