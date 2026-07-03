'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useCursoLanding } from './CursoLandingContext';
import { sectionMainTitle } from './courseSectionTitle';

const WATER_PATH_STEPS = 20;

/** Curva cerrada tipo corriente: varias ondas + fase distinta por índice → trayectorias orgánicas. */
function waterPathKeyframes(
  seed: number,
  amplitudePx: number
): { x: number[]; y: number[] } {
  const phase = seed * 2.618033988749895 + (seed % 7) * 0.513;
  const amp = amplitudePx * (0.58 + (seed % 9) * 0.05);
  const vertStretch = 0.68 + (seed % 5) * 0.06;

  const xs: number[] = [];
  const ys: number[] = [];

  for (let i = 0; i <= WATER_PATH_STEPS; i++) {
    const t = (i / WATER_PATH_STEPS) * Math.PI * 2;
    const ripple = Math.sin(t * 3.1 + phase * 1.05) * amp * 0.28;
    const surge = Math.cos(t * 1.65 - phase * 0.42) * amp * 0.22;
    const curl = Math.sin(t * 5.2 + phase * 0.68) * amp * 0.12;

    xs.push(
      Math.cos(t * 0.92 + phase * 0.22) *
        amp *
        (0.86 + 0.14 * Math.sin(t * 2.05 + phase)) +
        ripple +
        curl * 0.55
    );
    ys.push(
      Math.sin(t * 1.06 + phase * 0.52) * amp * vertStretch +
        Math.cos(t * 2.35 + phase * 0.88) * amp * 0.26 +
        surge +
        Math.sin(t * 4.15 + phase * 0.33) * amp * 0.09
    );
  }

  return { x: xs, y: ys };
}

/** Pulso suave de “profundidad” al ritmo del recorrido (brillo de superficie). */
function waterOpacityKeyframes(seed: number): number[] {
  const phase = seed * 1.414 + (seed % 4) * 0.37;
  return Array.from({ length: WATER_PATH_STEPS + 1 }, (_, i) => {
    const u = (i / WATER_PATH_STEPS) * Math.PI * 2;
    return 0.1 + 0.26 * (0.5 + 0.5 * Math.sin(u * 2.2 + phase));
  });
}

const BETWEEN_HERO_DOTS: {
  leftPct: number;
  topPct: number;
  dur: number;
  delay: number;
}[] = [
  { leftPct: 12, topPct: 26, dur: 9, delay: 0 },
  { leftPct: 79, topPct: 19, dur: 10.5, delay: 0.6 },
  { leftPct: 51, topPct: 64, dur: 11, delay: 0.35 },
  { leftPct: 87, topPct: 72, dur: 8, delay: 1.1 },
  { leftPct: 23, topPct: 76, dur: 9.5, delay: 0.15 },
  { leftPct: 66, topPct: 40, dur: 10, delay: 1.45 },
  { leftPct: 42, topPct: 18, dur: 9.2, delay: 0.85 },
  { leftPct: 93, topPct: 44, dur: 10.2, delay: 2.1 },
  { leftPct: 8, topPct: 52, dur: 8.6, delay: 1.75 },
  { leftPct: 55, topPct: 88, dur: 11.3, delay: 0.5 },
  { leftPct: 34, topPct: 48, dur: 9.8, delay: 2.65 },
  { leftPct: 72, topPct: 58, dur: 8.4, delay: 1.3 },
  { leftPct: 18, topPct: 14, dur: 10.8, delay: 3.2 },
  { leftPct: 48, topPct: 34, dur: 9.6, delay: 0.95 },
  { leftPct: 61, topPct: 12, dur: 8.9, delay: 2.4 },
  { leftPct: 5, topPct: 88, dur: 11.6, delay: 1.95 },
  { leftPct: 95, topPct: 28, dur: 10.1, delay: 0.22 },
  { leftPct: 38, topPct: 92, dur: 9.4, delay: 2.85 }
];

/** Radio típico del remolino en px (la forma ya deforma el camino). */
const DRIFT_PX = 24;

