import { ClassesDB, IndividualClass } from '../../../../typings';
import state from '../../../valtio';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { useSnapshot } from 'valtio';
import { motion } from 'framer-motion';

interface Props {
  clase: IndividualClass;
}
const ClassOptions = ({ clase }: Props) => {
  const snap = useSnapshot(state);

  const handleClickTemario = () => {
    state.classHeaders = 'Temario';
  };
  const handleClickRecursos = () => {
    state.classHeaders = 'Recursos';
  };
  const handleClickPreguntas = () => {
    state.classHeaders = 'Preguntas';
  };

  return (
    <div className='w-full flex flex-row gap-2 border-b border-gray-800/50 pb-1'>
      <button
        onClick={handleClickRecursos}
        className={`relative px-6 py-3 font-montserrat font-medium text-sm md:text-base transition-all duration-300 ${
          snap.classHeaders === 'Recursos'
            ? 'text-white'
            : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        Recursos
        {snap.classHeaders === 'Recursos' && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </button>
      <button
        onClick={handleClickPreguntas}
        className={`relative px-6 py-3 font-montserrat font-medium text-sm md:text-base transition-all duration-300 ${
          snap.classHeaders === 'Preguntas'
            ? 'text-white'
            : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        Preguntas
        {(snap.classHeaders === 'Preguntas' || !snap.classHeaders || snap.classHeaders === 'Temario') && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </button>
    </div>
  );
};

export default ClassOptions;
