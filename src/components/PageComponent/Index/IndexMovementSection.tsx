'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { routes } from '../../../constants/routes';
import imageLoader from '../../../../imageLoader';

// Si no hay videoSrc se usa imageSrc como fondo. Añade videoSrc (y poster) cuando tengas videos.
const disciplines = [
  {
    label: 'Movimiento',
    videoSrc: '',
    poster: 'https://res.cloudinary.com/dbeem2avp/image/upload/v1769777236/DSC01884_grva4a.jpg',
  },
  {
    label: 'HandBalance',
    videoSrc: '',
    poster: 'https://res.cloudinary.com/dbeem2avp/image/upload/v1764272388/my_uploads/fondos/DSC01472_mvzgw7.jpg',
  },
  {
    label: 'Movilidad',
    videoSrc: '',
    poster: 'https://res.cloudinary.com/dbeem2avp/image/upload/v1765658798/my_uploads/fondos/DSC01753_qdv9o0.jpg',
  },
];

export default function IndexMovementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 0.15, 0.5], [24, 0, -12]);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.2], [0.6, 1, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full font-montserrat overflow-hidden flex justify-center"
      style={{ backgroundColor: '#FAF8F5' }}
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-16">
        {/* Pequeño label superior */}
        <motion.p
          style={{ y, opacity }}
          className="text-xs md:text-sm font-light tracking-[0.2em] uppercase text-gray-500 mb-4 text-center"
        >
          Disciplinas de movimiento
        </motion.p>

        <motion.h2
          style={{ y, opacity }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-gray-900 tracking-tight mb-3 text-center"
        >
          Mis clases
        </motion.h2>

        <motion.p
          style={{ opacity }}
          className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mb-16 md:mb-20 mx-auto text-center"
        >
          Conoce, encarna y vive. Biblioteca activa para practicantes de la Move Crew.
        </motion.p>

        {/* Bloques cuadrados con bordes redondeados y video */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 mb-16 w-full max-w-5xl mx-auto">
          {disciplines.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="w-full flex flex-col items-center"
            >
              {/* Bloque cuadrado con bordes redondeados: ratio 1:1 */}
              <div className="group relative w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-gray-200/80 shadow-sm ring-1 ring-black/5 transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg hover:ring-black/10">
                {item.videoSrc ? (
                  <video
                    src={item.videoSrc}
                    poster={item.poster || undefined}
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : item.poster ? (
                  <Image
                    src={item.poster}
                    alt={item.label}
                    fill
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loader={imageLoader}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200/90">
                    <span className="text-gray-500 font-light tracking-wide text-lg md:text-xl">
                      {item.label}
                    </span>
                  </div>
                )}
              </div>
              <span className="mt-4 text-sm font-medium tracking-wide text-gray-700">
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center"
        >
          <Link
            href={routes.navegation.membership.moveCrew}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-gray-900 text-gray-900 font-medium text-sm md:text-base hover:bg-gray-900 hover:text-[#FAF8F5] transition-all duration-300"
          >
            Unirme al primer círculo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
