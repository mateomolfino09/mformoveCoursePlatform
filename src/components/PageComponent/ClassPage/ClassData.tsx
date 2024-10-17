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
    <div className='w-full h-full flex flex-row mt-8 lg:pb-8 justify-between bg-dark lg:w-2/3 md:h-auto '>
      <h2 className='text-2xl px-2 md:px-0 font-boldFont md:text-3xl ml-2 mb-4 md:mb-1 font-light'>{clase?.name}</h2>
      <div className='h-10 min-w-[5rem] flex flex-row mr-4 rounded-lg'>

      </div>
    </div>
  );
};

export default ClassData;
