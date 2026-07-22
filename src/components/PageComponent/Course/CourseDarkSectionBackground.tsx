'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const WATER_PATH_STEPS = 12;

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

function waterOpacityKeyframes(seed: number): number[] {
  const phase = seed * 1.414 + (seed % 4) * 0.37;
  return Array.from({ length: WATER_PATH_STEPS + 1 }, (_, i) => {
    const u = (i / WATER_PATH_STEPS) * Math.PI * 2;
    return 0.1 + 0.26 * (0.5 + 0.5 * Math.sin(u * 2.2 + phase));
  });
}

/** Menos partículas: alcanza el look sin saturar GPU en landings con varios fondos. */
const DRIFT_DOTS: {
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
  { leftPct: 8, topPct: 52, dur: 8.6, delay: 1.75 },
];

const DRIFT_PX = 24;

type Props = {
  /** Si false, solo blobs estáticos (sin partículas ni loops). */
  enableMotion?: boolean;
};

/** Fondo animado compartido (blur, conic, partículas) para secciones ink. */
export default function CourseDarkSectionBackground({ enableMotion = true }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(rootRef, { margin: '120px 0px', amount: 0.08 });
  const reduceMotion = useReducedMotion();
  const shouldAnimate = Boolean(enableMotion && inView && !reduceMotion);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-28 right-[-12%] h-[min(420px,45vw)] w-[min(420px,85vw)] rounded-full bg-palette-sage/12 blur-[100px]"
          animate={
            shouldAnimate
              ? {
                  x: [0, 28, -12, 0],
                  y: [0, -24, 16, 0],
                  scale: [1, 1.06, 0.97, 1],
                }
              : { x: 0, y: 0, scale: 1 }
          }
          transition={
            shouldAnimate
              ? { duration: 22, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0 }
          }
        />
        <motion.div
          className="absolute -bottom-36 left-[-18%] h-[400px] w-[400px] rounded-full bg-palette-granite/30 blur-[110px]"
          animate={
            shouldAnimate
              ? {
                  x: [0, -22, 18, 0],
                  y: [0, 18, -14, 0],
                  scale: [1, 1.04, 0.99, 1],
                }
              : { x: 0, y: 0, scale: 1 }
          }
          transition={
            shouldAnimate
              ? {
                  duration: 28,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1.5,
                }
              : { duration: 0 }
          }
        />
        <motion.div
          className="absolute top-[42%] right-[8%] h-[180px] w-[180px] rounded-full bg-palette-sage/10 blur-[72px] md:h-[220px] md:w-[220px]"
          animate={
            shouldAnimate
              ? { opacity: [0.35, 0.55, 0.38], scale: [1, 1.12, 1] }
              : { opacity: 0.42, scale: 1 }
          }
          transition={
            shouldAnimate
              ? {
                  duration: 16,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }
              : { duration: 0 }
          }
        />
        <motion.div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            background:
              'conic-gradient(from 220deg at 65% 35%, transparent 0deg, rgba(172,174,137,0.35) 100deg, transparent 220deg)',
          }}
          animate={shouldAnimate ? { rotate: [0, 360] } : { rotate: 0 }}
          transition={
            shouldAnimate
              ? { duration: 90, repeat: Infinity, ease: 'linear' }
              : { duration: 0 }
          }
        />
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              'repeating-linear-gradient(105deg, transparent, transparent 2px, rgba(20,20,17,0.12) 2px, rgba(20,20,17,0.12) 3px)',
          }}
        />
      </div>

      {enableMotion && !reduceMotion ? (
        <div className="pointer-events-none absolute inset-0 z-[15] overflow-hidden">
          {DRIFT_DOTS.map((d, i) => {
            const flow = waterPathKeyframes(i, DRIFT_PX);
            const depth = waterOpacityKeyframes(i);
            return (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${d.leftPct}%`, top: `${d.topPct}%` }}
              >
                <motion.div
                  className="h-3 w-3 rounded-full bg-palette-cream/20 shadow-[0_0_10px_rgba(250,248,244,0.12)] md:h-[14px] md:w-[14px]"
                  initial={false}
                  animate={
                    shouldAnimate
                      ? { x: flow.x, y: flow.y, opacity: depth }
                      : { x: 0, y: 0, opacity: 0.22 }
                  }
                  transition={{
                    duration: d.dur,
                    delay: d.delay,
                    repeat: shouldAnimate ? Infinity : 0,
                    ease: 'linear',
                  }}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
