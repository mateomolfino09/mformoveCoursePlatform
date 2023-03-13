import Image from 'next/image'
import { useEffect, useState } from 'react';
import { baseUrl } from '../constants/images';
import imageLoader from '../imageLoader';
import { Images } from '../typings'
import { FaPlay } from 'react-icons/fa'
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { loadCourse } from '../redux/courseModal/courseModalAction';
import { useDispatch } from 'react-redux';
import { useAppDispatch } from '../hooks/useTypeSelector';
import { useSelector } from 'react-redux';

interface Props {
    randomImage: string;
}

function Banner({ randomImage }: Props) {
    // const srcImg: string = image?.urls.regular != null ? image?.urls.regular : ''
    const dispatch = useAppDispatch()


  const handleOpen = () => {
    dispatch(loadCourse());
  }


  return (
    <div className='flex flex-col space-y-2 py-16 md:space-y-4 h-[75vh] lg:h-[90vh] justify-end lg:items-end mr-12 lg:mr-24' >
        <div className='absolute top-0 left-0 h-[95vh] w-screen -z-10'>
            <Image 
            src={randomImage}
            alt={'image'}
            fill={true}
            loader={imageLoader}
            className='object-cover'
            />
        </div>
        <div className='flex flex-col justify-end items-end !mb-4 -space-y-1 text-[#d1cfcf6e] toggleLightening'>
            <h2 className='font-light lg:text-xl'>Mis Clases</h2>
            <h1 className='text-4xl font-normal lg:text-7xl md:text-4xl '>Aprender en línea</h1>
        </div>
        <div className='flex flex-col justify-end items-end !mb-4  -space-y-1 text-[#d1cfcf6e] toggleLightening'>
            <h2 className='font-light lg:text-xl'>En Línea</h2>
            <h1 className='text-4xl font-normal lg:text-7xl md:text-4xl text-[#d1cfcf6e] toggleLightening'>Corrientes</h1>
        </div>
        <div className='flex flex-col justify-end items-end !mb-4  -space-y-1 text-[#d1cfcf6e] toggleLightening'>
            <h2 className='font-light lg:text-xl'>Sobre nosotros</h2>
            <h1 className='text-4xl font-normal lg:text-7xl md:text-4xl'>Salón</h1>
        </div>
        <div className='flex flex-col justify-end items-end  -space-y-1 text-[#d1cfcf6e] toggleLightening'>
            <h2 className='font-light lg:text-xl'>Mis Bienes</h2>
            <h1 className='text-4xl font-normal lg:text-7xl md:text-4xl'>Comercio</h1>
        </div>

    </div>
  )
}

export default Banner