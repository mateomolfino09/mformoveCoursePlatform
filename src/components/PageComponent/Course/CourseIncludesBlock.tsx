'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import {
  CURSO_SUSCRIPCION_INCLUDES,
  CURSO_SUSCRIPCION_INCLUDES_LEAD_MENSUAL,
  CURSO_SUSCRIPCION_INCLUDES_LEAD_OFERTA,
  CURSO_SUSCRIPCION_OFERTA_BONUS,
  CURSO_SUSCRIPCION_PARA_VOS,
  CURSO_SUSCRIPCION_RESULTADO,
} from '../../../constants/cursoSuscripcionIncludes';
import CourseDarkSectionBackground from './CourseDarkSectionBackground';

type AccordionId = 'incluye' | 'para-vos' | 'resultado';

const INCLUDES_BLOCK_BG = 'my_uploads/plaza/DSC03350_vgjrrh';

const IncludesCheckItem = ({
  children,
  delay = 0,
  highlight = false,
}: {
  children: ReactNode;
  delay?: number;
  highlight?: boolean;
}) => (
  <motion.li
    initial={highlight ? { opacity: 0, y: 12 } : false}
    animate={highlight ? { opacity: 1, y: 0 } : undefined}
    transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    className="flex items-start gap-3 text-left"
  >
    <span
      aria-hidden
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-montserrat text-xs font-bold md:h-6 md:w-6 md:text-[13px] ${
        highlight
          ? 'bg-palette-sage/40 text-palette-sage shadow-[0_0_0_1px_rgba(166,184,154,0.55)]'
          : 'bg-palette-sage/20 text-palette-sage'
      }`}
    >
      ✓
    </span>
    <span
      className={`font-raleway text-base font-light leading-snug md:text-lg ${
        highlight ? 'font-medium text-palette-cream' : 'text-palette-cream/90'
      }`}
    >
      {children}
    </span>
  </motion.li>
);

const IncludesAccordion = ({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: AccordionId;
  title: string;
  open: boolean;
  onToggle: (id: AccordionId) => void;
  children: ReactNode;
}) => (
  <div className="border-b border-palette-cream/10">
    <button
      type="button"
      onClick={() => onToggle(id)}
      aria-expanded={open}
      className="flex w-full items-center gap-3 py-4 text-left transition-colors hover:bg-palette-cream/[0.04] md:py-5"
    >
      <span className="min-w-0 flex-1 font-montserrat text-base font-semibold tracking-tight text-palette-cream md:text-xl">
        {title}
      </span>
      <ChevronDownIcon
        className={`h-5 w-5 shrink-0 text-palette-sage/80 transition-transform duration-200 md:h-6 md:w-6 ${
          open ? 'rotate-180' : ''
        }`}
      />
    </button>
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="overflow-visible pb-5 pl-1 pt-0 md:pb-6 md:pl-1.5">{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  </div>
);

export default function CourseIncludesBlock({ isOferta }: { isOferta: boolean }) {
  const [openId, setOpenId] = useState<AccordionId | null>('incluye');

  useEffect(() => {
    setOpenId('incluye');
  }, [isOferta]);

  const toggle = (id: AccordionId) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isOferta ? 'oferta' : 'mensual'}
        id="curso-includes-block"
        initial={
          isOferta ? { opacity: 0, y: 40, scale: 0.92 } : { opacity: 0, y: 18 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={
          isOferta
            ? { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
            : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
        }
        className={`relative isolate mt-10 scroll-mt-28 overflow-hidden rounded-[1.75rem] border text-palette-cream md:mt-12 md:scroll-mt-32 md:rounded-[2rem] ${
          isOferta
            ? 'border-palette-sage/30 bg-palette-ink shadow-[0_40px_100px_-36px_rgba(20,20,17,0.7),0_0_0_1px_rgba(166,184,154,0.2)]'
            : 'border-palette-ink/15 bg-palette-ink shadow-[0_32px_80px_-36px_rgba(20,20,17,0.55)]'
        }`}
      >
        {isOferta ? <div className="mentorship-silver-border" aria-hidden /> : null}

        {isOferta ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2]"
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-palette-sage/35 via-palette-sage/10 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-sage to-transparent" />
          </motion.div>
        ) : null}

        <CourseDarkSectionBackground />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[min(55%,22rem)] opacity-[0.18]"
          style={{
            WebkitMaskImage: 'linear-gradient(to top, black 35%, transparent 100%)',
            maskImage: 'linear-gradient(to top, black 35%, transparent 100%)',
          }}
        >
          <CldImage
            src={INCLUDES_BLOCK_BG}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover object-[center_70%]"
            loader={imageLoader}
          />
        </div>

        <div className="relative z-20 mx-auto max-w-2xl px-5 py-8 md:px-10 md:py-10">
          <motion.p
            initial={isOferta ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isOferta ? 0.15 : 0, duration: 0.4 }}
            className="mb-1 font-montserrat text-xs font-semibold uppercase tracking-[0.22em] text-palette-sage md:text-[13px]"
          >
            {isOferta ? 'Oferta' : 'Mensual'}
          </motion.p>
          <motion.p
            initial={isOferta ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isOferta ? 0.22 : 0, duration: 0.45 }}
            className="mb-4 font-raleway text-base font-light leading-snug text-palette-cream/65 md:mb-5 md:text-lg"
          >
            {isOferta
              ? CURSO_SUSCRIPCION_INCLUDES_LEAD_OFERTA
              : CURSO_SUSCRIPCION_INCLUDES_LEAD_MENSUAL}
          </motion.p>

          <IncludesAccordion
            id="incluye"
            title="Qué incluye"
            open={openId === 'incluye'}
            onToggle={toggle}
          >
            {isOferta ? (
              <div className="space-y-5 md:space-y-6">
                <ul className="space-y-3 md:space-y-3.5">
                  {CURSO_SUSCRIPCION_INCLUDES.map((item, index) => (
                    <IncludesCheckItem key={item} highlight delay={0.28 + index * 0.04}>
                      {item}
                    </IncludesCheckItem>
                  ))}
                </ul>
                <div>
                  <motion.p
                    initial={{ opacity: 0, letterSpacing: '0.35em' }}
                    animate={{ opacity: 1, letterSpacing: '0.22em' }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mb-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.22em] text-palette-sage md:text-xs"
                  >
                    Además
                  </motion.p>
                  <ul className="space-y-3 md:space-y-3.5">
                    {CURSO_SUSCRIPCION_OFERTA_BONUS.map((item, index) => (
                      <IncludesCheckItem key={item} highlight delay={0.6 + index * 0.1}>
                        {item}
                      </IncludesCheckItem>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <ul className="space-y-3 md:space-y-3.5">
                {CURSO_SUSCRIPCION_INCLUDES.map((item) => (
                  <IncludesCheckItem key={item}>{item}</IncludesCheckItem>
                ))}
              </ul>
            )}
          </IncludesAccordion>

          <IncludesAccordion
            id="para-vos"
            title="Para vos si"
            open={openId === 'para-vos'}
            onToggle={toggle}
          >
            <p className="font-raleway text-base font-light leading-relaxed text-palette-cream/85 md:text-lg">
              {CURSO_SUSCRIPCION_PARA_VOS}
            </p>
          </IncludesAccordion>

          <IncludesAccordion
            id="resultado"
            title="Resultado"
            open={openId === 'resultado'}
            onToggle={toggle}
          >
            <p className="font-raleway text-base font-light leading-relaxed text-palette-cream/85 md:text-lg">
              {CURSO_SUSCRIPCION_RESULTADO}
            </p>
          </IncludesAccordion>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
