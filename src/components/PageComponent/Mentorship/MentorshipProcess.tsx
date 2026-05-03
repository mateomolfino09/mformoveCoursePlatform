'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';

const steps = [
  {
    title: 'Evaluación inicial',
    description:
      'Lectura de tu estructura y patrones de movimiento para armar un enfoque a medida.',
  },
  {
    title: 'Diseño personalizado',
    description: 'Programa vivo alineado a tus objetivos y a lo que mostrás en práctica.',
  },
  {
    title: 'Seguimiento técnico',
    description: 'Revisión de tu material: técnica, compensaciones y formas más eficientes de mover.',
  },
  {
    title: 'Mentoría 1:1',
    description: 'Profundizar el plan, preguntas y criterio que llevás al día a día.',
  },
  {
    title: 'Evaluación continua',
    description: 'Revisamos mejoras en estructura, eficiencia y tolerancia cuando toca.',
  },
  {
    title: 'Formación',
    description: 'Marcos para entender cuerpo, movimiento y carga — y tu propio criterio.',
  },
];

/** Imágenes reutilizando assets del sitio: cuerpo, espacio, práctica. */
const IMG = {
  hero: 'my_uploads/fondos/DSC01488_jb7nit',
  proceso: 'my_uploads/plaza/DSC03350_vgjrrh',
  movimiento: 'DSC01884_grva4a',
} as const;

const bentoGridClass: Record<number, string> = {
  0: 'md:col-span-8 md:row-span-2 md:row-start-1 md:col-start-1 md:min-h-[280px]',
  1: 'md:col-span-4 md:row-start-1 md:col-start-9',
  2: 'md:col-span-4 md:row-start-2 md:col-start-9',
  3: 'md:col-span-6 md:row-start-3 md:col-start-1',
  4: 'md:col-span-6 md:row-start-3 md:col-start-7',
  /** Última fila al ancho completo para cerrar la grilla 12 cols. */
  5: 'md:col-span-12 md:row-start-4 md:col-start-1',
};

/** Número grande de fondo, arriba a la derecha (sin cap ni caja extra). */
function StepNumberWatermark({
  step,
  size = 'default',
}: {
  step: number;
  size?: 'hero' | 'default' | 'band';
}) {
  const num = step.toString().padStart(2, '0');
  const numberClass =
    size === 'hero'
      ? 'text-[3.25rem] sm:text-[3.75rem] md:text-[4.5rem] px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5'
      : size === 'band'
        ? 'text-[2.75rem] sm:text-[3.1rem] px-2 py-1 sm:px-3 sm:py-1.5'
        : 'text-[2.85rem] sm:text-[3.35rem] px-2 py-1 sm:px-3 sm:py-1.5';

  return (
    <span
      className={`pointer-events-none absolute right-1 top-1 z-0 inline-block select-none font-montserrat font-semibold tabular-nums leading-none text-palette-ink/[0.075] sm:right-2 sm:top-2 md:right-3 md:top-3 ${numberClass}`}
      aria-hidden
    >
      {num}
    </span>
  );
}

