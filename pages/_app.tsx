import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { CourseListContext } from '../hooks/courseListContext'
import { CoursesContext } from '../hooks/coursesContext'
import { UserContext } from '../hooks/userContext'
import { wrapper } from '../redux/store'
import { CoursesDB, User } from '../typings'
import { useMemo, useRef, useState } from 'react'
import { Provider } from 'react-redux'

function App({ Component, ...rest }: AppProps) {
  const [listCourse, setListCourse] = useState<CoursesDB[]>([])
  const [courses, setCourses] = useState<CoursesDB[]>([])
  const [userCtx, setUserCtx] = useState<User | null>(null)

  const providerValue = useMemo(
    () => ({ listCourse, setListCourse }),
    [listCourse, setListCourse]
  )
  const coursesProviderValue = useMemo(
    () => ({ courses, setCourses }),
    [courses, setCourses]
  )
  const userProviderValue = useMemo(
    () => ({ userCtx, setUserCtx }),
    [userCtx, setUserCtx]
  )

  const { store, props } = wrapper.useWrappedStore(rest)
  const { pageProps } = props
  const key = process.env.NEXT_PUBLIC_RECAPTHA_SITE_KEY
    ? process.env.NEXT_PUBLIC_RECAPTHA_SITE_KEY
    : ''
  return (
    <main>
      <SessionProvider session={pageProps.session}>
        <Provider store={store}>
          <CourseListContext.Provider value={providerValue}>
            <CoursesContext.Provider value={coursesProviderValue}>
              <UserContext.Provider value={userProviderValue}>
                <NextNProgress color='#c2c9d2' />
                <ToastContainer />
                <Component {...pageProps} />
              </UserContext.Provider>
            </CoursesContext.Provider>
          </CourseListContext.Provider>
        </Provider>
      </SessionProvider>
    </main>
  )
}

export default App
