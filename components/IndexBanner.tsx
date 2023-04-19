import { useEffect, useState } from 'react';
import { loadCourse } from '../redux/courseModal/courseModalAction';
import { useAppDispatch } from '../hooks/useTypeSelector';
import Link from 'next/link';
import { motion as m, AnimatePresence, useAnimation} from 'framer-motion'
import state from '../valtio';
import { useSnapshot } from 'valtio';
import { useRouter } from 'next/router';


interface Props {
    randomImage: string;
}

function Banner({ randomImage }: Props) {
    // const srcImg: string = image?.urls.regular != null ? image?.urls.regular : ''
    const dispatch = useAppDispatch()
    const animation = useAnimation()
    const snap = useSnapshot(state)
    const [hasWindow, setHasWindow] = useState(false);
    const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

    useEffect(() => {
        if(!snap.volumeModal) {
            animation.start({
                 color: '#d1cfcf6e',
                transition: {
                    type: "just",
                    damping: 5,
                    stiffness: 40,
                    restDelta: 0.001,
                    duration: 1,
                  }
            })
        }
    }, [snap.volumeModal])

  const handleOpen = () => {
    dispatch(loadCourse());
  }


  return (
    <div className='flex flex-col space-y-2 py-16 md:space-y-4 h-[75vh] lg:h-[90vh] justify-end lg:items-end mr-12 lg:mr-24' >
        <div className='absolute top-0 left-0 h-[100vh] w-screen -z-10'>
        <video src={'/video/videoTest3.mp4'} autoPlay loop muted={!snap.volumeIndex} className='object-cover h-full w-full'>

        </video>
        </div>
        <Link href={'/src/home'}>
            <m.div  initial= {{ color: '#fff' }} animate={animation}  onMouseEnter={(e) =>{ 
    e.currentTarget.style.color = '#fff'
    }} onMouseLeave={(e) => e.currentTarget.style.color = '#d1cfcf6e'} onClick={(e) => {
        e.currentTarget.style.color = '#fff'
        router.push('/src/home')
    }} className='flex flex-col justify-end items-end !mb-4 -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'>
                <h2 className='font-light lg:text-xl'>Mis Clases</h2>
                <h1 className='text-4xl font-normal lg:text-7xl md:text-4xl text-end'>Aprender en línea</h1>
            </m.div>
        </Link>
        <Link href={'/'}>
        <m.div initial= {{ color: '#fff' }} animate={animation} onMouseEnter={(e) =>{ 
    e.currentTarget.style.color = '#fff'
    }} onMouseLeave={(e) => e.currentTarget.style.color = '#d1cfcf6e'} onClick={(e) => {
        e.currentTarget.style.color = '#fff'
        router.push('/')
    }} className='flex flex-col justify-end items-end !mb-4  -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'>
                    <h2 className='font-light lg:text-xl'>En Línea</h2>
                    <h1 className='text-4xl font-normal lg:text-7xl md:text-4xl'>Corrientes</h1>
        </m.div>
        </Link>
        <Link href={'/aboutUs'}>
            <m.div initial= {{ color: '#fff' }} animate={animation}  onMouseEnter={(e) =>{ 
    e.currentTarget.style.color = '#fff'
    }} onMouseLeave={(e) => e.currentTarget.style.color = '#d1cfcf6e'} onClick={(e) => {
        e.currentTarget.style.color = '#fff'
        router.push('/aboutUs')
    }} className='flex flex-col justify-end items-end !mb-4  -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'>
                <h2 className='font-light lg:text-xl'>Sobre nosotros</h2>
                <h1 className='text-4xl font-normal lg:text-7xl md:text-4xl'>Salón</h1>
            </m.div>
        </Link>

        <m.div initial= {{ color: '#fff' }} animate={animation} onMouseEnter={(e) =>{ 
    e.currentTarget.style.color = '#fff'
    }} onMouseLeave={(e) => e.currentTarget.style.color = '#d1cfcf6e'} onClick={(e) => {
        e.currentTarget.style.color = '#fff'
        router.push('/')
    }} className='flex flex-col justify-end items-end  -space-y-1 text-[#fff] lg:text-[#d1cfcf6e] lg:toggleLightening cursor-pointer'>
            <h2 className='font-light lg:text-xl'>Mis Bienes</h2>
            <h1 className='text-4xl font-normal lg:text-7xl md:text-4xl'>Comercio</h1>
        </m.div>
    </div>
  )
}

export default Banner