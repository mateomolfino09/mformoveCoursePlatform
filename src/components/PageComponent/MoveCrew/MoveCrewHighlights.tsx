'use client'
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useId, useMemo, useRef, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import {
  PiHexagonLight,
  PiCircleLight,
  PiTriangleLight,
  PiSquareLight,
  PiDiamondLight,
  PiCaretDownLight
} from 'react-icons/pi';

const highlights = [
  {
    icon: PiHexagonLight,
    title: 'El Camino (Programación Mensual)',
    description: 'Un proceso diseñado para ganar disponibilidad física y mental.',
    expandedDescription:
      'Promovemos el uso de una libreta personal para anotar tus avances, dudas y reflexiones.'
  },
  {
    icon: PiCircleLight,
    title: 'Prácticas en Vivo',
    description: '3 sesiones mensuales en directo.',
    expandedDescription:
      'Las sesiones quedan grabadas para que puedas volver a ellas siempre.'
  },
  {
    icon: PiTriangleLight,
    title: 'Biblioteca de Clases',
    description: 'Módulos de movilidad, invertidas, flows de movimiento, fuerza y acondicionamiento.',
    expandedDescription:
      'Contenido modular para elegir según tu día: clases cortas para sostener constancia y sesiones más largas para construir base.'
  },
  {
    icon: PiSquareLight,
    title: 'Comunidad en WhatsApp',
    description: 'Un espacio para generar vínculos, compartir descubrimientos y sostener la práctica colectiva más allá de la pantalla.',
    expandedDescription:
      'La constancia se contagia: compartís avances, preguntas y recursos.'
  },
  {
    icon: PiDiamondLight,
    title: 'Soporte Técnico',
    description: 'El puente hacia la autonomía. Podés consultar dudas y enviar tus videos para recibir ajustes técnicos.',
    expandedDescription:
      'Priorizamos detalles que cambian todo (respiración, alineación, ritmo, tensión) sin complicarte.'
  }
];

type Highlight = typeof highlights[number];

const splitDescription = (text: string) => {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  const idx = cleaned.indexOf('. ');
  if (idx === -1) return { lead: cleaned, rest: '' };
  const lead = cleaned.slice(0, idx + 1);
  const rest = cleaned.slice(idx + 2);
  return { lead, rest };
};

