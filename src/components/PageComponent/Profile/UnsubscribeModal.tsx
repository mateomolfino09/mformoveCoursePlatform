import { XCircleIcon } from '@heroicons/react/24/solid'
import React, { useEffect, useState } from 'react'
import { motion as m, useAnimation } from 'framer-motion';
import AddQuestionQuantity from '../../AddQuestionQuantity';
import AddQuestions from '../../AddQuestions';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import imageLoader from '../../../../imageLoader';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../../LoadingSpinner';


interface Props {
    visible: boolean
    handleVisiblity: any
}

const UnsubscribeModal
 = ({ visible, handleVisiblity }: Props) => {
    const animation = useAnimation();
    const [ quantity, setQuantity ] = useState<number>(5)
    const [error, setError] = useState<boolean>(false)
    const { register, handleSubmit, formState: { errors,  } } = useForm()
    const router = useRouter();
    const auth = useAuth();
    const [reason, setReason] = useState(-1)
    const [loading, setLoading] = useState(false)

      const handleCancelSub = async () => {
        setLoading(true)
        if(!auth.user) {
            auth.fetchUser()
            return
          }
        if(reason === -1) {
            toast.error('Selecciona al menos una razón por la que te desuscribes')
            return
        }
        try {
        await auth.cancelSub(auth?.user?.subscription.planId, auth?.user?.subscription.id, auth?.user?._id)
        toast.success('Se ha cancelado la subscricpción con éxito')
        handleVisiblity()
        setLoading(false)

        } catch (error) {
        console.log(error)
        toast.error('Hubo un error al cancelar tu subscricpción, comunicate con soporte')
        setLoading(false)

        }
    }

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
    <div className={` w-full h-full z-[120] bg-black/50 text-white top-0 ${visible ? 'absolute' : 'hidden'}`}>
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
                <h1 className='text-2xl font-light text-white'>¿Quieres terminar tu subscricpción en MforMove Platform?</h1>
            </div>
            <div className='flex justify-center text-center items-center pb-4 px-12 text-lg'>
                Nos gustaría entender que fue lo que te hizo tomar esta decisión para seguir mejorando nuestro servicio. Cuentanos, dejo el servicio por que...
            </div>
            <div className="flex justify-center space-x-3 items-center mb-4">
            <input onChange={(e) => {
                if(e.target.checked) {
                    setReason(0)
                }
                else {
                    setReason(-1)
                }
            }} id="default-checkbox" checked={reason === 0} type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">No puedo pagarlo</label>
            </div>  
            <div className="flex justify-center space-x-3 items-center mb-4">
            <input onChange={(e) => {
                if(e.target.checked) {
                    setReason(1)
                }
                else {
                    setReason(-1)
                }
            }} id="default-checkbox" checked={reason === 1} type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Ya no me interesa</label>
            </div>  
            <div className="flex justify-center space-x-3 items-center mb-4">
            <input onChange={(e) => {
                if(e.target.checked) {
                    setReason(2)
                }
                else {
                    setReason(-1)
                }
            }} checked={reason === 2} id="default-checkbox" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
            <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">No me gustó</label>
            </div>  
            <div className='flex justify-center items-center mt-2 pb-4'>
            <button onClick={() => handleCancelSub()} className='w-72 h-12 bg-white text-black rounded-md'> Cancelar Subscripción {loading && (
                <><LoadingSpinner /></>
            )} </button>
            </div>
        </div>
        </m.div>
    </div>
  )
}

export default UnsubscribeModal
