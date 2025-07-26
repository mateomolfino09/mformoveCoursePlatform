import { IndividualClass, Item, Ricks, User } from '../../typings';
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
import { useAuth } from '../hooks/useAuth';
import { useAppSelector } from '../redux/hooks';
import CarouselClassesThumbnail from './CarouselClassesThumbnail';
import CarouselSearchClassesThumbnail from './CarouselSearchClassesThumbnail';

interface Props {
  title: string | null | undefined;
  classesDB: IndividualClass[] | null;
  setSelectedClass: any
  description: string | undefined
}

function CarouselSearchClasses({
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
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;

      scrollRowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };
  
  return (
    <m.div
      className={`group carousel mt-12 px-9 w-full relative h-full ${filtersSelector.classType !== 'all' && classesDB && filtersSelector.classType !== classesDB[0].type.toLowerCase() && 'hidden' }`}
      ref={rowRef}
    >
      <h2 className='w-56 ml-4 relative text-2xl font-normal text-[#E5E5E5] transition duration-200 hover:text-white lg:text-2xl mb-4'>
        {title}
      </h2>
      <m.div
        className='flex flex-row flex-wrap justify-center md:justify-start overflow-y-hidden scrollbar-hide overflow-x-scroll relative mb-12'
        ref={scrollRowRef}
      >
        {classesDB?.map((c: IndividualClass, index) => (
          <React.Fragment key={index}>
            <CarouselSearchClassesThumbnail c={c}/>
          </React.Fragment>
        ))}
        {classesDB?.length === 0 && (
          <>Clases pronto...</>
        )}
      </m.div>
    </m.div>
  );
}

export default CarouselSearchClasses;
