import { ClassesDB, CoursesDB } from '../../typings';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React from 'react';

interface Props {
  clase: ClassesDB;
  course: CoursesDB;
}

const ClassThumbnail = ({ clase, course }: Props) => {
  return (
    <div className='w-full h-full flex flex-row mt-8 justify-between bg-dark lg:w-2/3'>
      <div className='w-full h-full flex flex-row items-center'>
        <h2 className='text-lg ml-2 font-light'>{clase.name}</h2>
        <p className='text-base ml-2 text-gray-300/80 font-light mr-4'>
          {clase.id}/{course.classesQuantity}
        </p>
      </div>
    </div>
  );
};

export default ClassThumbnail;
