'use client'
import { IndividualClass } from '../../../../typings';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import CarouselClassesThumbnail from '../../CarouselClassesThumbnail';
import { useRouter } from 'next/navigation';

interface Props {
  currentClassId: string | number;
  currentClassType?: string;
}

const RecommendedClasses = ({ currentClassId, currentClassType }: Props) => {
  const [recommendedClasses, setRecommendedClasses] = useState<IndividualClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRowRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchRecommendedClasses() {
      try {
        setIsLoading(true);
        // Obtener todas las clases
        const res = await fetch('/api/individualClass/getClasses', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        });
        
        const allClasses: IndividualClass[] = await res.json();
        
        // Filtrar la clase actual y limitar a 10 clases
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

  const handleClick = (direction: string) => {
    if (scrollRowRef.current) {
      const { scrollLeft, clientWidth } = scrollRowRef.current;
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;

      scrollRowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section className='relative w-full bg-black py-12 md:py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12'>
          <div className='h-64 flex items-center justify-center'>
            <div className='h-10 w-10 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin' />
          </div>
        </div>
      </section>
    );
  }

  if (recommendedClasses.length === 0) {
    return null;
  }

  return (
    <section className='relative w-full bg-black py-12 md:py-16 group'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className='mb-8'
        >
          <h2 className='text-2xl md:text-3xl font-extrabold text-white font-montserrat mb-2'>
            Clases Recomendadas
          </h2>
          <p className='text-gray-400 font-montserrat text-sm md:text-base'>
            Descubre más clases que podrían interesarte
          </p>
        </motion.div>

        {/* Mobile: Grid Layout */}
        <div className='md:hidden grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8'>
          {recommendedClasses.map((c: IndividualClass, index) => (
            <React.Fragment key={c._id || c.id || index}>
              <div className='flex min-h-0 w-full'>
                <div className='w-full flex flex-col'>
                  <Link href={`/classes/${c._id || c.id}`}>
                    <CarouselClassesThumbnail c={c} isNew={false} />
                  </Link>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Desktop: Carousel Layout */}
        <div className='relative'>
          <ChevronLeftIcon
            className='hidden md:block absolute left-0 z-10 h-10 w-10 text-white/70 hover:text-white opacity-0 transition-all hover:scale-125 group-hover:opacity-100 cursor-pointer bg-black/50 rounded-full p-2'
            onClick={() => handleClick('left')}
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          />

          <motion.div
            className='hidden md:block inner-carousel overflow-y-hidden scrollbar-hide overflow-x-scroll relative'
            ref={scrollRowRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className='flex gap-6 px-2 items-stretch'>
              {recommendedClasses.map((c: IndividualClass, index) => (
                <React.Fragment key={c._id || c.id || index}>
                  <div className='flex-shrink-0 w-[320px] flex'>
                    <div className='w-full flex flex-col'>
                      <Link href={`/classes/${c._id || c.id}`}>
                        <CarouselClassesThumbnail c={c} isNew={false} />
                      </Link>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          <ChevronRightIcon
            className='hidden md:block absolute right-0 z-10 h-10 w-10 text-white/70 hover:text-white opacity-0 transition-all hover:scale-125 group-hover:opacity-100 cursor-pointer bg-black/50 rounded-full p-2'
            onClick={() => handleClick('right')}
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
      </div>
    </section>
  );
};

export default RecommendedClasses;

