import { GetServerSideProps, GetStaticProps } from 'next'
import MuiModal from '@mui/material/Modal'
import { ParsedUrlQuery } from 'querystring'
import React, { RefObject, useContext, useEffect, useState } from 'react'
import { CoursesDB, ClassesDB, Item, User, CourseUser } from '../../../../typings'
import requests from '../../../../utils/requests'
import { getClassById } from '../../../api/class/getClassById'
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
import { ClassContext } from '../../../../hooks/classContext'
import { updateActualCourseSS } from '../../../api/user/updateActualCourseSS'
import connectDB, { db } from '../../../../config/connectDB'
import { getUserFromBack } from '../../../api/user/getUserFromBack'

interface Props {
  clase: ClassesDB
  classId: number
  lastCourseClass: number
  user: User | null
}

function Course({  }: Props) {

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
  const MINUTE_MS = process.env.NEXT_PUBLIC_TIME_COURSE_SAVE ? +process.env.NEXT_PUBLIC_TIME_COURSE_SAVE : 0


//   const handleClose = () => {
//     playerRef?.current && playerRef.current.seekTo(0)
//     setResumeModal(false)
//     setPlay(true)

// }
//   const handleLoad = (currentTime: number, totalTime: number) => {
//     if(currentTime > 60) {
//       setResumeModal(true)
//     }
//   }

//   const handleMove = () => {
//     playerRef?.current && playerRef.current.seekTo(courseUser?.classes[clase.id -1].actualTime ? courseUser?.classes[clase.id -1].actualTime : 0)
//     setResumeModal(false)
//     setPlay(true)

//   }

//   const handleRouteChange = async (route: string) => {
//     setTime(playerRef?.current && playerRef.current.getCurrentTime())
//     await exitingFunction(playerRef?.current ? playerRef.current.getCurrentTime() : 0)
//     router.push(route)
//   }

//   useEffect(() => {
//     const interval = setInterval(() => {
//       exitingFunction(playerRef?.current ? playerRef.current.getCurrentTime() : 0)
//     }, MINUTE_MS);
  
//     return () => clearInterval(interval);
//   }, [])

//   useEffect(() => {

//     exitingFunction()
//   }, [router])

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       setHasWindow(true);
//     }
//     if (!user) {
//       router.push("/src/user/login")
//     }
//     else {
//       let courseActual = user.courses.find((course: CourseUser) => course.course === courseDB._id)
//       setTime(courseActual?.classes[clase.id -1].actualTime)
//       setCourseUser(courseActual ? courseActual : null)
//       handleLoad(courseActual ? courseActual?.classes[clase.id -1].actualTime : 0 , playerRef?.current?.getDuration() ?  playerRef?.current?.getDuration() : 0)
//     }
//   }, [router])

  return (
    <div className="relative h-screen bg-gradient-to-b lg:h-[140vh]">
      <Head>
        <title>Video Streaming</title>
        <meta name="description" content="Stream Video App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={`bg-[#141414]`}>
          <div
          >
            <img
              alt='Logo Video Stream'
              src="https://rb.gy/ulxxee"
              width={120}
              height={120}
              className="cursor-pointer object-contain transition duration-500 hover:scale-105"
            />
          </div>
          <img
            src="https://rb.gy/g1pwyx"
            alt=""
            className="cursor-pointer rounded"
            // onClick={() => logoutHandler()}
          />
      </header>
    </div>
  )
}


  export async function getServerSideProps(context: any) {

      const { params, query, req, res } = context
      const session = await getSession({ req })
      const cookies = parseCookies(context)
      const userCookie = cookies?.user ? JSON.parse(cookies.user) : session?.user
      const email = userCookie?.email   
      const { classId, id } = params
      const clase = await getClassById(classId, id)
      const user = await getUserFromBack(email)
 
      return {
        props: { classId, id, clase, user  }
      }
  } 

export default Course