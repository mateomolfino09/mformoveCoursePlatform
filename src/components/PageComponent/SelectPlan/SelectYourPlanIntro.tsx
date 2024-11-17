import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import VimeoPlayer from '../ClassPage/VimeoPlayer'
import VimeoPlayerPlan from './VimeoPlayerPlan';
import { CheckCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth';
import endpoints from '../../../services/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Plan } from '../../../../typings';

interface Props {
  planSelected: Plan
}

const SelectYourPlanIntro = ({ planSelected }: Props) => {
  console.log(planSelected)
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
              const res = await fetch(endpoints.payments.createPaymentToken, {
                  method: 'POST',
                  headers: {  
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email, planId: planSelected?.id }),
                })
      
              const data = await res.json()
              console.log(data)
              setLoading(false)

              if(!data.success) {
                  toast.error(data.message)
                  return
              }
      
              const { token, planToken } = data
              Cookies.set('planToken', planToken ? planToken : '', { expires: 5})
              
              router.push(`${origin}/validate/subscription/${planSelected?.plan_token}?external_id=${auth?.user?._id}`)

              console.log(email)
              setLoading(false)
      
              const { message, user, success } = data

              if(success)
              toast.success(message)
              else
              toast.error(message)
      } catch (error: any) {
          console.log(error)
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
    <div className= "inline-block min-h-[50vh] md:min-h-[105vh] text-left rounded-lg overflow-hidden align-bottom transition-all transform shadow-2xl py-4 sm:pt-8 sm:align-middle w-full md:pt-12 mt-8 pb-16 bg-[#141414] sm:pb-8">
      <div className='flex space-y-1 flex-col mt-12 pl-3 md:pl-32'>
      <h1 className='text-3xl md:text-5xl font-boldFont align-middle text-start'>Te doy la bienvenida 🫡</h1>
      <p className='text-red-500/80 text-base md:text-xl align-middle text-start'><b>Siguiente Paso:</b> Mira el video corto 👇  </p>
      </div>

            <div className='w-full h-full flex flex-col px-6 space-y-4 mt-6 md:space-y-12 md:space-x-18 justify-center md:justify-start md:items-start items-center md:pl-32'> 
            {hasWindow && (
                <>
                <div className='w-full h-full lg:w-2/3'>
                    {/* <VideoPlayer
                    url={clase.link}
                    clase={clase}
                    img={clase.image_url}
                    courseUser={courseUser}
                    setPlayerRef={(val: any) => setPlayerRef(val)}
                    play={play}
                    /> */}
                    <VimeoPlayerPlan
                    videoId={"1030196447"}
                  />
                </div>
                </>
            )}

            <div className='flex flex-col space-y-4 !mt-12 capitalize w-full justify-start md:pl-32'>
            <h2 className='text-3xl md:text-4xl font-boldFont align-middle text-start'>¿Que esperar?</h2>

            <>
            <div className='flex space-x-2'>
              <div>
                <CheckCircleIcon
                  style={{ flex: '1 0 5%;' }}
                  className='w-6 h-6 text-[#ae9359]'
                />
              </div>
              <p className='text-base font-light'>
                Clases Ilimitadas de Flexibilidad, Fuerza y Respiración
              </p>
            </div>
            {/* <div className='flex space-x-2'>
                  <div>
                        <CheckCircleIcon style={{flex: "1 0 5%;"}} className='w-6 h-6 text-[#ae9359]'/>
                    </div>
                    <p className='text-base font-light'>Asesoramiento Personal Semanal</p>
                </div> */}
            <div className='flex space-x-2'>
              <div>
                <CheckCircleIcon
                  style={{ flex: '1 0 5%;' }}
                  className='w-6 h-6 text-[#ae9359]'
                />
              </div>
              <p className='text-base font-light'>
               Resultados Inmediatos 🗓️
              </p>
            </div>
            <div className='flex space-x-2'>
              <div>
                <CheckCircleIcon
                  style={{ flex: '1 0 5%;' }}
                  className='w-6 h-6 text-[#ae9359]'
                />
              </div>
              <p className='text-base font-light'>
                Contenido Exclusivo
              </p>
            </div>

            <div
          onClick={handleClick}
          className='flex px-24 py-3 !mt-8 bg-white text-black md:justify-start md:pl-32 rounded-full justify-center items-center w-full md:w-96 group cursor-pointer '
        >
          {loading ? (
            <>
              <MiniLoadingSpinner />
            </>
          ) : (
            <button className='w-full text-base md:text-lg'>Empezar</button>
          )}
        </div>
          </>
        </div>



{/* 
          <div className='w-full md:pt-6 flex justify-center flex-col items-center hover:scale-105 transition-all duration-500 cursor-pointer pt-8'>
                <ChevronDownIcon className='w-12 h-12'/>
              </div> */}
            </div>

    </div>
  )
}

export default SelectYourPlanIntro