import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import VimeoPlayer from '../ClassPage/VimeoPlayer'
import VimeoPlayerPlan from './VimeoPlayerPlan';
import { CheckCircleIcon, ChevronDownIcon, ClipboardDocumentCheckIcon, ClipboardDocumentIcon, CloudArrowDownIcon, DevicePhoneMobileIcon, PhoneIcon, UserCircleIcon, UserGroupIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth';
import endpoints from '../../../services/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Plan } from '../../../../typings';
import state from '../../../valtio';
import { Button } from '@headlessui/react';
import SelectPlanOptions from './SelectPlanOptions';
import SelectPlanPlans from './SelectPlanPlans';

interface Props {
  planSelected: Plan
  origin: string
}

const SelectYourPlanIntro = ({ planSelected, origin }: Props) => {
    const [hasWindow, setHasWindow] = useState(false);
    const [loading, setLoading] = useState<boolean>(false)
    const auth = useAuth();
    const router = useRouter()

    const handleClick = async () => {
      if(!auth.user) {
          toast.error('Usuario no encontrado')
          return
      }
      const email = auth.user.email
      

      setLoading(true)

      try {
          if(planSelected?.provider != "stripe") {
              const res = await fetch(endpoints.payments.createPaymentToken, {
                  method: 'POST',
                  headers: {  
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email, planId: planSelected?.id }),
                })
      
              const data = await res.json()
              setLoading(false)

              if(!data.success) {
                  toast.error(data.message)
                  return
              }
      
              const { token, planToken } = data
              Cookies.set('planToken', planToken ? planToken : '', { expires: 5})
              
              router.push(`${origin}/validate/subscription/${planSelected?.plan_token}?external_id=${auth?.user?._id}`)


          }
          else{
            try {
              const res = await fetch(endpoints.payments.stripe.createPaymentURL, {
                method: 'POST',
                headers: {  
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, planId: planSelected?.id }),
              })


              const data = await res.json()
              setLoading(false)

              if(!data.success) {
                  toast.error(data.message)
                  return
              }
      
              const { url, planToken } = data;
              Cookies.set('planToken', planToken ? planToken : '', { expires: 5})

              router.push(url)
            }
            catch (error: any) {
              setLoading(false);
              toast.error(error?.message);
            }

          }
      } catch (error: any) {
          toast.error(error.message)
      }
      setLoading(false)

  }

    useEffect(() => {
        if (typeof window !== 'undefined') {
          setHasWindow(true);
            }
    
        
      }, []);

  return (
    <div className= "inline-block min-h-[50vh] md:min-h-[105vh] text-black text-left overflow-hidden align-bottom transition-all transform py-4 sm:pt-8 sm:align-middle w-full md:pt-12 bg-to-light font-montserrat pb-12">
      <div className='flex space-y-3 flex-col mt-16 items-center justify-center '>
        <div className='!text-4xl md:!text-5xl font-montserrat font-extrabold align-middle text-center text-black md:max-w-[900px] '>
          <h1 className=''>Transforma tu movimiento con Mateo Molfino</h1>
        </div>

      <p className='text-secondary-darker text-xl md:text-2xl align-middle font-normal text-center md:max-w-[900px]'>Un programa integral para practicar con propósito, desarrollar un cuerpo fuerte, móvil y consciente orgánicamente. Respaldado por una tribu que te escucha y te motiva a seguir.

      </p>
      </div>

        <div className='w-full h-full flex flex-col space-y-4 mt-6 md:space-y-12 md:space-x-18 justify-center items-center px-4'> 
        {hasWindow && (
            <>
            <div className='w-full h-full flex justify-center items-center'>
                <VimeoPlayerPlan
                videoId={"1030196447"}
              />
            </div>
            </>
        )}

    <div className='flex space-y-3 flex-col !mt-20 md:!mt-28 items-start justify-start md:max-w-[900px]' >
    <div className='!text-2xl md:!text-3xl font-montserrat font-bold align-baseline  text-start text-black'>
      <h2 className=''>Para vos que sabés que el movimiento es más que físico.
      </h2>
    </div>

  <p className='text-black text-base md:text-lg align-start text-start '>Capaz ya estás practicando, notaste mejoras, pero  <b> sentís que te falta algo para lograr una verdadera transformación en tu proceso. </b> </p>
  <p className='text-black text-base md:text-lg align-baseline text-start '>O tal vez <b> te frustraste con recomendaciones de entrenamiento genéricas </b>, que no te ayudan a avanzar de forma real y sostenida.  </p>
  <p className='text-black text-base md:text-lg align-start text-start '>Si estas buscando un enfoque que combine <b>fuerza, flexibilidad y movilidad de forma integral </b> , este es el programa que necesitás.  </p>
  <p className='text-black text-base md:text-lg align-start text-start '> Te ofrecemos un enfoque basado en años de experiencia y conocimiento en el movimiento, combinado con un plan estructurado, progresivo y personalizado.  </p>
  <p className='text-black text-base md:text-lg align-start text-start '>Y lo mejor de todo: <b>lo hacemos dentro de una comunidad activa y comprometida.</b> No solo tendrás acceso a recursos de calidad y un acompañamiento constante, sino que te unirás a una tribu de personas que están en la misma búsqueda. Juntos compartimos avances, motivación, correcciones y celebramos cada paso del camino hacia una vida más fuerte, móvil y consciente.   </p>
  <p className='text-black text-base md:text-lg align-start text-start '><b>No es un camino rápido, pero sí uno real.</b> Si buscas soluciones mágicas, este programa no es para ti. </p>

  <div className='w-full flex justify-center'>
          {auth.user ? (
          <Button
                type='button'
                className='w-full block secondary-bg-color border rounded-md transition duration-500 hover:bg-rich-black py-3 font-normal group text-white  relative !mt-5 shadow-2xl' onClick={handleClick}
                >Empezar</Button>

          ) : (
            <Button
            type='button'
            className='w-full block secondary-bg-color border text-white rounded-md transition duration-500 hover:bg-rich-black py-3 font-normal md:max-w-[300px] !mt-5 group relative shadow-2xl' onClick={() => (state.loginForm = true)}
            >Empezar
            </Button>
          )}
        </div>
      </div>
        </div>
    </div>
  )
}

export default SelectYourPlanIntro