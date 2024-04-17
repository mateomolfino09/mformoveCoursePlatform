import { XCircleIcon } from '@heroicons/react/24/solid'
import React, { useEffect, useState } from 'react'
import { motion as m, useAnimation } from 'framer-motion';
import AddQuestionQuantity from './AddQuestionQuantity';
import AddQuestions from './AddQuestions';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import imageLoader from '../../imageLoader';
import { useRouter } from 'next/navigation';


interface Props {
    visible: boolean
    handleVisiblity: any
}

const GetMembershipModal
 = ({ visible, handleVisiblity }: Props) => {
    const animation = useAnimation();
    const [ quantity, setQuantity ] = useState<number>(5)
    const [ questions, setQuestions ] = useState<any>([])
    const [error, setError] = useState<boolean>(false)
    const { register, handleSubmit, formState: { errors,  } } = useForm()
    const router = useRouter();

    useEffect(() => {

    }, [quantity])


    useEffect(() => {
        if (visible) {
          animation.start({
            x: '-50%',
            y: '-50%',
            opacity: 100,
            transition: {
              delay: 0,
              ease: 'linear',
              duration: 0.4,
              stiffness: 0
            }
          });
        } else {
          animation.start({
            x: '50%',
            y: '-50%',
            opacity: 0,
            transition: {
              delay: 0,
              ease: 'linear',
              duration: 0.4,
              stiffness: 0
            }
          });
        }
      }, [visible]);

      const onSubmit = (data: any) => {
        handleVisiblity()
      }

      useEffect(() => {
        if(Object.keys(errors).length === 0) setError(false)
        else setError(true)

      }, [errors])

  return (
    <div className={` w-full h-full z-[120] bg-black/50 top-0 ${visible ? 'absolute' : 'hidden'}`}>
        <m.div initial={{ x: '80%', y:'-50%', opacity: 0, zIndex: '125'}}
        animate={animation} className={`absolute dark:bg-neutral-800 w-2/3 lg:w-1/2 max-h-96 pb-2 z-10 left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] rounded-md shadow-2xl overflow-x-hidden !scrollbar-thin px-2`}>
        <button
        onClick={handleVisiblity}
        className='modalButton !text-white fixed overflow-y-scroll overflow-x-hidden -right-2 !z-40 h-9 w-9 border-none'
        >
        <XCircleIcon className='h-6 w-6 ' />
        </button>
        <div className='w-full '>
            <div className='w-full flex justify-center items-center pt-4 pb-4'>
                <h1 className='text-2xl font-light text-white'>¿Quieres ver esta clase?</h1>
            </div>
            <div className='flex justify-center text-center items-center pb-4 px-12 text-lg'>
                Subscribite para clases de Yoga, Verticales, Fuerza y Flexibilidad todos los meses
            </div>
            <div className='flex flex-col justify-center text-center items-center pb-4 px-12 mt-4 text-lg space-y-2'>
            <li className='mr-2 text-sm'>Clases todas las semanas </li>
                <li className='mr-2 text-sm'>Productos con hasta 50% de descuento </li>
            <div className='flex justify-center text-center items-center px-12 text-lg'>
                <li className='mr-2 text-sm'>Ofrecemos pagos seguros con </li>
                <Image
                src='/images/dlocal.svg'
                alt={'image'}
                loader={imageLoader}
                className='rounded-md h-auto  w-8'
                height={50}
                width={50}
                />
            </div>
            </div>

            <div className='flex justify-center items-center mt-2 pb-4'>
            <button onClick={() => router.push('/select-plan')} className='w-72 h-12 bg-[#a38951] text-white rounded-md hover:bg-white/80 hover:text-black'> Subscribirme</button>
            </div>
        </div>
        </m.div>
    </div>
  )
}

export default GetMembershipModal
