'use client'
import { IndividualClass } from '../../../../typings';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import CarouselClassesThumbnail from '../../CarouselClassesThumbnail';

interface Props {
  currentClassId: string | number;
  currentClassType?: string;
  /** Base path for class links (e.g. '/library/individual-classes'). Default '/classes'. */
  classLinkBase?: string;
}

const RecommendedClasses = ({ currentClassId, currentClassType, classLinkBase = '/classes' }: Props) => {
  const base = classLinkBase.replace(/\/$/, '');
  const [recommendedClasses, setRecommendedClasses] = useState<IndividualClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendedClasses() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/individualClass/getClasses', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
        });
        const allClasses: IndividualClass[] = await res.json();
        const filtered = allClasses
          .filter((c) => c.id !== currentClassId && c._id !== currentClassId)
          .slice(0, 10);
        setRecommendedClasses(filtered);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching recommended classes:', error);
        setIsLoading(false);
      }
    }
    fetchRecommendedClasses();
  }, [currentClassId]);

  const isLibrary = base.includes('library');

  if (isLoading) {
    return (
      <section className={`relative w-full py-12 md:py-16 ${isLibrary ? 'bg-palette-cream' : 'bg-black'}`}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12'>
          <div className='h-64 flex items-center justify-center'>
            <div className={`h-10 w-10 border-2 rounded-full animate-spin ${isLibrary ? 'border-palette-stone/30 border-t-palette-sage' : 'border-amber-300/30 border-t-amber-300'}`} />
          </div>
        </div>
      </section>
    );
  }

  if (recommendedClasses.length === 0) {
    return null;
  }

  return (
    <section className={`relative w-full py-12 md:py-16 ${isLibrary ? 'bg-palette-cream' : 'bg-black'}`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className='mb-8'
        >
          <h2 className={`text-2xl md:text-3xl font-semibold font-montserrat mb-2 ${isLibrary ? 'text-palette-ink' : 'text-white'}`}>
            Clases recomendadas
          </h2>
          <p className={`font-montserrat text-sm md:text-base ${isLibrary ? 'text-palette-stone' : 'text-gray-400'}`}>
            Descubre más clases que podrían interesarte
          </p>
        </motion.div>

        {/* Grid en filas: móvil 1–2 columnas, desktop 3–4 columnas */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8'>
          {recommendedClasses.map((c: IndividualClass, index) => (
            <div key={c._id || c.id || index} className='flex min-h-0 w-full'>
              <div className='w-full flex flex-col'>
                <CarouselClassesThumbnail c={c} isNew={false} variant={isLibrary ? 'library' : 'default'} linkBase={base} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedClasses;

