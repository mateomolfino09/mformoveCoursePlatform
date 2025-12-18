import { IndividualClass } from '../../../../typings';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React from 'react';
import { motion as m } from 'framer-motion';

interface Props {
  clase: IndividualClass;
  setTime: any;
  setForward: any;
  playerRef: any;
}

const ClassData = ({
  clase,
  setTime,
  setForward,
  playerRef
}: Props) => {
  const router = useRouter();


  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='w-full flex flex-col space-y-6'
    >
      <h1 className='text-3xl md:text-4xl lg:text-5xl font-extrabold text-white font-montserrat tracking-tight leading-tight'>
        {clase?.name}
      </h1>
      {clase?.tags && clase.tags.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {clase.tags.map(tag => (
            <m.div
              key={tag.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 backdrop-blur-md border border-amber-300/30 px-4 py-2 rounded-full cursor-pointer transition-all duration-300 hover:border-amber-300/50 hover:shadow-lg hover:shadow-amber-500/10'
            >
              <p className='text-white text-sm font-montserrat font-medium'>{tag.title}</p>
            </m.div>
          ))}
        </div>
      )}
    </m.div>
  );
  
};

export default ClassData;
