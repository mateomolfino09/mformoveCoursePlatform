'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import {
  landingEyebrow,
  landingEyebrowDark,
  landingSectionBody,
  landingSectionBodyDark,
  landingSectionTitle,
  landingSectionTitleDark,
} from '../../../constants/landingSectionDesign';
import CourseDarkSectionBackground from '../Course/CourseDarkSectionBackground';

const ROOTS_IMAGE = 'my_uploads/fondos/DSC01642_rioxq5';

const PRACTICE_FOCUS = [
  'Movilidad y fuerza',
  'Parada de manos',
  'Flows de movimiento',
  'Acondicionamiento físico',
] as const;

const IS_FOR_YOU = [
  'Buscás una práctica integral y no solo aprender habilidades aisladas.',
  'Querés entender el cuerpo más allá de ejercicios y rutinas.',
  'Te interesa desarrollar movilidad, fuerza y movimiento de forma conectada.',
  'Disfrutás explorar, cuestionar y construir una práctica propia.',
  'Entendés el movimiento como una herramienta para explorar, aprender y transformarte.',
] as const;

const METHOD_PILLARS = [
  {
    title: 'Prácticas internas',
    description: 'Respiración, atención y regulación.',
  },
  {
    title: 'Capacidades integrales',
    description: 'Fuerza, movilidad y resistencia desarrolladas a través del movimiento natural.',
  },
  {
    title: 'Movilidad específica',
    description: 'Construir rangos concretos cuando la práctica lo requiere.',
  },
  {
    title: 'Fuerza específica',
    description: 'Desarrollar capacidades físicas de manera progresiva y deliberada.',
  },
  {
    title: 'Habilidades coordinativas',
    description: 'Aprender, jugar, adaptarse y resolver problemas a través del movimiento.',
  },
] as const;

function ListMarker() {
  return (
    <span
      aria-hidden
      className="flex h-[1.68em] w-1.5 shrink-0 items-center justify-center text-[16px] md:text-[18px] lg:text-[19px]"
    >
      <span className="size-1.5 rounded-full bg-palette-sage" />
    </span>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-palette-stone/20 bg-white px-2.5 py-1 font-montserrat text-[11px] font-medium text-palette-ink md:text-[12px]">
      {children}
    </span>
  );
}

function PullQuote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-9 border-l-2 border-palette-ink/80 pl-5 text-[1.2rem] font-semibold leading-snug tracking-tight text-palette-ink md:mt-11 md:pl-6 md:text-[1.55rem]">
      {children}
    </p>
  );
}

function MethodPillarsConnected() {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      className="mt-10 overflow-hidden rounded-3xl border border-palette-stone/18 bg-gradient-to-br from-palette-sage/20 via-white to-palette-cream p-6 md:mt-12 md:p-10"
    >
      <ol className="relative">
        <span
          aria-hidden
          className="absolute bottom-5 left-[17px] top-5 w-0.5 bg-gradient-to-b from-palette-sage/30 via-palette-sage to-palette-sage/30 xl:hidden"
        />
        <span
          aria-hidden
          className="absolute left-[6%] right-[6%] top-[19px] hidden h-0.5 bg-gradient-to-r from-palette-sage/30 via-palette-sage to-palette-sage/30 xl:block"
        />

        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between xl:gap-2">
          {METHOD_PILLARS.map((pillar, index) => (
            <motion.li
              key={pillar.title}
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex gap-5 xl:flex-1 xl:flex-col xl:items-center xl:gap-0 xl:px-1 xl:text-center"
            >
              <div className="relative z-10 shrink-0 xl:flex xl:w-full xl:justify-center">
                <span
                  aria-hidden
                  className="flex size-9 items-center justify-center rounded-full border-2 border-palette-sage bg-white font-montserrat text-sm font-semibold tabular-nums text-palette-ink shadow-[0_0_0_5px_rgba(223,224,195,0.45)] xl:size-10 xl:text-[15px]"
                >
                  {(index + 1).toString().padStart(2, '0')}
                </span>
              </div>

              <div className={`min-w-0 flex-1 xl:mt-5 ${index < METHOD_PILLARS.length - 1 ? 'border-b border-palette-stone/15 pb-8 xl:border-b-0 xl:pb-0' : ''}`}>
                <h4 className="font-semibold text-palette-ink text-[16px] leading-tight tracking-tight md:text-[17px] xl:text-[15px] 2xl:text-[16px]">
                  {pillar.title}
                </h4>
                <p className="mt-2 text-[14px] font-light leading-[1.6] text-palette-ink/80 md:text-[15px] xl:mt-2.5 xl:text-[13.5px] 2xl:text-[14.5px]">
                  {pillar.description}
                </p>
              </div>
            </motion.li>
          ))}
        </div>
      </ol>
    </motion.div>
  );
}

