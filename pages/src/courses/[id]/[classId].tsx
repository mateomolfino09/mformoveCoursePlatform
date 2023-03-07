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

interface Props {
  clase: ClassesDB
  classId: number
  lastCourseClass: number
  user: User | null
}

function Course({ clase, user }: Props) {
  const courseDB = clase.course
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
  const MINUTE_MS = process.env.NEXT_PUBLIC_TIME_COURSE_SAVE ? +process.env.NEXT_PUBLIC_TIME_COURSE_SAVE : 0

  const exitingFunction = async (actual = 0) => {
    const actualTime = actual == 0 ? time : actual;
    const idClass = router.query.classId 
    if(time != null && time != undefined) {
      let userCookies = cookies?.user ? JSON.parse(cookies.user): session?.user ? session.user : ''
      const courseId = courseDB.id
      const classId = idClass != undefined ? actual != 0 ? +idClass : forward ? +idClass -1 : +idClass + 1 : null;

      const email = user?.email ? user?.email : userCookies.email;

      try {
        const config = {
          headers: {  
            "Content-Type": "application/json",
          },
        }
        let { data } = await axios.post('/api/class/saveTime', { actualTime, email, courseId, classId}, config)

      } catch (error) {
        
      }
    }

  };

  const handleClose = () => {
    playerRef?.current && playerRef.current.seekTo(0)
    setResumeModal(false)
    setPlay(true)

}
  const handleLoad = (currentTime: number, totalTime: number) => {
    if(currentTime > 60) {
      setResumeModal(true)
    }
  }

  const handleMove = () => {
    playerRef?.current && playerRef.current.seekTo(courseUser?.classes[clase.id -1].actualTime ? courseUser?.classes[clase.id -1].actualTime : 0)
    setResumeModal(false)
    setPlay(true)

  }

  const handleRouteChange = async (route: string) => {
    setTime(playerRef?.current && playerRef.current.getCurrentTime())
    await exitingFunction(playerRef?.current ? playerRef.current.getCurrentTime() : 0)
    router.push(route)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      exitingFunction(playerRef?.current ? playerRef.current.getCurrentTime() : 0)
    }, MINUTE_MS);
  
    return () => clearInterval(interval);
  }, [])

  useEffect(() => {

    exitingFunction()
  }, [router])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
    if (!user) {
      router.push("/src/user/login")
    }
    else {
      let courseActual = user.courses.find((course: CourseUser) => course.course === courseDB._id)
      setTime(courseActual?.classes[clase.id -1].actualTime)
      setCourseUser(courseActual ? courseActual : null)
      handleLoad(courseActual ? courseActual?.classes[clase.id -1].actualTime : 0 , playerRef?.current?.getDuration() ?  playerRef?.current?.getDuration() : 0)
    }
  }, [router])

  return (
    <div className="relative h-screen bg-gradient-to-b lg:h-[140vh]">
      <Head>
        <title>Video Streaming</title>
        <meta name="description" content="Stream Video App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={`bg-[#141414]`}>
          <div onClick={() => handleRouteChange('/')}
          >
            <img
              alt='Logo Video Stream'
              src="https://rb.gy/ulxxee"
              width={120}
              height={120}
              className="cursor-pointer object-contain"
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

      <main className='relative bg-gradient-to-b h-[100vh] flex flex-col'>
        <div className='w-full h-[80%] flex flex-row'>
          <Link onClick={() => {
            setForward(false)
            setTime(playerRef?.current && playerRef.current.getCurrentTime())

            }} href={clase.id - 1 == 0 ? `/src/courses/${courseDB.id}/${clase.id}` : `/src/courses/${courseDB.id}/${clase.id - 1}`}><MdKeyboardArrowLeft className='h-24 w-24 relative top-80 left-0 text-[#e6e5e5] transform scale-90 hover:text-[#fff] hover:transform hover:scale-100 hover:bg-[gray]/5 hover:rounded-full'/></Link>
          {hasWindow && <VideoPlayer url={`https://www.youtube.com/embed/${clase.class_code}?controls=1`} clase={clase} img={courseDB.image_url} courseUser={courseUser} setPlayerRef={(val: any) => setPlayerRef(val)} play={play}/>}
          <Link onClick={
            () => {setForward(true)
                  setTime(playerRef?.current && playerRef.current.getCurrentTime())
          }} href={clase.id + 1 == lastClass ? `/src/courses/${courseDB.id}/1` : `/src/courses/${courseDB.id}/${clase.id + 1}`}>            <MdKeyboardArrowRight className='h-24 w-24  relative top-80 right-0 text-[#e6e5e5] transform scale-90 hover:text-[#fff] hover:transform hover:scale-100 hover:bg-[gray]/5 hover:rounded-full'/></Link>
        </div>
        <div className='w-full h-[60vh]'> 
          <ClassDescription clase={clase} youtubeURL={youtubeURL} courseDB={courseDB}/>
        </div>
      </main>
      {resumeModal && (
                <MuiModal open={resumeModal} onClose={handleClose} className="fixed z-50 m-auto w-full max-w-md md:max-w-xl max-h-48 overflow-hidden overflow-y-scroll rounded-md scrollbar-hide bg-[#181818]/90 shadow-2xl">
                <>
                <button onClick={handleClose} className='modalButton absolute right-0 top-2 !z-40 h-9 w-9 border-none'>
                    <XCircleIcon className='h-6 w-6'/>
                </button>
                <div className='flex w-full h-full justify-center items-center p-12 relative bottom-6'>
                  <h3 className='text-lg md:text-xl flex text-center'>Esta clase ya fue empezada, desea continuar viendo desde el minuto</h3> 
                </div>
                <button onClick={handleMove} className='modalButton absolute left-12 top-32 !z-40 h-8 w-24 md:w-32 bg-light-red hover:scale-105 transition duration-300 shadow-2xl'>
                    <h3 className='text-sm md:text-sm'>Continuar</h3>
                </button>
                <button onClick={handleClose} className='modalButton absolute right-12 top-32 !z-40 h-8 w-24 md:w-32 shadow-2xl
                bg-black hover:scale-105 transition duration-300'>
                    <h3 className='text-sm md:text-sm'>Descartar</h3>
                </button>

                  
                </>
            </MuiModal>
      )}




    </div>
  )
}


  export async function getServerSideProps(context: any) {
      const { params, query, req, res } = context
      const session = await getSession({ req })
      const cookies = parseCookies(context)
      const userCookie = cookies?.user ? JSON.parse(cookies.user) : session?.user
      const email = userCookie.email   
      const { classId, id } = params
      const clase = await getClassById(classId, id)
      const user = await updateActualCourseSS(email, id, classId)

      return {
        props: { clase, user  }
      }
  } 

export default Course