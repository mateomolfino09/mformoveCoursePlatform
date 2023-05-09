import { ClassesDB, CoursesDB } from '../typings'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

interface Props {
  course: CoursesDB
  clase: ClassesDB
  setTime: any
  setForward: any
  playerRef: any
}

const CourseData = ({
  course,
  clase,
  setTime,
  setForward,
  playerRef
}: Props) => {
  console.log(course)

  const router = useRouter()

  const handleLeft = () => {
    setForward(false)
    setTime(playerRef?.current && playerRef.current.getCurrentTime())
    router.push(
      clase.id - 1 == 0
        ? `/src/courses/${course.id}/${clase.id}`
        : `/src/courses/${course.id}/${clase.id - 1}`
    )
  }
  const handleRight = () => {
    setForward(true)
    setTime(playerRef?.current && playerRef.current.getCurrentTime())
    router.push(
      clase.id + 1 == course.classesQuantity
        ? `/src/courses/${course.id}/1`
        : `/src/courses/${course.id}/${clase.id + 1}`
    )
  }

  return (
    <div className='w-full h-full flex flex-row mt-4 justify-between bg-dark lg:w-2/3'>
      <h2 className='text-xl ml-2 font-light'>{course?.name}</h2>
      <div className='h-10 min-w-[5rem] flex flex-row mr-4 rounded-lg'>
        <div
          className='w-1/2  rounded-l-lg border-white border flex justify-center items-center bg-transparent'
          onClick={handleLeft}
        >
          <ChevronLeftIcon className='h-6 w-6' />
        </div>
        <div
          className='w-1/2 md:w-36 md:justify-between bg-white/90 rounded-r-lg flex justify-center items-center'
          onClick={handleRight}
        >
          <ChevronRightIcon className='h-6 w-6 md:min-w-[1.5rem] text-black' />
          <p className='whitespace-nowrap text-ellipsis overflow-hidden text-black hidden md:block'>
            {course.classes[clase.id].name}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CourseData
