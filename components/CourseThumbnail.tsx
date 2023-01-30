import Image from 'next/image'
import Link from 'next/link'
import React, { Dispatch, SetStateAction } from 'react'
import { useAppDispatch } from '../hooks/useTypeSelector'
import imageLoader from '../imageLoader'
import { loadCourse } from '../redux/courseModal/courseModalAction'
import { CoursesDB, Item, Ricks } from '../typings'

interface Props {
  items: Item[] | null,
  course: CoursesDB | null
  actualCourseIndex: Number
} 
function CourseThumbnail({ items, course, actualCourseIndex }: Props) {

  return (
    <>
        {items?.map((item: Item, index) => (
          <div className='w-full h-full flex items-center justify-center'>
            <div className={`w-[90%] max-h-40 rounded-sm md:rounded px-12 flex justify-center items-center space-x-12 py-8 ${items.indexOf(item) == actualCourseIndex && 'bg-[#333333]'}`} key={item.id}>
              <h3 className='text-[#d2d2d2] flex text-2xl justify-center'>{(items?.indexOf(item) + 1).toString()}</h3>

              <div className='flex items-center justify-center h-28 min-w-[180px] relative cursor-pointer transition duration-200 ease-out md:h-28 md:min-w-[200px] md:hover:scale-105'  >
              <Link href={`/src/courses/${course?.id}/${index + 1}`}>
                <Image 
                    src={item.snippet.thumbnails.standard.url} 
                    fill={true}
                    className='rounded-sm object-cover md:rounded ' 
                    alt={item.snippet.title}
                    loader={imageLoader}
                    />
              </Link>


              </div>
              <div className='flex flex-col space-y-2 max-h-40 overflow-scroll scrollbar-hide py-2'>
                <h4 className='text-base'>{item.snippet.title}</h4>
                <p className='text-xs text-[#d2d2d2]'>{item.snippet.description}</p>
              </div>
            </div>
          </div>


    
        ))}
    </>

  )
}

export default CourseThumbnail