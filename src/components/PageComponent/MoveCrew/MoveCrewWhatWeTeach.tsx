'use client';

import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';

const disciplines = [
  {
    label: 'Movimiento',
    src: 'DSC01884_grva4a',
  },
  {
    label: 'HandBalance',
    src: 'my_uploads/fondos/DSC01472_mvzgw7',
  },
  {
    label: 'Movilidad',
    src: 'my_uploads/fondos/DSC01753_qdv9o0',
  },
];

export default function MoveCrewWhatWeTeach() {
  return (
    <section className="py-16 md:py-20 bg-palette-cream font-montserrat">
      <div className="w-[85%] max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-12 text-left md:text-left"
        >
          <p className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-stone/80 mb-2">
            Lo que enseñamos
          </p>
          <h2 className="text-2xl md:text-4xl font-montserrat font-semibold text-palette-ink tracking-tight mb-4">
            Disciplinas de movimiento
          </h2>
          <p className="font-raleway italic text-palette-stone text-base md:text-lg max-w-2xl mx-auto md:mx-0 leading-relaxed">
            Conocé, encarná y viví. Movimiento, HandBalance y Movilidad en un mismo espacio.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {disciplines.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="w-full flex flex-col items-center md:items-start"
            >
              <div className="group relative w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-palette-stone/10 border border-palette-stone/25 shadow-[0_4px_24px_rgba(20,20,17,0.06)] transition-all duration-300 hover:border-palette-stone/40 hover:shadow-[0_8px_32px_rgba(20,20,17,0.08)]">
                <CldImage
                  src={item.src}
                  alt={item.label}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loader={imageLoader}
                />
              </div>
              <span className="mt-4 text-sm font-montserrat font-medium tracking-wide text-palette-ink">
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
