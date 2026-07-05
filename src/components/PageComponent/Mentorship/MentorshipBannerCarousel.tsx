'use client'
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { useRouter } from 'next/navigation';
import { MENTORSHIP_APPLY_CTA } from '../../../constants/mentorshipCta';

const HERO_IMAGE = 'my_uploads/fondos/DSC01559_elui2h';

const ctaButtonClass =
  'group inline-flex items-center justify-center gap-4 font-montserrat font-semibold text-[0.775rem] md:text-[0.9rem] uppercase tracking-[0.2em] rounded-full px-7 py-3 bg-palette-ink text-palette-cream border-2 border-palette-ink hover:bg-palette-sage hover:border-palette-sage hover:text-palette-ink transition-all duration-200';

const MentorshipBannerCarousel = ({ hideText = false }: { hideText?: boolean }) => {
  const router = useRouter();

  const ConsultaButton = ({ className = '' }: { className?: string }) => (
    <motion.button
      type="button"
      onClick={() => router.push(MENTORSHIP_APPLY_CTA.href)}
      className={`${ctaButtonClass} ${className}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <span>{MENTORSHIP_APPLY_CTA.label}</span>
      <span className="text-palette-cream/80 transition-transform duration-200 group-hover:translate-x-0.5 shrink-0">
        →
      </span>
    </motion.button>
  );

  return (
    <section className="relative w-full bg-palette-cream font-montserrat overflow-hidden">
      <div className="w-[90%] max-w-6xl mx-auto px-4 pt-24 pb-14 md:pt-28 md:pb-20">
        <div
          className={`grid grid-cols-1 items-center gap-10 md:gap-12 lg:gap-14 ${
            hideText ? 'justify-items-center' : 'md:grid-cols-12'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: hideText ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full ${hideText ? 'max-w-md' : 'order-2 md:order-2 md:col-span-6 lg:col-span-7'}`}
          >
            <div className="relative mx-auto aspect-[4/5] max-h-[min(78vh,640px)] w-full max-w-lg md:max-w-none rounded-3xl overflow-hidden border border-palette-stone/20 bg-palette-stone/10 shadow-[0_22px_55px_rgba(20,20,17,0.09)] ring-1 ring-palette-stone/10">
              <CldImage
                src={HERO_IMAGE}
                alt="Mentoría Online"
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                priority
                className="object-cover object-[center_top]"
                preserveTransformations
                loader={imageLoader}
              />
              {/* CTA solo móvil: dentro de la foto */}
              {!hideText && (
                <div className="md:hidden pointer-events-none absolute inset-x-0 bottom-0 pt-28 pb-5 px-4 bg-gradient-to-t from-palette-ink/92 via-palette-ink/45 to-transparent">
                  <div className="pointer-events-auto flex justify-stretch">
                    <ConsultaButton className="w-full min-h-[48px]" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {!hideText && (
            <motion.div
              className="order-1 md:order-1 md:col-span-6 lg:col-span-5"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="max-w-xl md:max-w-none py-2 md:py-4">
                <p className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-stone/80 mb-3">
                  Mentoría
                </p>
                <motion.h1
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } } }}
                  className="text-[2.5rem] md:text-[3.25rem] lg:text-[3.5rem] font-montserrat font-bold text-palette-ink tracking-[-0.02em] leading-[1.02] text-start"
                >
                  {['Transformemos tu práctica juntos.'].map(
                    (line, i) => (
                      <motion.span
                        key={line}
                        variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                        className={`block ${i === 2 ? 'mt-2.5' : 'mb-1'}`}
                      >
                        {line}
                      </motion.span>
                    )
                  )}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-5 text-base md:text-lg text-palette-stone leading-relaxed font-light"
                >
                  Un acompañamiento personalizado para desarrollar fuerza, movilidad y habilidades dentro de una práctica integral de movimiento.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-3 text-sm md:text-base text-palette-stone/80 leading-relaxed font-light"
                >
                  Guiado por <span className="font-medium text-palette-ink">Mateo Molfino</span>.
                </motion.p>

  

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-8 hidden md:flex flex-wrap items-center gap-4"
                >
                  <ConsultaButton className="inline-flex justify-between min-w-[min(100%,280px)]" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MentorshipBannerCarousel;
