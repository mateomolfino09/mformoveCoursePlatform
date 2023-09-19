import { ClassesDB, CoursesDB } from '../../typings';
import { FlagIcon } from '@heroicons/react/24/solid';
import { useRouter, usePathname } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import { useGlobalContext } from '../app/context/store';

interface Props {
  clase: ClassesDB;
  course: CoursesDB;
}

const ClassBanner = ({ clase, course }: Props) => {
  const [module, setModule] = useState(false);
  const { courses, setCourses } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    if (course.modules.breakPoints.includes(clase.id)) {
      setModule(true);
    }
  }, []);

  const handleRouteChange = () => {
    router.push(`/courses/${course.id}/${clase.id}`);
  };

  return (
    <div className='flex flex-col bg-dark-soft'>
      {module && (
        <div className='w-full bg-dark flex items-center  font-bold text-base h-full relative ml-4 border-l-2 border-white bg-dark-soft pl-5'>
          <span className='absolute -left-3 w-6 h-6 px-1 rounded-[50%] bg-dark-soft flex justify-center items-center text-white '>
            <FlagIcon />
          </span>
          <div className='py-2 px-4 box-border border-b border-[#40587c] flex items-center h-16 w-full min-w-[200px] overflow-hidden text-white'>
            <p>
              {
                course.modules.titles[
                  course.modules.breakPoints.indexOf(clase.id)
                ]
              }
            </p>
          </div>
        </div>
      )}
      <div
        className={`w-full bg-dark flex items-center font-bold text-base h-full relative left-4 ${
          clase.id !== course.classes.length
            ? 'border-l-2'
            : 'border-l-0 before:absolute before:top-0 before:left-0 before:h-1/2 before:border-l-[2px] before:border-white'
        } border-white bg-dark-soft pl-5`}
        onClick={handleRouteChange}
      >
        <span className='absolute -left-3 w-6 h-6 rounded-[50%] bg-gray-200 flex justify-center items-center text-black '>
          <p className='text-xs'>{clase.id}</p>
        </span>
        <div className='py-2 px-4 box-border border-b border-[#40587c] h-16 w-full flex items-center min-w-[200px] overflow-hidden text-gray-400'>
          <p className='text-sm'>{clase.name}</p>
        </div>
      </div>
    </div>
  );
};

export default ClassBanner;
