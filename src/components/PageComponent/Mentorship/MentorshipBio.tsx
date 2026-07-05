'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import imageLoader from '../../../../imageLoader';

const PORTRAIT =
  'https://res.cloudinary.com/dbeem2avp/image/upload/v1751917144/my_uploads/plaza/IMG_0333_mheawa.jpg';

export default function MentorshipBio() {
  return (
    <section className="border-t border-white/10 bg-palette-ink py-14 font-montserrat text-left md:py-16">
      <div className="mx-auto w-[92%] max-w-6xl px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-40px' }}
          className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12"
        >
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-palette-sage/30 ring-1 ring-white/10 md:h-36 md:w-36">
            <Image
              src={PORTRAIT}
              alt="Mateo Molfino"
              width={144}
              height={144}
              className="h-full w-full object-cover grayscale-[25%]"
              style={{ objectPosition: 'center 10%' }}
              loader={imageLoader}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-palette-cream/55">Sobre mí</p>
            <h2 className="mt-3 text-[1.65rem] font-semibold leading-[1.12] tracking-tight text-palette-cream sm:text-[2rem] md:text-[2.2rem]">
              Mateo Molfino
            </h2>
            <div className="mt-4 space-y-4 text-[14px] font-light leading-[1.72] text-palette-cream/88 md:text-[15px] md:leading-[1.7]">
              <p>
                Me llamo Mateo: el movimiento y la ciencia siempre me movilizaron. Estudié ingeniería, soy profesor de yoga y me
                interesa el funcionamiento del cuerpo en diálogo con el entorno. Creo en la relación entre movimiento y vida, entre
                cuerpo y mundo.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          viewport={{ once: true, margin: '-32px' }}
          className="mt-12 grid gap-10 border-t border-white/10 pt-12 md:mt-14 md:grid-cols-2 md:gap-14 md:pt-14"
        >
          <div className="border-l border-palette-sage/35 pl-6">
            <h3 className="text-lg font-semibold tracking-tight text-palette-cream md:text-xl">Filosofía</h3>
            <div className="mt-4 space-y-4 text-[13px] font-light leading-[1.72] text-palette-cream/78 md:text-[14px]">
              <p>
                El movimiento no es solo ejercicio: es forma de conocerte, de ver tus límites y ampliarlos. No se trata de un solo
                objetivo puntual, sino de exponerte a tus puntos débiles para crecer con criterio.
              </p>
              <p>
                Trabajo en cocreación. Si algo no funciona, lo ajustamos; si necesitás tiempo, está bien; si querés más profundidad,
                avanzamos. La mentoría es tu proceso.
              </p>
            </div>
          </div>

          <div className="border-l border-palette-sage/35 pl-6">
            <h3 className="text-lg font-semibold tracking-tight text-palette-cream md:text-xl">Método y ciencia</h3>
            <div className="mt-4 space-y-4 text-[13px] font-light leading-[1.72] text-palette-cream/78 md:text-[14px]">
              <p>
                Pienso la integralidad del cuerpo — del tejido conectivo a la forma en que te organizás en el espacio. No somos
                músculos aislados: somos una unidad donde tensiones y compresiones se equilibran.
              </p>
              <p>
                El aprendizaje motor pide repetición, feedback y tiempo para integrar. Por eso la mentoría se piensa en ciclos:
                cambiar patrones lleva semanas de observación y práctica guiada.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
