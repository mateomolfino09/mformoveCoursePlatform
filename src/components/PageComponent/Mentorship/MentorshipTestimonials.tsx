'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import imageLoader from '../../../../imageLoader';

const testimonials = [
  {
    name: 'Ignacio Luz',
    plan: 'Mentoría',
    photo: '/images/testimonials/testimonio_nacho.jpg',
    text: 'La mentoría con Mateo es una experiencia transformadora. Gracias a su mirada precisa y su acompañamiento constante, hoy me siento mucho más conectado con mi cuerpo y más cerca de los resultados que deseo.',
  },
  {
    name: 'Sofía Velozo',
    plan: 'Mentoría',
    photo: '/images/testimonials/sofia.jpeg',
    text: 'Nunca había sentido un progreso tan real y sostenido. Mateo te motiva, te corrige y te acompaña en cada paso. Recomiendo la mentoría a cualquiera que busque un cambio profundo.',
  },
  {
    name: 'Gonzalo Amado',
    plan: 'Mentoría',
    photo: '/images/testimonials/gonza.jpg',
    text: 'Mateo como profe es excelente. Siempre te pone a prueba, te motiva y celebra tus intentos, sin importar el resultado. Lo recomiendo al 100% si querés sentirte más libre, con confianza en cada movimiento, y rodeado de un ambiente de amistad.',
  },
];

export default function MentorshipTestimonials() {
  return (
    <section className="border-t border-palette-stone/18 bg-palette-cream pb-14 pt-12 font-montserrat md:pb-16 md:pt-16">
      <div className="mx-auto w-[92%] max-w-6xl px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-40px' }}
          className="mb-10 max-w-xl md:mb-12"
        >
          <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-palette-ink">Voces del proceso</p>
          <h2 className="mt-3 text-[1.65rem] font-semibold leading-[1.1] tracking-tight text-palette-ink sm:text-[2rem] md:text-[2.35rem]">
            Quienes ya están adentro
          </h2>
          <p className="mt-3 max-w-xl text-[14px] font-light leading-[1.65] text-palette-ink opacity-90 md:text-[15px]">
            Nada vende mejor que la experiencia cotidiana. Estas palabras ordenan algo de lo que pasa cuando el trabajo es serio,
            cercano y a tu ritmo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {testimonials.map((t, index) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: Math.min(index * 0.05, 0.12), ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: '-24px' }}
              className="flex min-h-[100%] flex-col rounded-2xl border border-palette-stone/18 bg-white/45 px-5 py-6 shadow-[0_4px_24px_rgba(20,20,17,0.04)] sm:px-6 sm:py-7"
            >
              <p className="text-[13px] font-light leading-[1.7] text-palette-ink opacity-[0.93] md:text-[14px]">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="mt-auto flex items-center gap-3.5 border-t border-palette-stone/14 pt-5">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-palette-stone/20">
                  <Image
                    src={t.photo}
                    alt={`Retrato de ${t.name}`}
                    width={48}
                    height={48}
                    loader={imageLoader}
                    className="h-full w-full object-cover grayscale-[25%]"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold tracking-tight text-palette-ink">{t.name}</p>
                  <p className="text-[11px] font-normal uppercase tracking-[0.22em] text-palette-ink/55">{t.plan}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
