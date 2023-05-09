import {
  headContainerAnimation,
  headContentAnimation,
  headTextAnimation,
  slideAnimation
} from '../config/motion'
import imageLoader from '../imageLoader'
import { CoursesDB, User } from '../typings'
import state from '../valtio'
import CustomButton from './CustomButton'
import axios from 'axios'
import { AnimatePresence, motion as m } from 'framer-motion'
import { CldImage } from 'next-cloudinary'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useSnapshot } from 'valtio'

interface Props {
  course: CoursesDB
  user: User | null
}

const PaymentGateway = ({ user, course }: Props) => {
  const email = user?.email
  const courseId = course.id
  const FORM_ID = 'payment-form'
  const [preferenceId, setPreferenceId] = useState(null)
  const [initPoint, setInitPoint] = useState('')
  const snap = useSnapshot(state)
  const router = useRouter()

  const handleClick = () => {
    state.intro = false
  }
  //obtengo el preferenceId
  useEffect(() => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    axios
      .post('/api/course/payments/userPurchase', { email, courseId }, config)
      .then((data: any) => {
        setInitPoint(data.data.data.init_point)
        // setPreferenceId(data.data.id)
      })
  }, [courseId])

  useEffect(() => {
    if (preferenceId) {
      handlScriptAdd(preferenceId)
    }
  }, [preferenceId])

  const handleRouteChange = async (route: string) => {
    router.push(route)
  }

  const handlScriptAdd = (preferenceId: any) => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src =
      'https://www.mercadopago.cl/integrations/v1/web-payment-checkout.js'
    script.setAttribute('data-preference-id', preferenceId)
    const form = document.getElementById(FORM_ID)
    form?.appendChild(script)
  }

  return (
    <AnimatePresence>
      {snap.intro && (
        <m.section {...slideAnimation('left')}>
          <m.header className={``} {...slideAnimation('down')}>
            <m.div
              {...headContentAnimation}
              onClick={() => handleRouteChange('/src/home')}
            >
              <img
                alt='Logo Video Stream'
                src='/images/logoWhite.png'
                width={120}
                height={120}
                className='cursor-pointer object-contain transition duration-500 hover:scale-105 md:opacity-70 hover:opacity-90'
              />
            </m.div>
          </m.header>
          <m.div
            {...headContainerAnimation}
            className='relative h-full flex flex-col'
          >
            <m.div
              {...headContentAnimation}
              className='w-full h-full flex flex-row mt-0'
            >
              <m.div
                {...headTextAnimation}
                className='flex flex-col justify-center items-start mt-32 md:mt-32 pl-24 md:pl-52'
              >
                <h1 className='font-semibold shadow-2xl text-5xl md:text-6xl text-start text-white'>
                  {course.name}
                </h1>
                <div className='w-full flex flex-col space-y-2 mt-8'>
                  <p className='w-full text-transparent text-lg bg-clip-text bg-gradient-to-r from-white to-orange-500 shadow-2xl md:text-2xl'>
                    • Material Teórico y Práctico.
                  </p>
                  <p className='w-full text-transparent text-lg bg-clip-text bg-gradient-to-r from-white to-orange-500 shadow-2xl md:text-2xl'>
                    • Notas de clase.
                  </p>
                  <p className='w-full text-transparent text-lg bg-clip-text bg-gradient-to-r from-fuchsia-300 to-orange-600 shadow-2xl md:text-2xl'>
                    • Diploma del curso.
                  </p>
                </div>
                <h2 className='mt-10 text-4xl font-semibold shadow-2xl'>
                  Información Del Curso
                </h2>
                <div className='flex flex-col justify-center items-start mt-5'>
                  <h3 className='w-full text-white text-2xl font-semibold shadow-2xl'>
                    Descripción
                  </h3>
                  <p className='w-full text-transparent text-sm bg-clip-text bg-gradient-to-r from-white to-white shadow-2xl md:text-2xl font-light'>
                    {course.description}
                  </p>
                </div>
                <div className='flex flex-col justify-center items-start mt-4'>
                  <h3 className='w-full text-white text-2xl font-semibold shadow-2xl'>
                    Precio
                  </h3>
                  <p className='w-full text-transparent text-sm bg-clip-text bg-gradient-to-r from-white to-white shadow-2xl md:text-2xl font-light'>
                    {course.currency} {course.price}
                  </p>
                </div>
                <div className='w-full h-full flex flex-col  items-start space-y-2'>
                  {user?.courses[course.id - 1].purchased ? (
                    <>
                      <Link
                        href={`/src/courses/${course.id}/${
                          user.courses[course.id - 1].actualChapter
                        }`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <CustomButton
                          title='Ver Curso'
                          customStyles='h-10 w-28'
                          handleClick={() => null}
                        />
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* <CustomButton title='Inscribirme' customStyles={`h-10 w-28 ${!initPoint ? 'cursor-not-allowed' : 'cursor-pointer'}`} handleClick={() => state.intro = false}/> */}
                      <Link
                        href={initPoint}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <CustomButton
                          title='Inscribirme'
                          customStyles={`h-10 w-28 ${
                            !initPoint ? 'cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          handleClick={() => null}
                        />
                      </Link>
                    </>
                  )}

                  <div className='w-full h-full flex flex-row justify-start items-center space-x-2'>
                    <Image
                      src='/images/mplogo.png'
                      alt={'image'}
                      loader={imageLoader}
                      className='rounded-md h-auto  w-12'
                      height={150}
                      width={150}
                    />
                    <Image
                      src='/images/pplogo.png'
                      alt={'image'}
                      loader={imageLoader}
                      className='rounded-md h-auto opacity-0 w-12'
                      height={150}
                      width={150}
                    />
                  </div>
                </div>
              </m.div>
            </m.div>
          </m.div>
        </m.section>
      )}
    </AnimatePresence>
  )
}

export default PaymentGateway
