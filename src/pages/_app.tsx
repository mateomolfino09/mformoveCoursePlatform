import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import NextNProgress from 'nextjs-progressbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CourseListContext } from '../hooks/courseListContext';
import { CoursesContext } from '../hooks/coursesContext';
import { UserContext } from '../hooks/userContext';
import { CoursesDB, User } from '../../typings';
import { useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { ProviderAuth } from '../hooks/useAuth';
import Providers from '../redux/providers';

function App({ Component, pageProps }: AppProps) {
  const [listCourse, setListCourse] = useState<CoursesDB[]>([]);
  const [courses, setCourses] = useState<CoursesDB[]>([]);

  const providerValue = useMemo(
    () => ({ listCourse, setListCourse }),
    [listCourse, setListCourse]
  );
  const coursesProviderValue = useMemo(
    () => ({ courses, setCourses }),
    [courses, setCourses]
  );
  return (
    <main>
      <ProviderAuth>
          <Providers>
            <CourseListContext.Provider value={providerValue}>
              <CoursesContext.Provider value={coursesProviderValue}>
                  <NextNProgress color='#c2c9d2' />
                  <ToastContainer />
                  <Component {...pageProps} />
              </CoursesContext.Provider>
            </CourseListContext.Provider>
          </Providers>
      </ProviderAuth>
    </main>
  );
}

export default App;
