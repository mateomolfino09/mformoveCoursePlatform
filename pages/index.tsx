import { GetServerSideProps } from 'next'
import Header from '../components/Header'
import Banner from '../components/Banner'
import requests from '../utils/requests'
import { Courses, CoursesDB, CourseUser, Images, Ricks, User } from '../typings'
import Row from '../components/Row'
import { getSession, useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { parseCookies } from 'nookies'
import { useRouter } from 'next/router'
import { RefObject, useContext, useEffect, useRef, useState } from 'react'
import { wrapper } from '../redux/store'
import { useSelector } from 'react-redux'
import Modal from '../components/Modal'
import { CourseModal } from '../redux/courseModal/courseModalTypes'
import { State } from '../redux/reducers'
import { getCourses } from './api/course/getCourses'
import axios from "axios"
import Head from 'next/head'
import { listClasses } from '@mui/material'
import { CourseListContext } from '../hooks/courseListContext'

interface Props {
  randomImage: Images
  rickAndMorty: Ricks[]
  session: Session,
  courses: CoursesDB[]
  userDB: User
}


const Home = ({ randomImage, rickAndMorty, courses
 } : Props) => {
  const [selectedCourse, setSelectedCourse] = useState<CoursesDB | null>(null)  
  const [myCourses, setMyCourses] = useState<CoursesDB[]>([])  
  const [nuevoCourses, setNuevoCourses] = useState<CoursesDB[]>([])  
  const [refToList, setRefToList] = useState<RefObject<HTMLDivElement> | null>(null);
  const [refToMy, setRefToMy] = useState<RefObject<HTMLDivElement> | null>(null);
  const [refToModa, setRefToModa] = useState<RefObject<HTMLDivElement> | null>(null);
  const [refToNuevo, setRefToNuevo] = useState<RefObject<HTMLDivElement> | null>(null);
  const {listCourse, setListCourse} = useContext( CourseListContext )


  const [userDB, setUserDB] = useState<User | null>(null)  

  const course: CourseModal = useSelector((state: State) => state.courseModalReducer)
  let { loading, error, activeModal, dbCourse, youtubeVideo  } = course
  const cookies = parseCookies()
  const {data: session} = useSession() 
  const router = useRouter()

  let user = cookies?.user ? JSON.parse(cookies.user): session?.user ? session.user : ''

  function scrollToList() {
    if(refToList?.current) {
      return refToList?.current.scrollIntoView({behavior: 'smooth'})
    }
  }

  function scrollToMy() {
    if(refToMy?.current) {
      return refToMy?.current.scrollIntoView({behavior: 'smooth'})
    }
  }

  function scrollToNuevo() {
    if(refToNuevo?.current) {
      return refToNuevo?.current.scrollIntoView({behavior: 'smooth'})
    }
  }

  function scrollToModa() {
    if(refToModa?.current) {
      return refToModa?.current.scrollIntoView({behavior: 'smooth'})
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
    if (user === '') {
      router.push("/src/user/login")
    }
    const quantity = Math.round(courses.length / 3) 
    const dateCourses = [...courses]
    setNuevoCourses(dateCourses.sort((a, b) =>
    new Date(Date.parse(b.udpatedAt) - Date.parse(a.udpatedAt)).getTime()
  ).splice(-quantity))

    const getUserDB = async () => {
      try {
        const config = {
            headers: {
              "Content-Type": "application/json",
            },
          }
        const email = user.email
        const { data } = await axios.post('/api/user/getUser', { email }, config)
        !userDB ? setUserDB(data) : null

       let listToSet: CoursesDB[] = []

        data.courses.forEach((course: CourseUser) => {
          let courseInCourseIndex = courses.findIndex((x) => {
            return  x._id === course.course
          })

          const arrCopy = [...listToSet]
          const myCopy = [...myCourses]

          if(course.purchased) {
            let hasCourse = myCopy.filter((x, i) => x.id == courses[courseInCourseIndex].id).length != 0
            if(!myCourses.includes(courses[courseInCourseIndex]) && !hasCourse) {
              setMyCourses([...myCourses, courses[courseInCourseIndex]])
            } 
          }
          else {
            if(myCourses.includes(courses[courseInCourseIndex])) {
              setMyCourses(myCourses.filter((value) => value._id != course.course))
            }
          }

          if(course.inList) {
            let hasCourse = arrCopy.filter((x, i) => x.id == courses[courseInCourseIndex].id).length != 0
            if(!listToSet.includes(courses[courseInCourseIndex]) && !hasCourse) {
              listToSet.push(courses[courseInCourseIndex])
            }
          }
        })

        setListCourse([...listToSet])

      } catch (error: any) {
          console.log(error.message)
      }
  }
  getUserDB()
  // setListCourses(listCourses.filter((item, index) => listCourses.indexOf(item) === index))


  }, [router, session])



  
  return (
    <div className="relative h-screen bg-gradient-to-b lg:h-[140vh]">
      <Head>
        <title>Video Streaming</title>
        <meta name="description" content="Stream Video App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header scrollToList={scrollToList} scrollToModa={scrollToModa} scrollToNuevo={scrollToNuevo} scrollToMy={scrollToMy}/>

      <main className='relative pl-4 pb-24 lg:space-y-24 lg:pl-16'>
        <Banner randomImage={randomImage}/>
        <section className='md:space-y-24 mt-48 md:mt-24 lg:mt-0'>
          <Row title="Todos Los Cursos" courses={courses} setSelectedCourse={setSelectedCourse} items={null} courseDB={null} actualCourseIndex={0} setRef={setRefToModaSend} isClass={false}/>
          <Row title={"Nuevo"} courses={nuevoCourses} setSelectedCourse={setSelectedCourse} items={null} courseDB={null} actualCourseIndex={0} setRef={setRefToNuevoSend} isClass={false}/>
          <Row title={"Mi Lista"} courses={listCourse} setSelectedCourse={setSelectedCourse} items={null} courseDB={null} actualCourseIndex={0} setRef={setRefToListSend} isClass={false}/>
          <Row title={"Mis Cursos"} courses={myCourses} setSelectedCourse={setSelectedCourse} items={null} courseDB={null} actualCourseIndex={0} setRef={setRefMySend} isClass={false}/>
        </section>
      </main>

      {activeModal && <Modal courseDB={selectedCourse} user={userDB} updateUserDB={updateUserDB}/>}
    </div>
 )
}

export const getServerSideProps: GetServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req }) => {
      const cookies = parseCookies()
      const session = await getSession({ req })
      const [
        randomImage,
        rickAndMorty,
      ] = await Promise.all([
        fetch(requests.fetchRandomImages).then((res) => res.json()),
        fetch(requests.fetchRickAndmort).then((res) => res.json()),
      ])

      const courses: any = await getCourses()

      const user: User = cookies?.user ? JSON.parse(cookies.user) : session?.user


      return {
        props: {
          randomImage: randomImage,
          rickAndMorty : rickAndMorty.results ,
          courses,
      }
    }
  }
)

export default Home;


