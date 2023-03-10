import '../styles/globals.css'
import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import { SessionProvider } from 'next-auth/react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux'
import { wrapper }  from '../redux/store';
import { CourseListContext } from '../hooks/courseListContext';
import { useMemo, useRef, useState } from 'react';
import { CoursesDB } from '../typings';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';


function App({ Component, ...rest }: AppProps) {
  const queryClient = useRef(new QueryClient())
  const [listCourse, setListCourse] = useState<CoursesDB[]>([])

  const providerValue = useMemo(() => ({listCourse, setListCourse}), [listCourse, setListCourse])

  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps } = props;
  const key = process.env.NEXT_PUBLIC_RECAPTHA_SITE_KEY ? process.env.NEXT_PUBLIC_RECAPTHA_SITE_KEY : ''
  return (
    <SessionProvider session={pageProps.session}>
        <QueryClientProvider client={queryClient.current}>
          <Hydrate state={pageProps.dehydratedState}>
            <Provider store={store}>
            <CourseListContext.Provider value= {providerValue}>
              <NextNProgress color="red"/>
                <ToastContainer />
                <Component {...pageProps} />
            </CourseListContext.Provider>
            </Provider>
          </Hydrate>
        </QueryClientProvider>
     </SessionProvider>
  )
}

export default App
