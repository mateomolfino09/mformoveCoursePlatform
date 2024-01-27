import { ClassesDB, CoursesDB, IndividualClass } from '../../../../typings';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React from 'react';

interface Props {
  clase: IndividualClass;
}

const ClassThumbnail = ({ clase }: Props) => {
  return (
    <div className='w-full h-full flex flex-row justify-between bg-dark lg:w-2/3 md:h-auto'>
      <div className='w-full h-full flex flex-row items-center'>
        <h3 className='text-lg ml-2 font-light'>{clase.description}</h3>
      </div>
    </div>
  );
};

export default ClassThumbnail;
