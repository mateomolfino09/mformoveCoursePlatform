import axios from 'axios'
import { CldImage } from 'next-cloudinary'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import imageLoader from '../imageLoader'
import { CoursesDB, User } from '../typings'
import { motion as m} from 'framer-motion'

interface Props {
    course: CoursesDB
    user: User | null
}

const PaymentGateway = ({ user, course }: Props) => {
    const email = user?.email
    const courseId = course.id
    const FORM_ID = 'payment-form';
    const [preferenceId, setPreferenceId] = useState(null);
    const [initPoint, setInitPoint] = useState('');

    //obtengo el preferenceId
    useEffect(() => {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      }
      axios.post('/api/course/payments/userPurchase', { email, courseId }, config).then((data: any) => {
      console.log(data.data.data)
      setInitPoint(data.data.data.init_point)
      // setPreferenceId(data.data.id)
    }); 
    }, [courseId]);


    useEffect(() => {
      console.log(preferenceId)
      if(preferenceId) {
        handlScriptAdd(preferenceId)
      }
    }, [preferenceId])


    const handlScriptAdd = (preferenceId: any) => {
      console.log(preferenceId)
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src =
        'https://www.mercadopago.cl/integrations/v1/web-payment-checkout.js';
      script.setAttribute('data-preference-id', preferenceId);
      const form = document.getElementById(FORM_ID);
      form?.appendChild(script);
    }

  return (
    <div className='w-full h-full flex flex-row mt-0'>
        <div className='absolute top-0 left-0 h-[100vh] w-screen -z-10'>
            <Image 
            src="/images/facebg.jpg"
            // src={srcImg}
            alt={'image'}
            fill={true}
            loader={imageLoader}
            className='object-cover object-left   opacity-60  '
            />
        </div>
    <m.div initial={{ x: "-100%"}}
     animate={{x: "0%"}} transition={{duration: 0.9, ease: 'easeOut'}} exit={{opacity: 1}} className='flex flex-col justify-center items-start mt-32 md:mt-32 pl-24 md:pl-64'>
    <h1 className='font-semibold shadow-2xl text-5xl md:text-6xl text-start text-white'>{course.name}</h1>
    <div className='w-full flex flex-col space-y-2 mt-8'>
      <p className='w-full text-transparent text-lg bg-clip-text bg-gradient-to-r from-white to-orange-500 shadow-2xl md:text-2xl'>• Material Teórico y Práctico.</p>
      <p className='w-full text-transparent text-lg bg-clip-text bg-gradient-to-r from-white to-orange-500 shadow-2xl md:text-2xl'>• Notas de clase.</p>
      <p className='w-full text-transparent text-lg bg-clip-text bg-gradient-to-r from-fuchsia-300 to-orange-600 shadow-2xl md:text-2xl'>• Diploma del curso.</p>
    </div>
    <h2 className='mt-10 text-4xl font-semibold shadow-2xl'>Información Del Curso</h2>
    <div className='flex flex-col justify-center items-start mt-5'>
      <h3 className='w-full text-white text-2xl font-semibold shadow-2xl'>Descripción</h3>
      <p className='w-full text-transparent text-sm bg-clip-text bg-gradient-to-r from-white to-white shadow-2xl md:text-2xl font-light'>{course.description}</p>
    </div>
    <div className='flex flex-col justify-center items-start mt-4'>
      <h3 className='w-full text-white text-2xl font-semibold shadow-2xl'>Precio</h3>
      <p className='w-full text-transparent text-sm bg-clip-text bg-gradient-to-r from-white to-white shadow-2xl md:text-2xl font-light'>{course.currency} {course.price}</p>
    </div>
    <div className='w-full h-full flex flex-col  items-start space-y-2'>
      {user?.courses[course.id - 1].purchased ? (
      <>
        <Link href={`/src/courses/${course.id}/${user.courses[course.id - 1].actualChapter}`} target="_blank" rel="noopener noreferrer">
                  <button className={`h-10 w-28 rounded-md border border-white mt-10 hover:scale-105 transition duration-500`} >Ver Curso</button>
        </Link>
      </>
      ) : (
        <>
        <Link href={initPoint} target="_blank" rel="noopener noreferrer">
                  <button className={`h-10 w-28 rounded-md border border-white mt-10 hover:scale-105 transition duration-500`} >Inscribirme</button>
        </Link>
      </>
      )}

    <div className='w-full h-full flex flex-row justify-start items-center space-x-2'> 
    <Image 
            src="/images/mplogo.png"
            alt={'image'}
            loader={imageLoader}
            className='rounded-md h-auto  w-12'
            height={150}
            width={150}
            />
    <Image 
            src="/images/pplogo.png"
            alt={'image'}
            loader={imageLoader}
            className='rounded-md h-auto opacity-0 w-12'
            height={150}
            width={150}
            />
    </div>

    </div>

    </m.div>
    {/* <div className='flex-col justify-center items-start mt-48 ml-24 hidden md:flex '>
    <CldImage 
              src={course?.image_url} 
              preserveTransformations
              layout="cover"
              className={`rounded-sm object-cover md:rounded cursor-pointer
              transition
              duration-200
              shadow-xl z-[200] opacity-60`}
              alt={course?.name}
              loader={imageLoader}
              width={500}
              height={500}
              />
      </div> */}

    </div>
  )
}

export default PaymentGateway