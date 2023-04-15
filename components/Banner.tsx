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
import { useRouter } from 'next/router';
import { motion as m, AnimatePresence} from 'framer-motion'
import { headContentAnimation } from '../config/motion';

interface Props {
    randomImage: Images | null;
    scrollToModa: any
}

function Banner({ randomImage, scrollToModa }: Props) {
    const [image, setImage] = useState<Images | null>(randomImage);
    // const srcImg: string = image?.urls.regular != null ? image?.urls.regular : ''
    const dispatch = useAppDispatch()
    const { courses, setCourses} = useContext( CoursesContext ) 
    const router = useRouter()



  const handleOpen = () => {
    dispatch(loadCourse());
  }


  return (
    <AnimatePresence>
        <div className='relative bg-gradient-to-b h-screen flex flex-col space-y-2 py-16' >
            <div className='absolute top-0 left-0 h-full w-screen -z-10'>
                <Image 
                src="/images/bgHome.jpg"
                // src={srcImg}
                alt={image?.alt_description || 'image'}
                fill={true}
                loader={imageLoader}
                className='object-cover'
                />
            </div>

            <m.div {...headContentAnimation} className='flex flex-col space-y-4 md:space-y-12 relative top-40 px-8 md:px-12'>
            <h1 className='text-3xl font-bold lg:text-7xl md:text-4xl '>Lavis Academy</h1>   
            <p className='text-lg font-bold lg:text-2xl md:text-xl'>Descubre tu potencial: aprende con nosotros a crear tu propio estilo y expresarte con confianza.</p>
            <div className='flex space-x-3 !mt-16 md:!mt-32'>
                <button className='bannerButton bg-white text-black font-light'  onClick={scrollToModa}> 
                <FaPlay className='h-5 w-5 text-black md:h-6 md:w-6 '/> Comenzar
                </button>
                <button className='bannerButton darkGray font-light' onClick={() => router.push('/aboutUs')}>
                    Más Info <InformationCircleIcon className='h-6 w-6 md:h-7 md:w-7 '/>
                </button>
            </div>
            </m.div>
        </div>
    </AnimatePresence>

  )
}

export default Banner