export default function MentorshipIsForYou() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-t border-white/10 bg-palette-ink py-16 font-montserrat text-left md:py-24">
        <CourseDarkSectionBackground />

        <div className="relative z-20 mx-auto w-[92%] max-w-6xl px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-36px' }}
          >
            <p className={landingEyebrowDark}>
              Para quién es
            </p>
            <h2 className={`${landingSectionTitleDark} max-w-2xl`}>
              Esta mentoría es para vos si…
            </h2>

            <motion.ul
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
              className="mt-10 grid max-w-5xl gap-x-14 border-t border-white/10 md:mt-12 md:grid-cols-2 md:gap-x-16 lg:gap-x-20"
            >
              {IS_FOR_YOU.map((item) => (
                <motion.li
                  key={item}
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-4 border-b border-white/[0.08] py-5 md:gap-5 md:py-6"
                >
                  <ListMarker />
                  <p className={`${landingSectionBodyDark} !mt-0`}>{item}</p>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </section>

      <section className="relative bg-palette-cream py-16 font-montserrat text-left md:py-24">
        <div className="relative mx-auto w-[92%] max-w-6xl px-3 sm:px-4">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-20px' }}
          className="mx-auto min-w-0 max-w-none"
          aria-labelledby="mentorship-method-roots-heading"
        >
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-12">
            <div className="min-w-0">
              <p className={landingEyebrow}>
                Las raíces
              </p>
              <h3
                id="mentorship-method-roots-heading"
                className={landingSectionTitle}
              >
                Un enfoque construido desde muchas disciplinas
              </h3>

              <div className="mt-6 md:mt-8">
                <p className={`${landingSectionBody} !mt-0`}>
                  La práctica integra herramientas de las artes marciales, el yoga, la gimnasia, la danza y el
                  entrenamiento físico para construir <span className="font-semibold">un mapa propio</span>, donde todo
                  dialoga y se complementa.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {PRACTICE_FOCUS.map((tag) => (
                    <Pill key={tag}>{tag}</Pill>
                  ))}
                </div>

                <PullQuote>Las capacidades son expresiones de un todo más grande.</PullQuote>

                <p className={`${landingSectionBody} mt-9 md:mt-11`}>
                  El objetivo no es únicamente moverte mejor, sino desarrollar una relación más consciente con tu cuerpo
                  y con la práctica. Aprender a observar, interpretar y construir tu propio camino, entendiendo que la
                  fuerza, la movilidad o las habilidades son parte de un sistema integrado.
                </p>

  
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: '-40px' }}
              className="mt-2 lg:sticky lg:top-28 lg:mt-0"
            >
              <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-palette-stone/20 bg-palette-stone/5 shadow-[0_18px_50px_rgba(20,20,17,0.08)] sm:aspect-[16/10] lg:aspect-[4/5]">
                <CldImage
                  src={ROOTS_IMAGE}
                  alt="Práctica integral de movimiento y cuerpo"
                  fill
                  sizes="(max-width: 1024px) 92vw, 40vw"
                  className="object-cover object-[center_40%]"
                  loader={imageLoader}
                  preserveTransformations
                />
              </div>
            </motion.div>
          </div>

          <div className="mt-16 border-t border-palette-stone/20 pt-12 md:mt-20 md:pt-14">
            <h3 className={`${landingSectionTitle} !mt-0`}>
              Los pilares del método
            </h3>
            <p className={`${landingSectionBody} max-w-2xl`}>
              Cinco dimensiones que aparecen en diferentes momentos del proceso, según lo que tu práctica necesita.
            </p>
            <MethodPillarsConnected />
          </div>
        </motion.section>
        </div>
      </section>
    </>
  );
}
