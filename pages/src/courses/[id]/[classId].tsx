import { GetServerSideProps, GetStaticProps } from 'next'
import { ParsedUrlQuery } from 'querystring'
import React, { useEffect, useState } from 'react'
import { CoursesDB, ClassesDB, Item, User, CourseUser } from '../../../../typings'
import requests from '../../../../utils/requests'
import { getCourseById } from '../../../api/course/getCourseById'
import { getClassById } from '../../../api/class/getClassById'
import VideoPlayer from '../../../../components/VideoPlayer'
import { getCourses } from '../../../api/course/getCourses'
import { getLastCourseClass } from '../../../api/course/getLastCourseClass'

import Head from 'next/head'
import Header from '../../../../components/Header'
import Link from 'next/link'
import { FiArrowLeft, FiArrowRight} from 'react-icons/fi'
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md'

import { parseCookies } from 'nookies'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { ArrowDownLeftIcon } from '@heroicons/react/24/outline'
import ClassDescription from '../../../../components/ClassDescription'

interface Props {
  clase: ClassesDB
  classId: number
  lastCourseClass: number
  user: any
}

function Course({ clase }: Props) {
  const courseDB = clase.course
  const lastClass = courseDB.classes.length
  const youtubeURL = `${requests.playlistYTAPI}?part=snippet&playlistId=${courseDB?.playlist_code}&maxResults=50&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
  const [items, setItems] = useState<Item[] | null>(null)
  const [courseUser, setCourseUser] = useState<string | null>(null)
  const url =  `https://www.youtube.com/embed/${clase.class_code}?rel=0`
  const [hasWindow, setHasWindow] = useState(false);
  const [userDB, setUserDB] = useState<User | null>(null)  
  const cookies = parseCookies()
  const {data: session} = useSession() 
  const router = useRouter()
  let user = cookies?.user ? JSON.parse(cookies.user): session?.user ? session.user : ''

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
    if (user === '') {
      router.push("/src/user/login")
    }

    const getUserDB = async () => {
      try {
        const config = {
            headers: {
              "Content-Type": "application/json",
            },
          }
        const courseId = courseDB._id
        const actualChapter = clase.id
        const email = user.email
        const { data } = await axios.post('/api/user/getUser', { email }, config)
        await axios.post('/api/user/updateActualCourse', { email, courseId, actualChapter }, config)
        !userDB ? setUserDB(data) : null

        let courseActual = data.courses.find((course: CourseUser) => course.course === courseDB._id)
        setCourseUser(courseActual)

      } catch (error: any) {
          console.log(error.message)
      }
    }
      getUserDB()
  }, [session, router])

  return (
    <div className="relative h-screen bg-gradient-to-b lg:h-[140vh]">
      <Head>
        <title>Video Streaming</title>
        <meta name="description" content="Stream Video App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={`bg-[#141414]`}>
        <Link href="/">
          <img
            alt='Logo Video Stream'
            src="https://rb.gy/ulxxee"
            width={120}
            height={120}
            className="cursor-pointer object-contain"
          />
        </Link>
        <Link href="/src/user/account">
          <img
            src="https://rb.gy/g1pwyx"
            alt=""
            className="cursor-pointer rounded"
            // onClick={() => logoutHandler()}
          />
        </Link>
      </header>

      <main className='relative bg-gradient-to-b h-[100vh] flex flex-col'>
        <div className='w-full h-[80%] flex flex-row'>
          <Link href={clase.id - 1 == 0 ? `/src/courses/${courseDB.id}/${clase.id}` : `/src/courses/${courseDB.id}/${clase.id - 1}`}><MdKeyboardArrowLeft className='h-24 w-24 relative top-80 left-0 text-[#e6e5e5] transform scale-90 hover:text-[#fff] hover:transform hover:scale-100 hover:bg-[gray]/5 hover:rounded-full'/></Link>
          {hasWindow && <VideoPlayer url={`https://www.youtube.com/embed/${clase.class_code}?controls=1`} title={clase.name} img={courseDB.image_url}/>}
          <Link href={clase.id + 1 == lastClass ? `/src/courses/${courseDB.id}/1` : `/src/courses/${courseDB.id}/${clase.id + 1}`}>            <MdKeyboardArrowRight className='h-24 w-24  relative top-80 right-0 text-[#e6e5e5] transform scale-90 hover:text-[#fff] hover:transform hover:scale-100 hover:bg-[gray]/5 hover:rounded-full'/></Link>
        </div>
        <div className='w-full h-[60vh]'> 
          <ClassDescription clase={clase} youtubeURL={youtubeURL} courseDB={courseDB}/>
        </div>
      </main>



    </div>
  )
}


  export async function getServerSideProps(context: any) {
      const { params } = context
      const { classId, id } = params
      const clase = await getClassById(classId, id)
      return {
        props: { clase }
      }
  } 

export default Course