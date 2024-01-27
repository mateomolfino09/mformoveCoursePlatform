import { ClassesDB, CoursesDB, IndividualClass } from '../../../../typings';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React from 'react';

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
    <div className='w-full h-full flex flex-row mt-4 justify-between bg-dark lg:w-2/3 md:h-auto md:mb-4'>
      <h2 className='text-xl md:text-2xl ml-2 font-light'>{clase?.name}</h2>
      <div className='h-10 min-w-[5rem] flex flex-row mr-4 rounded-lg'>

      </div>
    </div>
  );
};

export default ClassData;
