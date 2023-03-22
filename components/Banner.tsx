import Image from 'next/image'
import { useContext, useEffect, useState } from 'react';
import { baseUrl } from '../constants/images';
import imageLoader from '../imageLoader';
import { Images } from '../typings'
import { FaPlay } from 'react-icons/fa'
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { loadCourse } from '../redux/courseModal/courseModalAction';
import { useDispatch } from 'react-redux';
import { useAppDispatch } from '../hooks/useTypeSelector';
import { useSelector } from 'react-redux';
import { CoursesContext } from '../hooks/coursesContext';

interface Props {
    randomImage: Images | null;
}

function Banner({ randomImage }: Props) {
    const [image, setImage] = useState<Images | null>(randomImage);
    // const srcImg: string = image?.urls.regular != null ? image?.urls.regular : ''
    const dispatch = useAppDispatch()
    const { courses, setCourses} = useContext( CoursesContext ) 



  const handleOpen = () => {
    dispatch(loadCourse());
  }


  return (
    <div className='flex flex-col space-y-2 py-16 md:space-y-4 lg:h-[65vh] lg:justify-end' >
        <div className='absolute top-0 left-0 h-[95vh] w-screen -z-10'>
            <Image 
            src="/images/bgHome.jpg"
            // src={srcImg}
            alt={image?.alt_description || 'image'}
            fill={true}
            loader={imageLoader}
            className='object-cover'
            />
        </div>

        <h1 className='text-2xl font-bold lg:text-7xl md:text-4xl '>Curso Actual</h1>
            <p className='max-w-xs text-shadow-md text-xs md:max-w-lg md:text-lg lg:max-w-2xl lg:text-2xl'>{image?.description}</p>    


        <div className='flex space-x-3'>
            <button className='bannerButton bg-white text-black'  onClick={handleOpen}> 
               <FaPlay className='h-4 w-4 text-black md:h-7 md:w-7 '/> Play
            </button>
            <button className='bannerButton darkGray border'>
                More Info <InformationCircleIcon className='h-5 w-5 md:h-8 md:w-8'/>
            </button>
        </div>
        {}
    </div>
  )
}

export default Banner