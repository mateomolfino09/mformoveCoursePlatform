import { CoursesContext } from '../hooks/coursesContext';
import { ClassesDB, CoursesDB } from '../typings';
import ClassBanner from './ClassBanner';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FlagIcon
} from '@heroicons/react/24/solid';
import { motion as m, useAnimation } from 'framer-motion';
import { useRouter } from 'next/router';
import React, { Ref, forwardRef, useContext, useEffect, useState } from 'react';

interface Props {
  courseDB: CoursesDB;
  showNav: any;
  clase: ClassesDB;
  setShowNav: any;
}

const ClassBannerSideBar = forwardRef<HTMLInputElement, Props>(
  ({ courseDB, showNav, clase, setShowNav }: Props, ref) => {
    const [module, setModule] = useState(false);
    const { courses, setCourses } = useContext(CoursesContext);
    const router = useRouter();
    const animation = useAnimation();

    const handleRouteChange = (clas: ClassesDB) => {
      router.push(`/src/courses/${courseDB.id}/${clas.id}`);
    };

    useEffect(() => {
      if (showNav) {
        animation.start({
          opacity: 100,
          transition: {
            delay: 0,
            ease: 'linear',
            duration: 0,
            stiffness: 0
          }
        });
      } else {
        animation.start({
          opacity: 0,
          transition: {
            delay: 0,
            ease: 'linear',
            duration: 0,
            stiffness: 0
          }
        });
      }
    }, [showNav]);

    return (
      <div
        className='flex flex-col bg-dark-soft fixed md:h-[92vh] overflow-y-scroll md:top-16 pl-1 lg:top-20 left-0 z-[1500] !scrollbar-track-transparent !scrollbar-thumb-[#c2c9d2] !scrollbar-thin tracking-normal !overflow-scroll'
        ref={ref}
      >
        {courseDB.classes.map((clas: ClassesDB) => (
          <div className='flex flex-col bg-dark-soft' key={clas.id}>
            {courseDB.modules.breakPoints.includes(clas.id) && (
              <>
                {clas.id === 1 && (
                  <div className='flex items-center font-bold text-base'>
                    <div
                      className='hidden md:flex lg:-top-0 h-12 w-12  md:left-0  z-[200] justify-center items-center'
                      onClick={() => setShowNav(!showNav)}
                    >
                      <ChevronLeftIcon className='w-8 text-gray-300/95' />
                    </div>
                    <div className='w-80 bg-dark flex items-center font-bold text-base h-full relative ml-4 bg-dark-soft'>
                      <div className='py-2 px-4 box-border flex items-center h-16 w-full overflow-hidden text-white'>
                        <p>{courseDB.name}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div
                  className={`w-80 bg-dark flex items-center font-bold text-base h-full relative ml-4 bg-dark-soft pl-5 border-l-2 ${
                    clas.id <= clase.id ? 'border-[#edc279]' : 'border-white'
                  }`}
                >
                  <span
                    className={`absolute -left-3 w-6 h-6 px-1 rounded-[50%] bg-dark-soft flex justify-center items-center  ${
                      clas.id <= clase.id ? 'text-[#edc279]' : 'text-white'
                    }`}
                  >
                    <FlagIcon />
                  </span>
                  <div
                    className={`py-2 px-4 box-border border-b border-white flex items-center h-16 w-full overflow-hidden text-white`}
                  >
                    <p>
                      {
                        courseDB.modules.titles[
                          courseDB.modules.breakPoints.indexOf(clas.id)
                        ]
                      }
                    </p>
                  </div>
                </div>
              </>
            )}
            <div
              className={`w-80 bg-dark flex items-center font-bold text-base h-full relative left-4 bg-dark-soft pl-5 ${
                clas.id !== courseDB.classes.length
                  ? 'border-l-2'
                  : 'border-l-0 before:absolute before:top-0 before:left-0 before:h-1/2 before:border-l-[2px] before:border-white'
              } ${clas.id <= clase.id ? 'border-[#edc279]' : 'border-white'}`}
              onClick={() => handleRouteChange(clas)}
            >
              <m.span
                initial={{ opacity: 0 }}
                animate={animation}
                className={`absolute -left-3 w-6 h-6 rounded-[50%]  flex justify-center items-center text-black ${
                  clas.id <= clase.id ? 'bg-[#edc279]' : 'bg-gray-200'
                }`}
              >
                <p className='text-xs'>{clas.id}</p>
              </m.span>
              <div className='py-2 px-4 box-border border-b border-[#9a9a9a] h-16 w-full flex items-center overflow-hidden text-gray-400'>
                <p className='text-sm'>{clas.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

export default ClassBannerSideBar;
