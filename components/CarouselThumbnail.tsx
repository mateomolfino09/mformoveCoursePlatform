import { CldImage } from 'next-cloudinary'
import Image from 'next/image'
import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'
import { useAppDispatch } from '../hooks/useTypeSelector'
import imageLoader from '../imageLoader'
import { loadCourse } from '../redux/courseModal/courseModalAction'
import { CourseUser, CoursesDB, Ricks, User } from '../typings'
import { MdBlock, MdOutlineClose, MdRemove } from 'react-icons/md'
import { ChevronDownIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/solid'
import zIndex from '@mui/material/styles/zIndex'
import { MdAdd } from 'react-icons/md'
import { CourseListContext } from '../hooks/courseListContext'
import { AiOutlineCheckCircle, AiOutlineMinusCircle } from 'react-icons/ai'
import { toast, Toaster } from 'react-hot-toast'
import axios from 'axios'
import { CoursesContext } from '../hooks/coursesContext'
import {TbLockOpenOff} from 'react-icons/tb'
import { UserContext } from '../hooks/userContext'
import { motion as m } from "framer-motion"

interface Props {
  course: CoursesDB,
  setSelectedCourse: Dispatch<SetStateAction<CoursesDB | null>> | null
  user: User | null
  courseIndex: number
  //Firebase
    // character: Ricks | DocumentData[]
} 

const notify = ( message: String, agregado: boolean, like: boolean ) =>
  toast.custom(
    (t) => (
      <div
        className={`${like ? 'notificationWrapperLike' : 'notificationWrapper'} ${t.visible ? "top-0" : "-top-96"}`}
      >
        <div className={'iconWrapper'}>
        {agregado ? <AiOutlineCheckCircle /> : <AiOutlineMinusCircle />}

        </div>
        <div className={`contentWrapper`}>
          <h1>{message}</h1>
          {like ? (<p>
            Le has dado {message} a este curso

          </p>) : (
            <p >
            Este curso ha sido {message} exitosamente   

          </p>
          )}

        </div>
        <div className={'closeIcon'} onClick={() => toast.dismiss(t.id)}>
          <MdOutlineClose />
        </div>
      </div>
    ),
    { id: "unique-notification", position: "top-center" }
  );


function CarouselThumbnail({ course, setSelectedCourse , user, courseIndex}: Props) {
  const dispatch = useAppDispatch()
  const [courseUser, setCourseUser] = useState<CourseUser | null>(null)
  const [ zIndex, setZIndex ] = useState(0)
  const {listCourse, setListCourse} = useContext( CourseListContext )
  const {userCtx, setUserCtx} = useContext( UserContext )

  useEffect(() => {
    setCourseUser(userCtx?.courses[courseIndex])
  }, [userCtx])

  const addCourseToList = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
  }
  const courseId = course?.id
  const userId = user?._id
    try {
      notify('Agregado a la Lista', true, false)
      const { data } = await axios.put('/api/user/course/listCourse', { courseId, userId }, config)
      setListCourse([...listCourse, course])
      console.log(data)
      setUserCtx(data)


    } catch (error) {
      console.log(error)
    }

  }
  const removeCourseToList = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
  }
  const courseId = course?.id
  const userId = user?._id
    try {
      notify('Eliminado de la Lista', false, false)
      setListCourse([...listCourse.filter((value: CoursesDB) => value.id != course?.id)])
      const { data } = await axios.put('/api/user/course/dislistCourse', { courseId, userId }, config)
      setUserCtx(data)

    } catch (error) {
      
    }


  }
  
  const handleOpen = () => {
    dispatch(loadCourse());
    if(setSelectedCourse != null) setSelectedCourse(course)
  }

  return (
    <m.div className={`thumbnailContainer bg-almost-black-lighter  `}>
      <div className='thumbnailItem' onClick={handleOpen}>
        <CldImage 
              src={course?.image_url} 
              preserveTransformations
              width={1000}
              height={1000}
              className={`cldImage`}
              alt={course?.name}
              loader={imageLoader}
              onClick={handleOpen}
              />
      </div>
      <div className='flex w-full  h-full flex-col p-4 justify-start space-y-8'>
      <div className="flex flex-row items-center">
                  <div className="cursor-pointer w-8 h-8 bg-white rounded-full flex justify-center items-center transition hover:bg-neutral-300 ">
                    <PlayIcon className="text-black w-6 h-6" onClick={handleOpen}
/>
                  </div>
                  <div className="cursor-pointer w-8 h-8 bg-transparent border-white  border rounded-full flex justify-center items-center transition  ml-2">
                    {!userCtx?.courses[courseIndex].inList ? (
                      <MdAdd className=" text-white w-6 h-6" onClick={() => addCourseToList()}/>
                    ) : (
                      <MdRemove className=" text-white w-6 h-6" onClick={() => removeCourseToList()}/>
                    )}
                  </div>
                  {!courseUser?.purchased && user?.rol != 'Admin' && (
                    <div className="cursor-pointer group/item w-8 h-8 border-white border rounded-full flex justify-center items-center transition hover:border-neutral-300 ml-2">
                    <TbLockOpenOff className="text-white group-hover/item:text-neutral-300 w-6"/>
                  </div>
                  )}
   
                  <div className="cursor-pointer ml-auto group/item w-8 h-8 border-white border rounded-full flex justify-center items-center transition hover:border-neutral-300">
                    <ChevronDownIcon className="text-white group-hover/item:text-neutral-300 w-6" onClick={handleOpen}/>
                  </div>
      </div>
      <div className="flex flex-row mt-0 lg:mt-4 gap-2 items-center"> 
        <p className="text-white text-lg lg:text-xl">{course?.name}</p>
      </div>
      </div>

      </m.div>
  )
}

export default CarouselThumbnail