export default function MentorshipProcess() {
  const router = useRouter();
  const scrollToPlans = () =>
    document.getElementById('mentorship-plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <section className="border-t border-palette-stone/20 bg-palette-cream font-montserrat py-12 md:py-16">
      <div className="w-[92%] max-w-6xl mx-auto px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-36px' }}
          className="mb-9 md:mb-11 max-w-xl"
        >
          <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-palette-ink">El proceso</p>
          <h2 className="mt-3 text-[1.65rem] sm:text-[2rem] md:text-[2.35rem] font-semibold text-palette-ink tracking-tight leading-[1.1]">
            De la lectura inicial a tu criterio
          </h2>
          <p className="mt-3 text-[14px] md:text-[15px] text-palette-ink font-light leading-[1.65] opacity-90">
            Cada bloque acota un foco. El trabajo con el cuerpo ocupa centro: la teoría aparece cuando ordena tu práctica.
          </p>
        </motion.div>

        <div
          className="flex gap-3 overflow-x-auto overflow-y-visible pb-2 pt-1 snap-x snap-mandatory scrollbar-thin -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:grid md:grid-cols-12 md:gap-4 md:overflow-visible md:px-0 md:pb-0 md:snap-none md:auto-rows-min"
          style={{ scrollbarGutter: 'stable' }}
        >
          {steps.map((step, index) => {
            const isHero = index === 0;
            const hasBand = index === 4;

            return (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{
                  duration: 0.38,
                  delay: Math.min(index * 0.03, 0.12),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`group/card relative shrink-0 snap-center overflow-hidden rounded-2xl border border-palette-stone/22 bg-gradient-to-br from-white/72 to-palette-cream/90 shadow-[0_6px_22px_rgba(20,20,17,0.05)] min-w-[min(100vw-1.75rem,300px)] w-[min(100vw-1.75rem,300px)] md:w-auto md:min-w-0 ${bentoGridClass[index] ?? ''} ${isHero ? 'p-0 md:flex md:flex-row' : hasBand ? 'flex flex-col p-0' : 'p-4 sm:p-5'}`}
              >
                {isHero ? (
                  <>
                    <div className="relative aspect-[16/11] sm:aspect-[5/4] md:aspect-auto md:w-[44%] md:min-h-[260px] md:max-w-none overflow-hidden shrink-0">
                      <CldImage
                        src={IMG.hero}
                        alt="Práctica y movimiento"
                        fill
                        sizes="(max-width: 768px) 90vw, 36vw"
                        className="object-cover object-[center_22%] transition-transform duration-[1.15s] ease-out group-hover/card:scale-[1.035]"
                        loader={imageLoader}
                        preserveTransformations
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-palette-ink/35 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-palette-cream/15" />
                    </div>
                    <div className="relative flex min-w-0 flex-1 flex-col p-4 pr-[4.75rem] sm:p-5 sm:pr-[5.25rem] md:p-6 md:pr-24 md:justify-center">
                      <StepNumberWatermark step={index + 1} size="hero" />
                      <h3 className="relative z-[1] mt-0 font-semibold text-palette-ink text-[17px] md:text-lg tracking-tight leading-snug">
                        {step.title}
                      </h3>
                      <p className="relative z-[1] mt-2 text-[13px] md:text-[14px] text-palette-ink leading-[1.6] font-light opacity-90">
                        {step.description}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`relative z-[1] flex flex-1 flex-col ${hasBand ? 'min-h-0' : 'pr-[3.25rem] sm:pr-16 md:pr-[7rem]'}`}>
                      {!hasBand && (
                        <>
                          <StepNumberWatermark step={index + 1} size="default" />
                          <h3 className="relative z-[1] font-semibold text-palette-ink text-[15px] md:text-[16px] tracking-tight leading-snug">
                            {step.title}
                          </h3>
                          <p className="relative z-[1] mt-2 text-[12px] md:text-[13px] text-palette-ink leading-[1.58] font-light opacity-90">
                            {step.description}
                          </p>
                        </>
                      )}
                      {hasBand && (
                        <>
                          <div className="relative h-[100px] sm:h-[112px] w-full shrink-0 overflow-hidden">
                            <CldImage
                              src={IMG.proceso}
                              alt=""
                              fill
                              sizes="(max-width: 768px) 100vw, 45vw"
                              className="object-cover object-[center_40%] transition-transform duration-[1.05s] ease-out group-hover/card:scale-[1.03]"
                              loader={imageLoader}
                              preserveTransformations
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-palette-cream/90 via-palette-cream/20 to-transparent" />
                          </div>
                          <div className="relative flex flex-col px-4 pb-4 pt-4 pr-[3.5rem] sm:px-5 sm:pb-5 sm:pr-16 sm:pt-5 md:pr-[7rem]">
                            <StepNumberWatermark step={index + 1} size="band" />
                            <h3 className="relative z-[1] font-semibold text-palette-ink text-[15px] md:text-[16px] tracking-tight leading-snug">
                              {step.title}
                            </h3>
                            <p className="relative z-[1] mt-2 text-[12px] md:text-[13px] text-palette-ink leading-[1.58] font-light opacity-90">
                              {step.description}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mt-10 md:mt-12 border-t border-palette-stone/22 pt-9 md:pt-11"
        >
          <div className="flex flex-col sm:flex-row sm:items-stretch gap-6">
            <div className="relative h-36 sm:h-auto sm:w-36 md:w-44 shrink-0 overflow-hidden rounded-xl">
              <CldImage
                src={IMG.movimiento}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 176px"
                className="object-cover object-[center_65%] transition-transform duration-[1.1s] ease-out hover:scale-[1.04]"
                loader={imageLoader}
                preserveTransformations
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-palette-ink opacity-80">Siguiente paso</p>
                <h3 className="mt-1.5 text-xl md:text-2xl font-semibold text-palette-ink tracking-tight leading-tight">
                  ¿Te cierra este recorrido?
                </h3>
                <p className="mt-2 max-w-md text-[13px] md:text-[14px] text-palette-ink font-light leading-relaxed opacity-90">
                  Completá la solicitud con tu contexto; después alineamos si encaja y cómo seguir. Si preferís mirar números antes,{' '}
                  <button
                    type="button"
                    onClick={scrollToPlans}
                    className="font-medium underline decoration-palette-ink/30 underline-offset-[3px] hover:decoration-palette-ink/55"
                  >
                    revisá los planes
                  </button>
                  .
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/mentorship/consulta')}
                className="group inline-flex shrink-0 items-center justify-center gap-2.5 self-start rounded-full border-2 border-palette-ink bg-palette-ink px-6 py-2.5 font-montserrat text-[10px] font-semibold uppercase tracking-[0.2em] text-palette-cream transition-all duration-200 hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink md:self-center"
              >
                Aplicar a mentoría
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
