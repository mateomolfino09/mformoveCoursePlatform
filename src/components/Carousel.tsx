import { CoursesContext } from '../hooks/coursesContext';
import { loadCourse } from '../redux/courseModal/courseModalAction';
import { CourseModal } from '../redux/courseModal/courseModalTypes';
import { State } from '../redux/reducers';
import { Courses, CoursesDB, Item, Ricks, User } from '../../typings';
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
import { useSelector } from 'react-redux';

interface Props {
  title: string | null;
  coursesDB: CoursesDB[] | null;
  setSelectedCourse: Dispatch<SetStateAction<CoursesDB | null>> | null;
  items: Item[] | null;
  courseDB: CoursesDB | null;
  actualCourseIndex: number;
  setRef: any;
  isClass: boolean;
  user: User | null;
  courseIndex: number;
}

function Carousel({
  title,
  coursesDB,
  setSelectedCourse,
  items,
  courseDB,
  actualCourseIndex,
  setRef,
  isClass,
  user,
  courseIndex
}: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const scrollRowRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);
  const course: CourseModal = useSelector(
    (state: State) => state.courseModalReducer
  );
  const { courses, setCourses } = useContext(CoursesContext);
  const theWidth = rowRef.current?.scrollWidth
    ? -(rowRef.current?.scrollWidth - rowRef.current?.offsetWidth)
    : 0;
  const [width, setWidth] = useState<number>(theWidth);
  const [isOpen, setIsOpen] = useState<number>(0);

  useEffect(() => {}, [isOpen, width]);

  useEffect(() => {
    if (rowRef !== null && setRef !== null) {
      setRef(rowRef);
    }
    setWidth(
      rowRef.current?.scrollWidth
        ? -(rowRef.current?.scrollWidth - rowRef.current?.offsetWidth)
        : 0
    );
  }, [coursesDB]);

  const handleClick = (direction: string) => {
    setIsMoved(true);

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
      className={`group carousel w-full bg-dark ${
        title === 'Mis Cursos' && 'mb-0 pb-32'
      } relative`}
      ref={rowRef}
    >
      <h2 className='w-56 ml-4 relative cursor-pointer text-lg font-normal text-[#E5E5E5] transition duration-200 hover:text-white md:text-2xl mb-4'>
        {title}
      </h2>
      <ChevronLeftIcon
        className={`absolute left-2 z-[250] h-9 ${
          title === 'Mis Cursos' ? 'bottom-64' : 'bottom-32'
        }  md:hidden opacity-0 transition hover:scale-125 group-hover:opacity-100 ${
          coursesDB?.length && coursesDB?.length == 0 ? 'hidden' : ''
        }`}
        onClick={() => handleClick('left')}
      />

      <m.div
        className='inner-carousel overflow-y-hidden scrollbar-hide overflow-x-scroll relative'
        ref={scrollRowRef}
      >
        {coursesDB?.map((course: CoursesDB, index) => (
          <React.Fragment key={index}>
            <CarouselThumbnail
              key={course?._id}
              course={course}
              setSelectedCourse={setSelectedCourse}
              user={user}
              courseIndex={course.id - 1}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            />
          </React.Fragment>
        ))}
      </m.div>
      <ChevronRightIcon
        className={`absolute right-0 z-[250] h-9 ${
          title === 'Mis Cursos' ? 'bottom-64' : 'bottom-32'
        } md:hidden transition hover:scale-125 ${
          coursesDB?.length && coursesDB?.length < 1 ? 'hidden' : ''
        }`}
        onClick={() => handleClick('right')}
      />
    </m.div>
  );
}

export default Carousel;
