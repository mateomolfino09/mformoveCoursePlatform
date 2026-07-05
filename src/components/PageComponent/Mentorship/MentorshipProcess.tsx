'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { MENTORSHIP_APPLY_CTA } from '../../../constants/mentorshipCta';

const steps = [
  {
    title: 'Evaluación inicial',
    description:
      'Analizamos tu contexto, tus objetivos y tu práctica para construir un enfoque personalizado.',
  },
  {
    title: 'Diseño del programa',
    description:
      'Desarrollamos un plan vivo que evoluciona junto a tu práctica y a las necesidades de cada etapa.',
  },
  {
    title: 'Seguimiento y ajustes',
    description:
      'Revisamos técnica, eficiencia y progresiones para mantener el proceso alineado y sostenible en el tiempo.',
  },
  {
    title: 'Mentoría y formación',
    description:
      'Las llamadas individuales sirven para profundizar conceptos, responder preguntas y comprender mejor el cuerpo, el movimiento y el entrenamiento.',
  },
  {
    title: 'Una práctica propia',
    description:
      'El objetivo no es solo avanzar en habilidades específicas, sino construir una práctica sostenible, consciente y alineada con tus intereses y objetivos a largo plazo.',
  },
] as const;

const IMG = {
  hero: 'my_uploads/fondos/DSC01488_jb7nit',
  proceso: 'my_uploads/plaza/DSC03350_vgjrrh',
} as const;

/** Grilla bento 12 cols — 5 pasos: hero + 2 apilados + 2 en fila inferior. */
const bentoGridClass: Record<number, string> = {
  0: 'md:col-span-8 md:row-span-2 md:row-start-1 md:col-start-1 md:min-h-[280px]',
  1: 'md:col-span-4 md:row-start-1 md:col-start-9',
  2: 'md:col-span-4 md:row-start-2 md:col-start-9',
  3: 'md:col-span-6 md:row-start-3 md:col-start-1',
  4: 'md:col-span-6 md:row-start-3 md:col-start-7',
};

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
    <section className="border-t border-palette-stone/20 bg-palette-cream font-montserrat py-16 md:py-24">
      <div className="mx-auto w-[92%] max-w-6xl px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-36px' }}
          className="mb-9 max-w-3xl md:mb-11"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-palette-ink">El proceso</p>
          <h2 className="mt-3 text-[1.85rem] font-bold leading-[1.1] tracking-tight text-palette-ink md:text-[2.25rem] md:leading-[1.08] lg:text-[2.5rem]">
            De la evaluación inicial a construir una práctica propia
          </h2>
          <p className="mt-5 text-[15px] font-normal leading-[1.72] text-palette-ink md:text-[16px]">
            La mentoría busca algo más que cumplir un programa. El objetivo es desarrollar una práctica que tenga sentido
            para vos, entendiendo el qué, el cómo y el por qué de cada decisión.
          </p>
          <p className="mt-9 border-l-2 border-palette-ink/80 pl-5 text-[1.15rem] font-semibold leading-snug tracking-tight text-palette-ink md:pl-6 md:text-[1.45rem]">
            La teoría aparece cuando ayuda a ordenar la práctica; el cuerpo sigue ocupando el centro del proceso.
          </p>
        </motion.div>

        <div
          className="-mx-3 flex gap-3 overflow-x-auto overflow-y-visible px-3 pb-2 pt-1 snap-x snap-mandatory scrollbar-thin sm:-mx-4 sm:px-4 md:mx-0 md:grid md:grid-cols-12 md:gap-4 md:overflow-visible md:px-0 md:pb-0 md:snap-none md:auto-rows-min"
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
                    <div className="relative aspect-[16/11] shrink-0 overflow-hidden sm:aspect-[5/4] md:aspect-auto md:w-[44%] md:min-h-[260px]">
                      <CldImage
                        src={IMG.hero}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 90vw, 36vw"
                        className="object-cover object-[center_22%] transition-transform duration-[1.15s] ease-out group-hover/card:scale-[1.035]"
                        loader={imageLoader}
                        preserveTransformations
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-palette-ink/35 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-palette-cream/15" />
                    </div>
                    <div className="relative flex min-w-0 flex-1 flex-col p-4 pr-[4.75rem] sm:p-5 sm:pr-[5.25rem] md:justify-center md:p-6 md:pr-24">
                      <StepNumberWatermark step={index + 1} size="hero" />
                      <h3 className="relative z-[1] font-semibold text-palette-ink text-[17px] leading-snug tracking-tight md:text-lg">
                        {step.title}
                      </h3>
                      <p className="relative z-[1] mt-2 text-[13px] font-light leading-[1.6] text-palette-ink opacity-90 md:text-[14px]">
                        {step.description}
                      </p>
                    </div>
                  </>
                ) : hasBand ? (
                  <>
                    <div className="relative h-[100px] w-full shrink-0 overflow-hidden sm:h-[112px]">
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
                      <h3 className="relative z-[1] font-semibold text-palette-ink text-[15px] leading-snug tracking-tight md:text-[16px]">
                        {step.title}
                      </h3>
                      <p className="relative z-[1] mt-2 text-[12px] font-light leading-[1.58] text-palette-ink opacity-90 md:text-[13px]">
                        {step.description}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="relative z-[1] flex min-h-0 flex-1 flex-col pr-[3.25rem] sm:pr-16 md:pr-[7rem]">
                    <StepNumberWatermark step={index + 1} size="default" />
                    <h3 className="relative z-[1] font-semibold text-palette-ink text-[15px] leading-snug tracking-tight md:text-[16px]">
                      {step.title}
                    </h3>
                    <p className="relative z-[1] mt-2 text-[12px] font-light leading-[1.58] text-palette-ink opacity-90 md:text-[13px]">
                      {step.description}
                    </p>
                  </div>
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
          className="mt-16 border-t border-palette-stone/20 pt-10 md:mt-20 md:pt-12"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-palette-ink/70">Siguiente paso</p>
              <h3 className="mt-3 text-[1.4rem] font-semibold leading-tight tracking-tight text-palette-ink md:text-[1.75rem]">
                ¿Sentís que esto es para vos?
              </h3>
              <p className="mt-3 text-[15px] font-light leading-[1.65] text-palette-ink/85 md:text-[16px]">
                Contame tu contexto, tus objetivos y en qué etapa de la práctica estás. Después evaluamos juntos si la
                mentoría es el camino indicado para vos y cómo podemos avanzar.
              </p>
              <p className="mt-2 text-[13px] font-light leading-[1.6] text-palette-ink/60 md:text-[14px]">
                También podés{' '}
                <button
                  type="button"
                  onClick={scrollToPlans}
                  className="font-medium underline decoration-palette-ink/25 underline-offset-[3px] hover:decoration-palette-ink/50"
                >
                  revisar los planes y modalidades
                </button>{' '}
                antes de aplicar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(MENTORSHIP_APPLY_CTA.href)}
              className="group inline-flex shrink-0 items-center justify-center gap-2.5 self-start rounded-full border-2 border-palette-ink bg-palette-ink px-6 py-2.5 font-montserrat text-[10px] font-semibold uppercase tracking-[0.2em] text-palette-cream transition-all duration-200 hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink md:self-end"
            >
              {MENTORSHIP_APPLY_CTA.label}
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
