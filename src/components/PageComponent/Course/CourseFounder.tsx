'use client';

import { motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import imageLoader from '../../../../imageLoader';
import { useCursoLanding } from './CursoLandingContext';
import {
  landingEyebrow,
  landingFadeUp,
  landingSectionBody,
  landingSectionContainer,
  landingSectionShell,
  landingSectionTitle,
} from '../../../constants/landingSectionDesign';

const StatItem = ({ value, label }: { value: string; label: string }) => {
  if (!value?.trim()) return null;
  return (
    <div className="flex flex-col items-center text-center md:items-start md:text-left">
      <p className="font-montserrat text-3xl font-bold tracking-tight text-palette-ink md:text-4xl">
        {value}
      </p>
      <p className="mt-1 font-montserrat text-xs font-semibold uppercase tracking-[0.16em] text-palette-stone md:text-sm">
        {label}
      </p>
    </div>
  );
};

/** Sección de autoridad ("El Fundador") — se oculta por completo si no hay título cargado. */
export default function CourseFounder() {
  const { cursoConfig, productName } = useCursoLanding();
  const { fundador } = cursoConfig;

  if (!fundador?.titulo?.trim()) return null;

  const stats = fundador.stats || { anios: '', estudiantes: '', paises: '' };
  const hasImage = Boolean(fundador.imagenPublicId?.trim());
  const hasStats = Boolean(stats.anios?.trim() || stats.estudiantes?.trim() || stats.paises?.trim());

  return (
    <section className={`${landingSectionShell} relative overflow-hidden`}>
      <div className={landingSectionContainer}>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 md:flex-row md:items-center md:gap-14">
          {hasImage ? (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: '-40px' }}
              className="relative h-64 w-64 shrink-0 overflow-hidden rounded-3xl border border-palette-stone/20 shadow-[0_20px_50px_-24px_rgba(20,20,17,0.2)] md:h-80 md:w-72"
            >
              <CldImage
                src={fundador.imagenPublicId}
                alt={fundador.titulo || productName}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 60vw, 320px"
                loader={imageLoader}
              />
            </motion.div>
          ) : null}

          <motion.div
            {...landingFadeUp}
            className="min-w-0 flex-1 text-center md:text-left"
          >
            {fundador.eyebrow ? <p className={landingEyebrow}>{fundador.eyebrow}</p> : null}
            <h2 className={landingSectionTitle}>{fundador.titulo}</h2>
            {fundador.bio ? <p className={landingSectionBody}>{fundador.bio}</p> : null}

            {hasStats ? (
              <div className="mt-8 grid grid-cols-3 gap-4 md:mt-10 md:max-w-md md:gap-8">
                <StatItem value={stats.anios} label="Años" />
                <StatItem value={stats.estudiantes} label="Estudiantes" />
                <StatItem value={stats.paises} label="Países" />
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
