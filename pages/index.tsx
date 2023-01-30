import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Header from '../components/Header'
import Banner from '../components/Banner'
import requests from '../utils/requests'
import { Courses, CoursesDB, CourseUser, Images, Ricks, User } from '../typings'
import Row from '../components/Row'
import { getSession, useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import { parseCookies } from 'nookies'
import { useRouter } from 'next/router'
import { RefObject, useEffect, useRef, useState } from 'react'
import { wrapper } from '../redux/store'
import { useSelector } from 'react-redux'
import Modal from '../components/Modal'
import { CourseModal } from '../redux/courseModal/courseModalTypes'
import { State } from '../redux/reducers'
import { getCourses } from './api/course/getCourses'
import axios from 'axios'

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
  const [listCourses, setListCourses] = useState<CoursesDB[]>([])  
  const [myCourses, setMyCourses] = useState<CoursesDB[]>([])  
  const [nuevoCourses, setNuevoCourses] = useState<CoursesDB[]>([])  
  const [actualCourseIndex, setActualCourseIndex] = useState<Number>(0)  
  const [refToList, setRefToList] = useState<RefObject<HTMLDivElement> | null>(null);
  const [refToMy, setRefToMy] = useState<RefObject<HTMLDivElement> | null>(null);
  const [refToModa, setRefToModa] = useState<RefObject<HTMLDivElement> | null>(null);
  const [refToNuevo, setRefToNuevo] = useState<RefObject<HTMLDivElement> | null>(null);


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

  function setList(courseDB: CoursesDB, list: boolean) {
    if(!list && !listCourses.includes(courseDB)) {
      setListCourses([...listCourses, courseDB])
    } 
    else if(listCourses.includes(courseDB)) {
      setListCourses(listCourses.filter((value) => value.id != courseDB.id))
    } 
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

        data.courses.forEach((course: CourseUser) => {
          let courseInCourseIndex = courses.findIndex((x) => {
            return  x._id === course.course
          })
          setActualCourseIndex(userDB?.courses[courseInCourseIndex].actualChapter ? userDB?.courses[courseInCourseIndex].actualChapter - 1 : 0)

          const arrCopy = [...listCourses]
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
            if(!listCourses.includes(courses[courseInCourseIndex]) && !hasCourse) {
              setListCourses([...listCourses, courses[courseInCourseIndex]])
            } 
          }
          else {
            if(listCourses.includes(courses[courseInCourseIndex])) {
              setListCourses(listCourses.filter((value) => value._id != course.course))
            }
          }
        });


      } catch (error: any) {
          console.log(error.message)
      }
  }

  getUserDB()
  // setListCourses(listCourses.filter((item, index) => listCourses.indexOf(item) === index))


  }, [router, session, listCourses])



  
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
          <Row title="Cursos de Moda" courses={courses} setSelectedCourse={setSelectedCourse} items={null} courseDB={null} actualCourseIndex={actualCourseIndex} setRef={setRefToModaSend}/>
          <Row title={"Nuevo"} courses={nuevoCourses} setSelectedCourse={setSelectedCourse} items={null} courseDB={null} actualCourseIndex={actualCourseIndex} setRef={setRefToNuevoSend}/>
          <Row title={"Mi Lista"} courses={listCourses} setSelectedCourse={setSelectedCourse} items={null} courseDB={null} actualCourseIndex={actualCourseIndex} setRef={setRefToListSend}/>
          <Row title={"Mis Cursos"} courses={myCourses} setSelectedCourse={setSelectedCourse} items={null} courseDB={null} actualCourseIndex={actualCourseIndex} setRef={setRefMySend}/>
        </section>
      </main>

      {activeModal && <Modal courseDB={selectedCourse} user={userDB} actualCourseIndex={actualCourseIndex} setListFunc={setList} listCourses={listCourses} updateUserDB={updateUserDB} />}
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


