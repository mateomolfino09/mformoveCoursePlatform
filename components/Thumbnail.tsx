import Image from 'next/image'
import React from 'react'
import { useAppDispatch } from '../hooks/useTypeSelector'
import imageLoader from '../imageLoader'
import { loadCourse } from '../redux/courseModal/courseModalAction'
import { Ricks } from '../typings'

interface Props {
  character: Ricks
  //Firebase
    // character: Ricks | DocumentData[]
} 

function Thumbnail({ character }: Props) {
  const dispatch = useAppDispatch()


  const handleOpen = () => {
    dispatch(loadCourse());
  }

  return (
    <div className='relative h-28 min-w-[180px] cursor-pointer transition duration-200 ease-out md:h-36 md:min-w-[260px] md:hover:scale-105' >
        <Image 
            src={character.image} 
            layout="fill"
            className='rounded-sm object-cover md:rounded'
            alt={character.name}
            loader={imageLoader}
            onClick={handleOpen}
            />
    </div>
  )
}

export default Thumbnail