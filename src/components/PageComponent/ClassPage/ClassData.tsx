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
    <div className='w-full h-full flex flex-col mt-8 md:mt-24 lg:pb-8 justify-between bg-dark lg:w-2/3 md:h-auto '>
      <h2 className='text-2xl px-2 md:px-0 font-boldFont md:text-3xl ml-2 mb-4 md:mb-1 font-light'>
        {clase?.name}
      </h2>
      <div className='mt-4 min-w-[5rem] space-x-2 px-2 flex flex-wrap mr-4 rounded-lg'>
        {clase?.tags.map(tag => (
          <div
            key={tag.id}
            className='bg-white cursor-pointer transition-all duration-300 hover:scale-105 w-auto px-2 py-1 flex justify-center items-center rounded-full mb-2'
          >
            <p className='text-black text-center text-xs font-montserrat'>{tag.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
  
};

export default ClassData;