export default function CourseBetweenHeroSection() {
  const reduceMotion = useReducedMotion();
  const { cursoConfig } = useCursoLanding();
  const { betweenHero } = cursoConfig;

  return (
    <section className="mc-curso-dark-section py-14 md:py-16 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <motion.div
          className="absolute -top-28 right-[-12%] h-[min(420px,45vw)] w-[min(420px,85vw)] rounded-full bg-palette-sage/12 blur-[100px]"
          animate={{
            x: [0, 28, -12, 0],
            y: [0, -24, 16, 0],
            scale: [1, 1.06, 0.97, 1]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-36 left-[-18%] h-[400px] w-[400px] rounded-full bg-palette-granite/30 blur-[110px]"
          animate={{
            x: [0, -22, 18, 0],
            y: [0, 18, -14, 0],
            scale: [1, 1.04, 0.99, 1]
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5
          }}
        />
        <motion.div
          className="absolute top-[42%] right-[8%] h-[180px] w-[180px] rounded-full bg-palette-sage/10 blur-[72px] md:h-[220px] md:w-[220px]"
          animate={{ opacity: [0.35, 0.55, 0.38], scale: [1, 1.12, 1] }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5
          }}
        />
        <motion.div
          className='absolute inset-0 opacity-[0.14]'
          style={{
            background:
              'conic-gradient(from 220deg at 65% 35%, transparent 0deg, rgba(172,174,137,0.35) 100deg, transparent 220deg)'
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        />
        <div
          className='absolute inset-0 opacity-[0.04] mix-blend-overlay'
          style={{
            backgroundImage:
              'repeating-linear-gradient(105deg, transparent, transparent 2px, rgba(20,20,17,0.12) 2px, rgba(20,20,17,0.12) 3px)'
          }}
        />
      </div>

      <div
        className='pointer-events-none absolute inset-0 z-[15] overflow-hidden'
        aria-hidden
      >
        {BETWEEN_HERO_DOTS.map((d, i) => {
          const flow = waterPathKeyframes(i, DRIFT_PX);
          const depth = waterOpacityKeyframes(i);
          return (
            <div
              key={i}
              className='absolute -translate-x-1/2 -translate-y-1/2'
              style={{ left: `${d.leftPct}%`, top: `${d.topPct}%` }}
            >
              <motion.div
                className="h-3 w-3 rounded-full bg-palette-cream/20 shadow-[0_0_10px_rgba(250,248,244,0.12)] md:h-[14px] md:w-[14px]"
                initial={false}
                animate={
                  reduceMotion
                    ? { x: 0, y: 0, opacity: 0.28 }
                    : {
                        x: flow.x,
                        y: flow.y,
                        opacity: depth
                      }
                }
                transition={{
                  duration: d.dur,
                  delay: d.delay,
                  repeat: reduceMotion ? 0 : Infinity,
                  ease: 'linear'
                }}
              />
            </div>
          );
        })}
      </div>

      <div className='relative z-20 mx-auto w-full max-w-none px-5 text-center sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-28'>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-80px' }}
          className='mx-auto max-w-none lg:max-w-[min(52rem,calc(100vw-10rem))]'
        >
          <p className="mb-3 font-montserrat text-[11px] uppercase tracking-[0.28em] text-palette-cream/75 md:text-xs">
            {betweenHero.eyebrow}
          </p>
          <h2 className={`mc-text-ink-shadow-title ${sectionMainTitle} text-palette-cream`}>
            {betweenHero.titulo}
          </h2>
        </motion.div>

        <motion.div className="mt-11 mx-auto max-w-4xl space-y-8 text-center font-raleway font-semibold text-palette-cream/90 md:mt-16 md:space-y-10 lg:mt-20">
          {betweenHero.parrafos.map((paragraph, index) => (
            <motion.p
              key={`between-hero-${index}`}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true, margin: '-80px' }}
              className="text-lg leading-[1.4] tracking-tight md:text-xl md:leading-[1.37] lg:text-[clamp(1.3125rem,2.2vw,1.75rem)] lg:leading-[1.36] xl:text-[clamp(1.4rem,1.95vw,1.8125rem)]"
            >
              {paragraph}
            </motion.p>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
