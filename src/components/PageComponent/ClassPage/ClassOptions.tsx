import { ClassesDB, CoursesDB, IndividualClass } from '../../../../typings';
import state from '../../../valtio';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { useSnapshot } from 'valtio';

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
    <div className='w-full h-full flex flex-row mt-8 justify-between bg-dark px-2 lg:w-2/3 lg:hidden'>
      <div
        className='w-full h-full flex flex-col justify-center items-center'
        onClick={handleClickRecursos}
      >
        <button
          className={`font-semibold ${
            snap.classHeaders === 'Recursos' ? 'text-white' : 'text-gray-300/60'
          }`}
        >
          Recursos
        </button>
        <hr
          className={`w-full border ${
            snap.classHeaders === 'Recursos'
              ? 'border-white'
              : 'border-gray-500/40'
          }`}
        />
      </div>
      <div
        className='w-full h-full flex flex-col justify-center items-center'
        onClick={handleClickPreguntas}
      >
        <button
          className={`font-semibold ${
            snap.classHeaders === 'Preguntas'
              ? 'text-white'
              : 'text-gray-300/60'
          }`}
        >
          Preguntas
        </button>
        <hr
          className={`w-full border ${
            snap.classHeaders === 'Preguntas'
              ? 'border-white'
              : 'border-gray-500/40'
          }`}
        />
      </div>
    </div>
  );
};

export default ClassOptions;
