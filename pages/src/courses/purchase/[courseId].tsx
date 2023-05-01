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
import { motion as m, AnimatePresence} from 'framer-motion'
import {
  headContainerAnimation,
  headContentAnimation,
  headTextAnimation,
  slideAnimation
} from '../../../../config/motion';
import Image from 'next/image'
import imageLoader from '../../../../imageLoader'
import Customizer from '../../../../components/Customizer'
import { useSnapshot } from 'valtio'
import state from './../../../../valtio'

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
  const snap = useSnapshot(state)

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


  return (
    <section>
      <Head>
        <title>Video Streaming</title>
        <meta name="description" content="Stream Video App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <main className='app transition-all ease-in'>
        <div className='absolute top-0 left-0 h-[100vh] w-screen -z-10'>
            <Image 
            src="/images/facebg.jpg"
            // src={srcImg}
            alt={'image'}
            fill={true}
            loader={imageLoader}
            className='object-cover object-left   opacity-60  '
            />
        </div>
          <div className='w-full h-full flex'>
            <div className='w-full h-full relative'>
              <PaymentGateway user={user} course={course} />
              <Customizer user={user} course={course}/>
            </div>

          </div>
        </main>
        {!snap.intro && (
          
          <div className='absolute w-full top-0 left-1/2 -ml-[50%] h-full '>

          </div>

    )}
    </section>

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