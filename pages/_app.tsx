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
import { ClassContext } from '../hooks/classContext';


function App({ Component, ...rest }: AppProps) {
  const [listCourse, setListCourse] = useState<CoursesDB[]>([])

  const providerValue = useMemo(() => ({listCourse, setListCourse}), [listCourse, setListCourse])

  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps } = props;
  const key = process.env.NEXT_PUBLIC_RECAPTHA_SITE_KEY ? process.env.NEXT_PUBLIC_RECAPTHA_SITE_KEY : ''
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
