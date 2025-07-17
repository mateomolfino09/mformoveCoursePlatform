import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React from 'react';
import { IndividualClass } from '../../../../typings';

interface Props {
  clase: IndividualClass;
}

const ClassThumbnail = ({ clase }: Props) => {
  return (
    <div className='w-full h-full flex flex-row justify-between bg-dark pb-24 lg:w-2/3 md:h-auto'>
      <div className='w-full h-full flex flex-row items-center'>
        <h3 className='text-base md:text-lg pr-5 px-2 md:px-0 md:pr-0 ml-2 font-light mt-8 md:mb-12'>{clase.description}</h3>
      </div>
    </div>
  );
};

export default ClassThumbnail;
