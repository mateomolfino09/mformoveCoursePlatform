import '../styles/globals.css'
import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import { SessionProvider } from 'next-auth/react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux'
import { wrapper }  from '../redux/store';
import { CourseListContext } from '../hooks/courseListContext';
import { useMemo, useState } from 'react';
import { CoursesDB } from '../typings';

function App({ Component, ...rest }: AppProps) {
  const [listCourse, setListCourse] = useState<CoursesDB[]>([])
  const providerValue = useMemo(() => ({listCourse, setListCourse}), [listCourse, setListCourse])
  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps } = props;
  return (
      <SessionProvider session={pageProps.session}>
        <Provider store={store}>
        <CourseListContext.Provider value= {providerValue}>
          <NextNProgress color="red"/>
            <ToastContainer />
            <Component {...pageProps} />
        </CourseListContext.Provider>

        </Provider>

     </SessionProvider>
  )
}

export default App
