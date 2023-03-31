import { GetServerSideProps, GetStaticProps } from 'next'
import MuiModal from '@mui/material/Modal'
import { ParsedUrlQuery } from 'querystring'
import React, { RefObject, useContext, useEffect, useState } from 'react'
import { CoursesDB, ClassesDB, Item, User, CourseUser } from '../../../../typings'
import requests from '../../../../utils/requests'
import { getCourseById } from '../../../api/course/getCourseById'
import VideoPlayer from '../../../../components/VideoPlayer'
import Head from 'next/head'
import Link from 'next/link'
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md'
import { parseCookies } from 'nookies'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import axios from "axios"
import { ArrowDownLeftIcon, XCircleIcon } from '@heroicons/react/24/outline'
import ClassDescription from '../../../../components/ClassDescription'
import ReactPlayer from 'react-player'
import connectDB, { db } from '../../../../config/connectDB'
import { getUserFromBack } from '../../../api/user/getUserFromBack'
import PaymentGateway from '../../../../components/PaymentGateway'

interface Props {
  course: CoursesDB
  classId: number
  lastCourseClass: number
  user: User | null
}

function Course({ course, user }: Props) {
  const courseDB = course
  const lastClass = courseDB.classes.length
  const youtubeURL = `${requests.playlistYTAPI}?part=snippet&playlistId=${courseDB?.playlist_code}&maxResults=50&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
  const [forward, setForward] = useState<boolean>(false)
  const [time, setTime] = useState<number | null | undefined>(null)
  const [play, setPlay] = useState<boolean>(false)
  const [resumeModal, setResumeModal] = useState<boolean>(false)
  const [courseUser, setCourseUser] = useState<CourseUser | null>(null)
  const [hasWindow, setHasWindow] = useState(false);
  const [playerRef, setPlayerRef] = useState<RefObject<ReactPlayer> | null>(null);
  const cookies = parseCookies()
  const {data: session} = useSession() 
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
    if (!user) {
      router.push("/src/user/login")
    }
    else {
      let courseActual = user.courses.find((course: CourseUser) => course.course === courseDB._id)
      setCourseUser(courseActual ? courseActual : null)
    }
  }, [router])

  const handleRouteChange = async (route: string) => {
    router.push(route)
  }

  return (
    <div className="relative h-full">
      <Head>
        <title>Video Streaming</title>
        <meta name="description" content="Stream Video App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={``}>
          <div onClick={() => handleRouteChange('/src/home')}
          >
            <img
              alt='Logo Video Stream'
              src="/images/logoWhite.png"
              width={120}
              height={120}
              className="cursor-pointer object-contain transition duration-500 hover:scale-105 md:opacity-70 hover:opacity-90" 
            />
          </div>
          <img
            onClick={() => handleRouteChange('/src/user/account')}
            src="https://rb.gy/g1pwyx"
            alt=""
            className="cursor-pointer rounded"
            // onClick={() => logoutHandler()}
          />
      </header>

      <main className='relative h-full flex flex-col'>
        <PaymentGateway user={user} course={course} />
      </main>

    </div>
  )
}


  export async function getServerSideProps(context: any) {

      connectDB()
      const { params, query, req, res } = context
      const session = await getSession({ req })
      const cookies = parseCookies(context)
      const userCookie = cookies?.user ? JSON.parse(cookies.user) : session?.user
      const email = userCookie?.email   
      const { courseId } = params
      const course = await getCourseById( courseId)
      const user = await getUserFromBack(email)
 
      return {
        props: { course, user  }
      }
  } 

export default Course