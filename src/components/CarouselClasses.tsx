import { loadCourse, closeCourse } from '../redux/features/courseModalSlice'; 
import { Courses, CoursesDB, IndividualClass, Item, Ricks, User } from '../../typings';
import CarouselThumbnail from './CarouselThumbnail';
import CourseThumbnail from './CourseThumbnail';
import Thumbnail from './Thumbnail';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion as m } from 'framer-motion';
import Link from 'next/link';
import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { useGlobalContext } from '../app/context/store';
import { useAuth } from '../hooks/useAuth';
import { useAppSelector } from '../redux/hooks';
import CarouselClassesThumbnail from './CarouselClassesThumbnail';

interface Props {
  title: string | null | undefined;
  classesDB: IndividualClass[] | null;
  setSelectedClass: any
  description: string | undefined
}

function CarouselClasses({
  title,
  classesDB,
  setSelectedClass,
  description
}: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const scrollRowRef = useRef<HTMLDivElement>(null);
  const theWidth = rowRef.current?.scrollWidth
    ? -(rowRef.current?.scrollWidth - rowRef.current?.offsetWidth)
    : 0;
  const [width, setWidth] = useState<number>(theWidth);
  const [isOpen, setIsOpen] = useState<number>(0);
  const auth = useAuth()
  const filtersSelector = useAppSelector(
    (state) => state.filterClass.value
    );
  useEffect(() => {}, [isOpen, width]);

  useEffect(() => {
    setWidth(
      rowRef.current?.scrollWidth
        ? -(rowRef.current?.scrollWidth - rowRef.current?.offsetWidth)
        : 0
    );
  }, [classesDB]);

  const handleClick = (direction: string) => {

    if (scrollRowRef.current) {
      const { scrollLeft, clientWidth } = scrollRowRef.current;
      console.log(scrollLeft, clientWidth);

      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;

      scrollRowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };
  
  return (
    <m.div
      className={`group carousel px-9 w-full relative ${filtersSelector.classType !== 'all' && classesDB && filtersSelector.classType !== classesDB[0].type.toLowerCase() && 'hidden' }`}
      ref={rowRef}
    >
      <h2 className='w-56 ml-4 relative text-2xl font-normal text-[#E5E5E5] transition duration-200 hover:text-white lg:text-2xl mb-4'>
        {title}
      </h2>
      <ChevronLeftIcon
        className={`absolute left-2 z-[250] h-9 ${
          title === 'Mis Cursos' ? 'bottom-64' : 'bottom-32'
        } opacity-0 transition hover:scale-125 group-hover:opacity-100 ${
          classesDB?.length && classesDB?.length == 0 ? 'hidden' : ''
        }`}
        onClick={() => handleClick('left')}
      />

      <m.div
        className='inner-carousel overflow-y-hidden scrollbar-hide overflow-x-scroll relative mb-12'
        ref={scrollRowRef}
      >
        {classesDB?.map((c: IndividualClass, index) => (
          <React.Fragment key={index}>
            <CarouselClassesThumbnail c={c} courseIndex={index} isOpen={isOpen} setIsOpen={setIsOpen} setSelectedClass={setSelectedClass}/>
          </React.Fragment>
        ))}
      </m.div>
      <ChevronRightIcon
        className={`absolute right-0 z-[250]  h-9 ${
          title === 'Mis Cursos' ? 'bottom-64' : 'bottom-32'
        } transition hover:scale-125 ${
            classesDB?.length && classesDB?.length < 1 ? 'hidden' : ''
        }`}
        onClick={() => handleClick('right')}
      />
    </m.div>
  );
}

export default CarouselClasses;
