import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React from 'react';
import { IndividualClass } from '../../../../typings';
import { motion } from 'framer-motion';

interface Props {
  clase: IndividualClass;
}

const ClassThumbnail = ({ clase }: Props) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className='w-full'
    >
      <div className='relative rounded-2xl border border-amber-300/20 bg-gradient-to-br from-white/5 via-amber-500/5 to-orange-500/5 backdrop-blur-md p-6 md:p-8 overflow-hidden'>
        {/* Decoración de fondo */}
        <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/10 to-orange-400/5 rounded-full blur-3xl' />
        
        <div className='relative z-10'>
          <p className='text-white/90 text-base md:text-lg font-montserrat font-light leading-relaxed'>
            {clase.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ClassThumbnail;
