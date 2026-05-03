'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';

const IMG_AFTER_STEP_1 = 'my_uploads/fondos/DSC01642_rioxq5';

const PRACTICE_FOCUS = ['Movilidad y Fuerza', 'Parada de manos', 'Flows de movimiento', 'Acondicionamiento físico'] as const;

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-palette-stone/20 bg-white px-2.5 py-1 font-montserrat text-[11px] font-medium text-palette-ink md:text-[12px]">
      {children}
    </span>
  );
}

/** Raíz del árbol + tronco visual; sin numeración de pasos. */
function MethodTreeRoot({ title, id }: { title: string; id?: string }) {
  return (
    <div className="pb-5">
      <h3 id={id} className="text-[1.2rem] font-semibold leading-snug tracking-tight text-palette-ink md:text-[1.35rem]">
        {title}
      </h3>
      <div className="mt-3 h-px w-full bg-palette-stone/18" />
    </div>
  );
}

function TreeStemAxisLine({ className }: { className: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute w-[1px] bg-black -translate-x-1/2  left-1/2 ${className}`} />
  );
}

function TreeStemMarker({ align }: { align: 'body' | 'title' }) {
  const nodeTop = align === 'title' ? 'top-[0.42rem] md:top-[0.48rem]' : 'top-[1.05rem]';
  const barTop =
    align === 'title'
      ? 'top-[calc(0.42rem+5px)] md:top-[calc(0.48rem+5px)]'
      : 'top-[calc(1.05rem+5px)]';
  return (
    <>
      <span
        aria-hidden
        className={`pointer-events-none absolute left-1/2 z-[1] size-[11px] -translate-x-1/2 rounded-full border-2 border-palette-ink bg-palette-cream ring-[3px] ring-palette-cream ${nodeTop}`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute left-[calc(50%+6px)] z-0 h-0.5 w-5 bg-palette-stone/34 sm:w-6 md:w-[1.625rem] ${barTop}`}
      />
    </>
  );
}

function StepImage({ src, alt, objectClassName }: { src: string; alt: string; objectClassName: string }) {
  return (
    <div className="relative mt-8 aspect-[16/10] w-full max-w-2xl overflow-hidden rounded-xl border border-palette-stone/18 bg-palette-stone/5 shadow-[0_8px_28px_rgba(20,20,17,0.06)] md:mt-9">
      <CldImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 92vw, 42rem"
        className={`object-cover transition-transform duration-700 ease-out hover:scale-[1.02] ${objectClassName}`}
        loader={imageLoader}
        preserveTransformations
      />
    </div>
  );
}

export default function MentorshipIsForYou() {
  return (
    <section className="relative bg-palette-cream py-14 font-montserrat text-left md:py-16">
      <div className="mx-auto w-[92%] max-w-6xl px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-36px' }}
          className="mb-11 max-w-2xl md:mb-12"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-palette-ink">Para quién es</p>
          <h2 className="mt-3 text-[1.85rem] font-semibold leading-[1.1] tracking-tight text-palette-ink md:text-[2.25rem] md:leading-[1.08] lg:text-[2.5rem]">
            ¿Es para vos esta mentoría?
          </h2>

        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-20px' }}
          className="mx-auto min-w-0 max-w-3xl md:max-w-none"
          aria-labelledby="mentorship-method-roots-heading"
        >
          <MethodTreeRoot id="mentorship-method-roots-heading" title="Raíces del método" />
          {/* gap-12/14 = mismo offset que prolonga la línea; eje siempre centrado en w-[26px] (sin depender del pl responsive). */}
          <div className="mt-4 flex flex-col gap-12 md:mt-5 md:gap-14">
            <div className="flex items-stretch gap-8 sm:gap-10 md:gap-11 lg:gap-12">
              <div className="relative w-[26px] shrink-0 overflow-visible">
                <TreeStemAxisLine className="top-[calc(1.05rem+5.5px)] bottom-[-3rem] rounded-full md:bottom-[-3.5rem]" />
                <TreeStemMarker align="body" />
              </div>
              <div className="min-w-0 flex-1 pb-12 md:pb-14">
                <p className="text-[15px] font-normal leading-[1.72] text-palette-ink md:text-[16px]">
                  Movilidad, parada de manos, flows de movimiento y fuerza dentro de{' '}
                  <span className="font-semibold">un mapa</span>. La mezcla trae información de artes marciales, yoga,
                  gimnasia, danza, fuerza y deporte — integrado.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {PRACTICE_FOCUS.map((tag) => (
                    <Pill key={tag}>{tag}</Pill>
                  ))}
                </div>
                <StepImage src={IMG_AFTER_STEP_1} alt="Práctica de movimiento y cuerpo" objectClassName="object-[center_60%]" />
              </div>
            </div>

            <div className="flex items-stretch gap-8 sm:gap-10 md:gap-11 lg:gap-12">
              <div className="relative w-[26px] shrink-0 overflow-visible">
                <TreeStemAxisLine className="top-[-3rem] bottom-0 rounded-full md:top-[-3.5rem]" />
                <TreeStemMarker align="title" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-palette-ink text-[1.2rem] leading-snug tracking-tight md:text-[1.35rem]">
                  El movimiento no es solo físico
                </h4>
                <p className="mt-5 text-[15px] font-normal leading-[1.72] text-palette-ink md:text-[16px]">
                  El foco está no solo en moverte mejor, sino en{' '}
                  <span className="font-semibold">como se interpreta la práctica, como sana el cuerpo a partir de la misma y cómo se relaciona con la vida</span>. Aprender a desarrollar una mirada crítica y consciente de tu propio movimiento. Entendiendo que las capacidades son solo expresiones de un todo más grande. <span className="font-semibold">Danza, entrenamiento y lucha coexisten en un mismo cuerpo</span>.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </section>
  );
}
