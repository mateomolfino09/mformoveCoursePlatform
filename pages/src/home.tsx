import Banner from '../../components/Banner'
import Carousel from '../../components/Carousel'
import Header from '../../components/Header'
import Modal from '../../components/Modal'
import Row from '../../components/Row'
import SearchBar from '../../components/SearchBar'
import { CourseListContext } from '../../hooks/courseListContext'
import { CoursesContext } from '../../hooks/coursesContext'
import { UserContext } from '../../hooks/userContext'
import { CourseModal } from '../../redux/courseModal/courseModalTypes'
import { State } from '../../redux/reducers'
import { wrapper } from '../../redux/store'
import {
  CourseUser,
  Courses,
  CoursesDB,
  Images,
  Ricks,
  User
} from '../../typings'
import requests from '../../utils/requests'
import state from '../../valtio'
import { getCourses } from '../api/course/getCourses'
import { getUserFromBack } from '../api/user/getUserFromBack'
import { listClasses } from '@mui/material'
import { GetServerSideProps } from 'next'
import { Session } from 'next-auth'
import { getSession, useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { parseCookies } from 'nookies'
import { RefObject, useContext, useEffect, useRef, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { snapshot, useSnapshot } from 'valtio'

interface Props {
  randomImage: Images
  session: Session
  coursesDB: CoursesDB[]
  user: User
}

const Home = ({ user, randomImage, coursesDB }: Props) => {
  const [selectedCourse, setSelectedCourse] = useState<CoursesDB | null>(null)
  const [myCourses, setMyCourses] = useState<CoursesDB[]>([])
  const [nuevoCourses, setNuevoCourses] = useState<CoursesDB[]>([])
  const [refToList, setRefToList] = useState<RefObject<HTMLDivElement> | null>(
    null
  )
  const [refToMy, setRefToMy] = useState<RefObject<HTMLDivElement> | null>(null)
  const [refToModa, setRefToModa] = useState<RefObject<HTMLDivElement> | null>(
    null
  )
  const [refToNuevo, setRefToNuevo] =
    useState<RefObject<HTMLDivElement> | null>(null)
  const { listCourse, setListCourse } = useContext(CourseListContext)
  const { courses, setCourses } = useContext(CoursesContext)
  const { userCtx, setUserCtx } = useContext(UserContext)
  const [userDB, setUserDB] = useState<User | null>(null)
  const snap = useSnapshot(state)

  useEffect(() => {
    setCourses([...coursesDB])
    setUserCtx(user)
  }, [])

  const course: CourseModal = useSelector(
    (state: State) => state.courseModalReducer
  )
  let { loading, error, activeModal, dbCourse, youtubeVideo } = course
  const cookies = parseCookies()
  const { data: session } = useSession()
  const router = useRouter()

  function scrollToList() {
    if (refToList?.current && window) {
      const yOffset = -90
      const y =
        refToList?.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset

      window.scrollTo({ top: y, behavior: 'smooth' })
      return
      // return refToModa?.current.scrollIntoView({behavior: 'smooth'})
    }
  }

  function scrollToMy() {
    if (refToMy?.current && window) {
      const yOffset = -90
      const y =
        refToMy?.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset

      window.scrollTo({ top: y, behavior: 'smooth' })
      return
      // return refToModa?.current.scrollIntoView({behavior: 'smooth'})
    }
  }

  function scrollToNuevo() {
    if (refToNuevo?.current && window) {
      const yOffset = -90
      const y =
        refToNuevo?.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset

      window.scrollTo({ top: y, behavior: 'smooth' })
      return
      // return refToModa?.current.scrollIntoView({behavior: 'smooth'})
    }
  }

  function scrollToModa() {
    if (refToModa?.current && window) {
      const yOffset = -90
      const y =
        refToModa?.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset

      window.scrollTo({ top: y, behavior: 'smooth' })
      return
      // return refToModa?.current.scrollIntoView({behavior: 'smooth'})
    }
  }

  function setRefToListSend(ref: RefObject<HTMLDivElement>) {
    setRefToList(ref)
  }
  function setRefMySend(ref: RefObject<HTMLDivElement>) {
    setRefToMy(ref)
  }

  function setRefToNuevoSend(ref: RefObject<HTMLDivElement>) {
    setRefToNuevo(ref)
  }

  function setRefToModaSend(ref: RefObject<HTMLDivElement>) {
    setRefToModa(ref)
  }

  function updateUserDB(user: User) {
    setUserDB(user)
  }

  useEffect(() => {
    if (!user) {
      router.push('/src/user/login')
    } else {
      const quantity = Math.round(coursesDB.length / 3)
      const dateCourses = [...coursesDB]
      setNuevoCourses(
        dateCourses
          .sort((a, b) =>
            new Date(
              Date.parse(b.udpatedAt) - Date.parse(a.udpatedAt)
            ).getTime()
          )
          .splice(-quantity)
      )

      const manageUser = () => {
        let listToSet: CoursesDB[] = []
        let mycourselistToSet: CoursesDB[] = []

        user.courses.forEach((course: CourseUser) => {
          let courseInCourseIndex = coursesDB.findIndex((x) => {
            return x._id === course.course
          })

          const arrCopy = [...listToSet]
          const myCopy = [...mycourselistToSet]

          if (course.purchased) {
            let hasCourse =
              myCopy.filter((x, i) => x.id == coursesDB[courseInCourseIndex].id)
                .length != 0
            if (
              !mycourselistToSet.includes(coursesDB[courseInCourseIndex]) &&
              !hasCourse
            ) {
              mycourselistToSet.push(coursesDB[courseInCourseIndex])
            }
          } else {
            if (myCourses.includes(coursesDB[courseInCourseIndex])) {
              setMyCourses(
                myCourses.filter((value) => value._id != course.course)
              )
            }
          }

          if (course.inList) {
            let hasCourse =
              arrCopy.filter(
                (x, i) => x.id == coursesDB[courseInCourseIndex].id
              ).length != 0
            if (
              !listToSet.includes(coursesDB[courseInCourseIndex]) &&
              !hasCourse
            ) {
              listToSet.push(coursesDB[courseInCourseIndex])
            }
          }
        })

        setListCourse([...listToSet])
        setMyCourses([...mycourselistToSet])
      }
      manageUser()
    }
  }, [router, session])

  return (
    <div className='relative h-full bg-to-dark lg:h-full'>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Header
        scrollToList={scrollToList}
        scrollToModa={scrollToModa}
        scrollToNuevo={scrollToNuevo}
        scrollToMy={scrollToMy}
        dbUser={user}
      />
      {snap.searchToggle ? (
        <></>
      ) : (
        <main className='relative lg:space-y-24'>
          <Banner randomImage={randomImage} scrollToModa={scrollToModa} />
          <section className='!mt-0 bg-dark'>
            <Carousel
              title='Todos Los Cursos'
              coursesDB={courses}
              setSelectedCourse={setSelectedCourse}
              items={null}
              courseDB={null}
              actualCourseIndex={0}
              setRef={setRefToModaSend}
              isClass={false}
              user={user}
              courseIndex={0}
            />
            <Carousel
              title={'Nuevo'}
              coursesDB={nuevoCourses}
              setSelectedCourse={setSelectedCourse}
              items={null}
              courseDB={null}
              actualCourseIndex={0}
              setRef={setRefToNuevoSend}
              isClass={false}
              user={user}
              courseIndex={0}
            />
            <Carousel
              title={'Mi Lista'}
              coursesDB={listCourse}
              setSelectedCourse={setSelectedCourse}
              items={null}
              courseDB={null}
              actualCourseIndex={0}
              setRef={setRefToListSend}
              isClass={false}
              user={user}
              courseIndex={0}
            />
            <Carousel
              title={'Mis Cursos'}
              coursesDB={myCourses}
              setSelectedCourse={setSelectedCourse}
              items={null}
              courseDB={null}
              actualCourseIndex={0}
              setRef={setRefMySend}
              isClass={false}
              user={user}
              courseIndex={0}
            />
          </section>
        </main>
      )}
      <Toaster />
      {snap.searchToggle && <SearchBar setSelectedCourse={setSelectedCourse} />}
      {activeModal && (
        <Modal
          courseDB={selectedCourse}
          user={user}
          updateUserDB={updateUserDB}
        />
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps =
  wrapper.getServerSideProps((store) => async (ctx) => {
    const { req } = ctx
    const session = await getSession({ req })
    const coursesDB: any = await getCourses()
    // Get a cookie
    const cookies = parseCookies(ctx)
    const userCookie = cookies?.user ? JSON.parse(cookies.user) : session?.user
    const email = userCookie?.email
    let user = null
    if (email != null) user = await getUserFromBack(email)

    return {
      props: {
        coursesDB,
        user
      }
    }
  })

export default Home
