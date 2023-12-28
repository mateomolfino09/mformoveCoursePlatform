import React, { useEffect } from 'react'
import { IndividualClass } from '../../typings'
import { motion as m, useAnimation } from 'framer-motion'
import Image from 'next/image'
import imageLoader from '../../imageLoader'

interface Props {
    searchClass: IndividualClass
    active: boolean
}

const SearchClassThumbnail = ({ searchClass, active }: Props) => {

    const animation = useAnimation()

    useEffect(() => {
        if(active) {
            animation.start({
                height: '10vh',
                zIndex: 100,
                transition: {
                  delay: 0.05,
                  ease: 'linear',
                  duration: 0.25,
                  stiffness: 0
                }
              });
        }
        else {
            animation.start({
              height: '0rem',
              zIndex: 100,
              transition: {
                delay: 0.05,
                ease: 'linear',
                duration: 0.25,
                stiffness: 0
              }
            });
        }
    }, [active])

  return (
    <m.div initial={{ height: 0 }} animate={animation} className='w-full hover:scale-105 cursor-pointer transition duration-200  h-12 bg-[#232222] md:bg-transparent flex mb-4'>
        <div className='w-[30%] relative max-h-[10vh] max-w-[20vh]'>
        <Image
            src={searchClass.image_base_link}
            className='rounded-sm object-cover md:rounded '
            alt={searchClass.description}
            loader={imageLoader}
            fill={true}
            />
        </div>
        <div className='w-[70%] flex flex-col justify-center items-start pl-4 space-y-2'>
            <div className='w-full'>
                <h6 className='font-light lg:text-sm text-xs '>{searchClass.name}</h6>
            </div>
            <div className='w-full'>
                <p className='font-light lg:text-sm text-xs'>{searchClass.hours != 0 ? `${searchClass.hours} horas` : ''} {searchClass.minutes != 0 ? `${searchClass.minutes} minutos` : ''}</p>
            </div>
            <div className='w-full'>
                <p className='font-light lg:text-sm text-xs'>{searchClass.type.toUpperCase()}</p>
            </div>
        </div>
    </m.div>
  )
}

export default SearchClassThumbnail