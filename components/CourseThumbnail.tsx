import Image from 'next/image'
import React, { Dispatch, SetStateAction } from 'react'
import { useAppDispatch } from '../hooks/useTypeSelector'
import imageLoader from '../imageLoader'
import { loadCourse } from '../redux/courseModal/courseModalAction'
import { CoursesDB, Item, Ricks } from '../typings'

interface Props {
  items: Item[] | null,
} 

function CourseThumbnail({ items }: Props) {

  return (
    <>
        {items?.map((item: Item) => (
            <div className='relative h-28 min-w-[180px] cursor-pointer transition duration-200 ease-out md:h-36 md:min-w-[260px] md:hover:scale-105 bg-[#181818]' >
            <Image 
                src={item.snippet.thumbnails.standard.url} 
                layout="fill"
                className='rounded-sm object-cover md:rounded'
                alt={item.snippet.title}
                loader={imageLoader}
                />
            </div>
        ))}
    </>

  )
}

export default CourseThumbnail