import Image from 'next/image'
import React, { Dispatch, SetStateAction } from 'react'
import { useAppDispatch } from '../hooks/useTypeSelector'
import imageLoader from '../imageLoader'
import { loadCourse } from '../redux/courseModal/courseModalAction'
import { CoursesDB, Ricks } from '../typings'

interface Props {
  course: CoursesDB,
  setSelectedCourse: Dispatch<SetStateAction<CoursesDB | null>> | null
  //Firebase
    // character: Ricks | DocumentData[]
} 

function Thumbnail({ course, setSelectedCourse }: Props) {
  const dispatch = useAppDispatch()


  const handleOpen = () => {
    dispatch(loadCourse());
    if(setSelectedCourse != null) setSelectedCourse(course)
  }

  return (
    <div className='relative h-28 min-w-[180px] cursor-pointer transition duration-200 ease-out md:h-36 md:min-w-[260px] md:hover:scale-105' >
        <Image 
            src={course?.image_url} 
            layout="fill"
            className='rounded-sm object-cover md:rounded'
            alt={course?.name}
            loader={imageLoader}
            onClick={handleOpen}
            />
    </div>
  )
}

export default Thumbnail