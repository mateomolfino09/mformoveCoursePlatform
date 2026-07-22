'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { MENTORSHIP_APPLY_CTA } from '../../../constants/mentorshipCta';
import { useMentorshipApplyNavigation } from '../../../hooks/useMentorshipApplyNavigation';

const HERO_IMAGE = 'my_uploads/fondos/DSC01559_elui2h';

const scrollToPlans = () =>
  document.getElementById('mentorship-plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

type MenuItemId = 'apply' | 'empezar';

/** Tipografía tipo menú del sidebar: solo texto + marcador tipo Sims. */
const menuItemBase =
  'group relative flex min-h-[40px] md:min-h-[44px] items-center gap-2.5 md:gap-3 font-montserrat font-thin text-left leading-[1.05] tracking-[-0.02em] transition-colors duration-200 cursor-pointer touch-manipulation select-none disabled:opacity-50 text-[1.5rem] md:text-3xl lg:text-4xl';

/** Rombo/plumbob de selección (estilo cursor Sims). */
function SimsSelectMarker({ visible, onDark }: { visible: boolean; onDark?: boolean }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none inline-flex w-3 shrink-0 items-center justify-center transition-opacity duration-150 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${onDark ? 'text-palette-cream' : 'text-palette-ink'}`}
    >
      <span className="mentorship-sims-marker block h-2.5 w-2.5 rotate-45 border border-current bg-current/80 shadow-[0_0_3px_currentColor]" />
    </span>
  );
}

function MenuDivider() {
  return (
    <div className="mb-3 flex items-center gap-3 md:mb-5" aria-hidden>
      <span className="h-px w-8 bg-palette-ink/25" />
      <span className="font-montserrat text-[10px] font-medium uppercase tracking-[0.22em] text-palette-ink/35">
        Elegí
      </span>
      <span className="h-px max-w-[4.5rem] flex-1 bg-palette-ink/15" />
    </div>
  );
}

const MentorshipBannerCarousel = ({ hideText = false }: { hideText?: boolean }) => {
  const { navigate, isNavigating } = useMentorshipApplyNavigation();
  const [activeId, setActiveId] = useState<MenuItemId | null>(null);

  const clearActiveSoon = () => {
    window.setTimeout(() => setActiveId(null), 180);
  };

  const MenuCtas = () => (
    <nav className="flex flex-col items-start gap-0.5 md:gap-2.5" aria-label="Acciones de mentoría">
      <button
        type="button"
        onClick={navigate}
        disabled={isNavigating}
        onPointerEnter={() => setActiveId('apply')}
        onPointerLeave={() => setActiveId((id) => (id === 'apply' ? null : id))}
        onPointerDown={() => setActiveId('apply')}
        onPointerUp={clearActiveSoon}
        onPointerCancel={clearActiveSoon}
        className={`${menuItemBase} ${
          activeId === 'apply' ? 'text-palette-ink' : 'text-palette-ink/40 hover:text-palette-ink'
        }`}
      >
        <SimsSelectMarker visible={activeId === 'apply'} />
        <span>{isNavigating ? 'Cargando…' : MENTORSHIP_APPLY_CTA.label}</span>
      </button>
      <button
        type="button"
        onClick={scrollToPlans}
        onPointerEnter={() => setActiveId('empezar')}
        onPointerLeave={() => setActiveId((id) => (id === 'empezar' ? null : id))}
        onPointerDown={() => setActiveId('empezar')}
        onPointerUp={clearActiveSoon}
        onPointerCancel={clearActiveSoon}
        className={`${menuItemBase} ${
          activeId === 'empezar' ? 'text-palette-ink' : 'text-palette-ink/40 hover:text-palette-ink'
        }`}
      >
        <SimsSelectMarker visible={activeId === 'empezar'} />
        <span>Empezar</span>
      </button>
    </nav>
  );

  const menuBlock = (
    <>
      <MenuDivider />
      <MenuCtas />
    </>
  );

  const titleBlock = (
    <>
      <p className="mb-1.5 font-montserrat text-[10px] uppercase tracking-[0.2em] text-palette-stone/80 md:mb-3 md:text-sm">
        Mentoría
      </p>
      <motion.h1
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } } }}
        className="text-start font-montserrat text-[1.85rem] font-bold leading-[1.05] tracking-[-0.02em] text-palette-ink md:text-[3.25rem] lg:text-[3.5rem] md:leading-[1.02]"
      >
        {['Transformemos tu práctica juntos.'].map((line, i) => (
          <motion.span
            key={line}
            variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className={`block ${i === 2 ? 'mt-2.5' : 'mb-1'}`}
          >
            {line}
          </motion.span>
        ))}
      </motion.h1>
    </>
  );

  const bodyCopy = (
    <>
      <p className="text-[14px] font-light leading-snug text-palette-cream/90 md:mt-5 md:text-lg md:leading-relaxed md:text-palette-stone">
        Un acompañamiento personalizado para desarrollar fuerza, movilidad y habilidades dentro de una práctica integral
        de movimiento.
      </p>
      <p className="mt-1.5 text-xs font-light leading-snug text-palette-cream/75 md:mt-3 md:text-base md:leading-relaxed md:text-palette-stone/80">
        Guiado por <span className="font-medium text-palette-cream md:text-palette-ink">Mateo Molfino</span>.
      </p>
    </>
  );

  return (
    <section className="relative w-full overflow-hidden bg-palette-cream font-montserrat min-h-[100dvh] md:min-h-0">
      <div className="mx-auto flex min-h-[100dvh] w-[90%] max-w-6xl flex-col px-4 pt-[4.5rem] pb-6 md:block md:min-h-0 md:pt-28 md:pb-20">
        {/* Mobile: bloques repartidos en el alto (más peso a la foto). Desktop: grid. */}
        <div
          className={`flex flex-1 flex-col justify-evenly gap-4 md:grid md:flex-none md:justify-normal md:gap-12 lg:gap-14 ${
            hideText ? 'md:justify-items-center' : 'md:grid-cols-12 md:items-center'
          }`}
        >
          {/* Mobile: solo eyebrow + título. Desktop: copy completo */}
          {!hideText && (
            <motion.div
              className="w-full shrink-0 md:col-span-6 md:order-1 lg:col-span-5"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="max-w-xl py-0 md:max-w-none md:py-4">
                {titleBlock}
                <div className="hidden md:block">
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-5"
                  >
                    {bodyCopy}
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-14 hidden md:block"
                >
                  {menuBlock}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Foto: más alto relativo (flex-grow) pero con aire arriba/abajo vía justify-evenly */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: hideText ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={`relative flex w-full shrink-0 justify-center items-center md:flex-none md:justify-stretch ${
              hideText ? 'max-w-md' : 'md:col-span-6 md:order-2 lg:col-span-7'
            }`}
            style={{ flexGrow: hideText ? undefined : 1.2 }}
          >
            <div className="relative mx-auto h-[min(64vh,560px)] w-[min(82vw,640px)] overflow-hidden rounded-2xl border border-palette-stone/20 bg-palette-stone/15 shadow-[0_14px_36px_rgba(20,20,17,0.08)] ring-1 ring-palette-stone/10 md:aspect-[4/5] md:h-auto md:max-h-[min(78vh,640px)] md:w-full md:max-w-none md:rounded-3xl md:shadow-[0_22px_55px_rgba(20,20,17,0.09)]">
              <CldImage
                src={HERO_IMAGE}
                alt="Mentoría Online"
                fill
                sizes="(max-width: 768px) 240px, 55vw"
                priority
                className="object-cover object-[center_top]"
                preserveTransformations
                loader={imageLoader}
              />

              {!hideText && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-palette-ink/90 via-palette-ink/45 to-transparent px-4 pb-4 pt-14 md:hidden">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {bodyCopy}
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>

          {!hideText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="w-full shrink-0 md:hidden"
            >
              {menuBlock}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MentorshipBannerCarousel;
