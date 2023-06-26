import { CoursesContext } from '../hooks/coursesContext';
import { UserContext } from '../hooks/userContext';
import { CoursesDB } from '../../typings';
import state from '../valtio';
import Carousel from './Carousel';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import React, { useContext, useEffect, useState } from 'react';
import { snapshot, useSnapshot } from 'valtio';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

interface Props {
  setSelectedCourse: any;
}

const SearchBar = ({ setSelectedCourse }: Props) => {
  const snap = useSnapshot(state);
  const { courses, setCourses } = useContext(CoursesContext);
  const [coursesSearch, setCoursesSearch] = useState<CoursesDB[]>(courses);
  const animation = useAnimation();
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (snap.searchInput != '') {
      const coursestToSearch = courses.filter((c: CoursesDB) =>
        c.name.toLowerCase().includes(snap.searchInput.toLowerCase())
      );
      setCoursesSearch(coursestToSearch);
    } else {
      setCoursesSearch(courses);
    }
  }, [snap.searchInput]);


  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/src/user/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }

  }, [auth.user]);

  useEffect(() => {
    animation.start({
      opacity: 1,
      transition: {
        delay: 0.05,
        ease: 'linear',
        duration: 0.5,
        stiffness: 0
      }
    });
  }, [snap.searchToggle]);

  useEffect(() => {}, [coursesSearch]);

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={animation}
        exit={{ opacity: 0 }}
        className='absolute bg-dark w-full h-screen top-0'
      >
        <main
          className={`relative ${
            coursesSearch.length != 0 ? 'mt-32' : 'mt-0'
          } `}
        >
          {coursesSearch.length != 0 ? (
            <section className='!mt-0 bg-dark'>
              <Carousel
                title='Tu Búsqueda'
                coursesDB={coursesSearch}
                setSelectedCourse={setSelectedCourse}
                items={null}
                courseDB={null}
                actualCourseIndex={0}
                setRef={null}
                isClass={false}
                user={auth.user}
                courseIndex={0}
              />
            </section>
          ) : (
            <div className='h-screen w-full flex justify-center items-center '>
              <div className='w-full h-12 flex justify-center items-center flex-col'>
                <p className='text-sm font-light text-start'>
                  No pudimos encontrar la búsqueda {snap.searchInput}
                </p>

                <ul>
                  <li />
                </ul>
              </div>
            </div>
          )}
        </main>
      </m.div>
    </AnimatePresence>
  );
};

export default SearchBar;
