import { IndividualClass, Item, Ricks, User } from '../../typings';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
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
import { BsExclamationCircle } from "react-icons/bs";
import { useRouter } from 'next/navigation';

interface Props {
  title: string | null | undefined;
  classesDB: IndividualClass[] | null;
  setSelectedClass: any
  description: string | undefined
  key: number
}

function CarouselClasses({
  title,
  classesDB,
  setSelectedClass,
  description,
  key
}: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const scrollRowRef = useRef<HTMLDivElement>(null);
  const theWidth = rowRef.current?.scrollWidth
    ? -(rowRef.current?.scrollWidth - rowRef.current?.offsetWidth)
    : 0;
  const [width, setWidth] = useState<number>(theWidth);
  const [isOpen, setIsOpen] = useState<number>(0);
  const [showHelper, setShowHelper] = useState<boolean>(false);
  const auth = useAuth()
  const targetRef = useRef<any>(null);

  const router = useRouter()
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
      className={`group carousel mt-8 md:mt-12 px-3 sm:px-6 md:px-9 w-full relative ${filtersSelector.classType !== 'all' && classesDB && filtersSelector.classType !== classesDB[0].type.toLowerCase() && 'hidden' }`}
      ref={rowRef}
    >
      <div className={`${title == "Publicadas Recientemente" ? "mb-4 md:mb-2" : ""} flex md:justify-between flex-col md:flex-row items-start md:items-center w-full`}>
        <div className='flex justify-start items-center w-full' style={{ flex: '1 0 21%'}}>
          <h2 className='ml-2 md:ml-4 relative text-xl sm:text-2xl font-extrabold text-[#E5E5E5] transition duration-200 font-montserrat hover:text-white lg:text-2xl md:mb-4 -mb-3'>
            {title}
          </h2>
        <div className='flex relative ml-2 mb-5 justify-center items-center w-auto'>
          <button
            type="button"
            aria-label="Información"
            onClick={() => setShowHelper(!showHelper)}
            onMouseEnter={() => setShowHelper(true)}
            onMouseLeave={() => setShowHelper(false)}
            className="p-1 text-white/80 hover:text-white transition"
          >
            <BsExclamationCircle className='w-4 md:w-6 lg:w-7' />
          </button>
          <div
            className={`absolute left-0 sm:left-10 top-full mt-2 w-[240px] max-w-[80vw] z-[120] rounded-2xl bg-black/85 text-white border border-white/15 shadow-xl backdrop-blur px-3 py-2 text-xs sm:text-sm font-light transition-all duration-200 ${
              showHelper ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
            }`}
          >
            <div className="absolute -top-2 left-6 sm:left-4 h-3 w-3 rotate-45 bg-black/85 border-l border-t border-white/15"></div>
            <p className='break-words whitespace-normal'>{description}</p>
          </div>
        </div>

        </div>
        <div className={`flex ml-2 md:ml-4 md:ml-0 mb-5 relative font-light text-xs md:text-sm group ${title == "Publicadas Recientemente" ? 'hidden' : ""}`} onClick={() => router.push(`/classes-category/${title?.toLowerCase()}`)}>
          <p className='relative before:content-[""] before:md:bg-yellow-400/80 before:h-[1px] before:absolute before:w-full before:bottom-[-3px] before:left-0 before:bg-yellow-400/80'>Todas las clases de {title} </p>
          <ArrowRightIcon className='w-4 ml-2 group-hover:translate-x-1 transition-all duration-500'/>
        </div>
      </div>
      <ChevronLeftIcon
        className={`hidden md:block absolute left-2 z-[110] h-9 ${
          title === 'Mis Cursos' ? 'bottom-64' : 'bottom-32'
        } opacity-0 transition hover:scale-125 group-hover:opacity-100 ${
          classesDB?.length && classesDB?.length == 0 ? 'hidden' : ''
        }`}
        onClick={() => handleClick('left')}
      />

      {/* Mobile: Grid Layout */}
      <div className='md:hidden grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-5 auto-rows-fr'>
        {classesDB?.map((c: IndividualClass, index) => (
          <React.Fragment key={index}>
            <div className='flex min-h-0 w-full'>
              <div className='w-full flex flex-col'>
                <CarouselClassesThumbnail c={c} isNew={title == "Publicadas Recientemente" && index < 2}/>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Desktop: Carousel Layout */}
      <m.div
        className='hidden md:block inner-carousel overflow-y-hidden scrollbar-hide overflow-x-scroll relative'
        ref={scrollRowRef}
      >
        <div className='flex gap-6 px-2 items-stretch'>
          {classesDB?.map((c: IndividualClass, index) => (
            <React.Fragment key={index}>
              <div className='flex-shrink-0 w-[320px] flex'>
                <div className='w-full flex flex-col'>
                  <CarouselClassesThumbnail c={c} isNew={title == "Publicadas Recientemente" && index < 2}/>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </m.div>
      <ChevronRightIcon
        className={`hidden md:block absolute right-0 z-[110]  h-9 ${
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