const HighlightItem = ({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: Highlight;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const rowRef = useRef(null);
  const isInView = useInView(rowRef, { once: true, margin: '-120px' });
  const uid = useId();
  const panelId = `highlight-panel-${uid}-${index}`;
  const titleId = `highlight-title-${uid}-${index}`;

  const { lead, rest } = useMemo(() => splitDescription(item.description), [item.description]);

  return (
    <motion.div
      ref={rowRef}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
      className="relative"
    >
      <div className="absolute left-[14px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-palette-stone/30 to-transparent" />

      <div className="group border-b border-palette-stone/20">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-palette-sage/40 focus-visible:ring-offset-2 focus-visible:ring-offset-palette-cream"
        >
          <div className="flex items-start gap-4 py-6 md:py-7">
            <div className="relative mt-1 shrink-0">
              <div className="h-8 w-8 rounded-full border border-palette-stone/30 bg-palette-cream flex items-center justify-center text-[10px] font-montserrat tracking-[0.25em] text-palette-stone/70">
                {(index + 1).toString().padStart(2, '0')}
              </div>
              <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 h-3 w-px bg-palette-stone/30" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex flex-none h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-2xl bg-palette-sage/15 border border-palette-stone/25">
                      <item.icon className="h-5 w-5 text-palette-sage" />
                    </span>
                    <h3 id={titleId} className="text-base md:text-lg font-montserrat font-semibold text-palette-ink tracking-tight truncate">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm md:text-base text-palette-stone leading-relaxed font-light">
                    {lead}
                  </p>
                </div>

                <motion.span
                  aria-hidden="true"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="mt-2 shrink-0 text-palette-stone/70"
                >
                  <PiCaretDownLight className="h-5 w-5" />
                </motion.span>
              </div>
            </div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={titleId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pb-6 md:pb-7">
                <div className="ml-12 border-t border-palette-stone/15 pt-5">
                  <p className="text-sm md:text-base text-palette-stone leading-relaxed font-light">
                    {item.expandedDescription || rest || item.description.trim()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const CTACard = ({ index }: { index: number }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-100px' });

  const scrollToPlans = () => {
    const target = document.getElementById('membership-plans');
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative"
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        scale: 1,
      } : {}}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.08,
      }}
      whileHover={{
        scale: 1.03,
        y: -2,
        transition: {
          type: 'spring',
          stiffness: 220,
          damping: 18,
        },
      }}
      whileTap={{
        scale: 0.96,
        transition: {
          type: 'spring',
          stiffness: 380,
          damping: 28,
        },
      }}
    >
      {/* CTA editorial: más aire, menos "tarjeta" */}
      <motion.div className="relative overflow-hidden border-y border-palette-stone/25">
        <div className="absolute inset-0">
          <CldImage
            src="my_uploads/fondos/DSC01649_zdkpvr"
            alt="Cuerpo autónomo"
            fill
            className="object-cover"
            loader={imageLoader}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-palette-ink/90 via-palette-ink/75 to-palette-ink/35" />
          <div className="absolute inset-0 bg-palette-ink/35 md:bg-transparent" />
        </div>

        <motion.div
          className="relative z-10 px-6 py-10 md:px-10 md:py-12"
          initial={{ opacity: 0, y: 6 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: 0.1 + (index * 0.08), ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-montserrat uppercase tracking-[0.2em] text-xs text-palette-cream/70">
            Planes MoveCrew
          </p>

          <div className="mt-4 max-w-2xl">
            <motion.h3
              className="text-2xl md:text-3xl font-montserrat font-semibold text-palette-cream tracking-tight"
              initial={{ opacity: 0, y: 4 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.2 + (index * 0.08), ease: [0.16, 1, 0.3, 1] }}
            >
              ¿Todo listo para recuperar la soberanía de tu movimiento?
            </motion.h3>
            <motion.p
              className="mt-4 text-sm md:text-base text-palette-cream/85 leading-relaxed font-light"
              initial={{ opacity: 0, y: 4 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.25 + (index * 0.08), ease: [0.16, 1, 0.3, 1] }}
            >
              Descubrí los planes y empezá hoy mismo a construir una estructura capaz.
            </motion.p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <motion.button
              onClick={scrollToPlans}
              className="group inline-flex items-center justify-between gap-4 font-montserrat font-semibold text-sm uppercase tracking-[0.2em] rounded-full px-7 py-3 bg-palette-cream text-palette-ink border-2 border-palette-cream/80 hover:bg-white hover:border-white hover:text-palette-ink transition-all duration-200 w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-palette-cream/50 focus-visible:ring-offset-2 focus-visible:ring-offset-palette-ink"
              initial={{ opacity: 0, y: 4 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.3 + (index * 0.08), ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Ver planes disponibles</span>
              <span className="text-palette-ink/70 transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </motion.button>

            <p className="text-xs md:text-sm text-palette-cream/70 font-light">
              Bajás directo a los planes (sin abrir otra página).
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const MoveCrewHighlights = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section className="relative py-16 md:py-20 bg-palette-cream font-montserrat">
      <div className="w-[85%] max-w-6xl mx-auto px-4 text-left">
        {/* Cabecera alineada al concepto del Hero: tagline Raleway + título Montserrat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-12 md:mb-14"
        >
  
          <p className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-stone/80 mb-2">Cuerpo autónomo</p>
          <h2 className="text-2xl md:text-4xl font-montserrat font-semibold text-palette-ink tracking-tight">
          Tu nueva casa para una práctica de movimiento inteligente y sostenible.
          </h2>
          <p className="font-raleway italic text-palette-stone text-base md:text-lg max-w-2xl leading-relaxed mt-4">
            Un método con progresión clara para recuperar capacidad, fuerza y libertad en movimiento.
          </p>
        </motion.div>

        <div className="max-w-4xl">
          <div className="flex flex-col">
            {highlights.map((item, index) => (
              <HighlightItem
                key={item.title}
                item={item}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex((cur) => (cur === index ? -1 : index))}
              />
            ))}
          </div>

          <div className="mt-8">
            <CTACard index={5} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoveCrewHighlights;
