'use client';

import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { useCursoLanding } from './CursoLandingContext';
import CourseDarkSectionBackground from './CourseDarkSectionBackground';
import {
  landingCardBodyDark,
  landingEyebrowDark,
  landingSectionBodyDark,
  landingSectionContainer,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';

export type CourseTestimonialsVariant = 'community' | 'clientVideos' | 'written';

type CourseTestimonialsProps = {
  variant?: CourseTestimonialsVariant;
  showCta?: boolean;
};

const testimonialCardShell =
  'relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)] md:rounded-3xl md:p-7';

const CourseTestimonials = ({
  variant = 'community',
  showCta = true,
}: CourseTestimonialsProps) => {
  const { cursoConfig, scrollToPlans } = useCursoLanding();
  const { presentacionTestimonios } = cursoConfig;
  const testimonials = cursoConfig.testimoniosEscritos.map((item) => ({
    name: item.nombre,
    plan: item.planEtiqueta,
    photo: item.imagenUrl,
    text: item.texto,
  }));
  const videoTestimonials = cursoConfig.testimoniosGrabados.filter((item) =>
    Boolean(item.videoVimeoId?.trim()),
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
      eyebrow: presentacionTestimonios.eyebrowEscritos || 'Testimonios',
      title: presentacionTestimonios.tituloEscritos,
      subtitle: null,
    },
  };

  const { eyebrow, title, subtitle } = variantHeadings[variant];
  const showHeader = Boolean(eyebrow || title || subtitle);
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
      className="relative isolate overflow-hidden border-t border-white/10 bg-palette-ink py-12 font-montserrat text-palette-cream md:py-16"
    >
      <CourseDarkSectionBackground />

      <div className={`relative z-20 ${landingSectionContainer}`}>
        {showHeader ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-36px' }}
            className={`mx-auto mb-8 max-w-3xl md:mb-10 ${variant === 'written' ? 'text-left' : 'text-center'}`}
          >
            {eyebrow ? <p className={`${landingEyebrowDark} mb-3`}>{eyebrow}</p> : null}
            {title ? <h2 className={`${landingSectionTitleDark} mb-4`}>{title}</h2> : null}
            {subtitle ? (
              <p className={`${landingSectionBodyDark} mx-auto max-w-2xl`}>{subtitle}</p>
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
                className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_8px_32px_rgba(0,0,0,0.35)] ring-1 ring-white/10 md:rounded-3xl"
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
          <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {testimonials.map((testimonial, index) => (
              <motion.article
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: index * 0.06 }}
                viewport={{ once: true }}
                className={testimonialCardShell}
              >
                <p className={`${landingCardBodyDark} flex-1 text-center`}>
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                <div className="mt-6 border-t border-white/[0.08] pt-5">
                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15">
                      <CldImage
                        src={testimonial.photo}
                        alt={testimonial.name}
                        fill
                        className="object-cover grayscale-[15%]"
                        loader={imageLoader}
                        sizes="48px"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="font-montserrat text-[15px] font-semibold text-palette-cream md:text-base">
                        {testimonial.name}
                      </p>
                      <p className="mt-0.5 text-[13px] font-normal text-palette-cream/55 md:text-sm">
                        {testimonial.plan}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : null}

        {showWrittenDialogs ? (
          <div className="relative mx-auto mb-10 flex w-full max-w-5xl flex-col gap-12 md:mb-14 md:gap-16">
            {testimonials.map((testimonial, index) => {
              const photoOnRight = index % 2 === 0;

              return (
                <motion.article
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true, margin: '-48px' }}
                  className={`flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-10 lg:gap-12 ${
                    photoOnRight ? '' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div
                      className="absolute -inset-1 rounded-full bg-gradient-to-br from-palette-sage/20 to-transparent blur-sm"
                      aria-hidden
                    />
                    <div className="relative h-[min(13rem,72vw)] w-[min(13rem,72vw)] overflow-hidden rounded-full ring-2 ring-white/15 ring-offset-2 ring-offset-palette-ink sm:h-56 sm:w-56 md:h-60 md:w-60">
                      <CldImage
                        src={testimonial.photo}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                        loader={imageLoader}
                        sizes="(max-width: 640px) 72vw, 15rem"
                      />
                    </div>
                  </div>

                  <div className={`${testimonialCardShell} min-w-0 flex-1`}>
                    <blockquote className={landingCardBodyDark}>
                      &ldquo;{testimonial.text}&rdquo;
                    </blockquote>
                    <footer className="mt-6 border-t border-white/[0.08] pt-5 not-italic">
                      <p className="font-montserrat text-[15px] font-semibold text-palette-cream md:text-base">
                        {testimonial.name}
                      </p>
                      <p className="mt-1.5">
                        <span className="inline-flex rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-0.5 font-montserrat text-[11px] font-medium uppercase tracking-[0.14em] text-palette-cream/60">
                          {testimonial.plan}
                        </span>
                      </p>
                    </footer>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : null}

        {showCta && variant === 'community' ? (
          <div className="text-center">
            <button
              type="button"
              onClick={scrollToPlans}
              className="font-montserrat text-sm font-medium text-palette-cream underline decoration-palette-cream/30 underline-offset-[3px] transition-colors hover:decoration-palette-sage"
            >
              Ver planes
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default CourseTestimonials;
