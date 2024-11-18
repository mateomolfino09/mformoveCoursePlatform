import imageLoader from '../../../../imageLoader';
import { Plan } from '../../../../typings';
import { useAuth } from '../../../hooks/useAuth';
import endpoints from '../../../services/api';
import state from '../../../valtio';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { CheckmarkIcon } from 'react-hot-toast';
import Select, { StylesConfig } from 'react-select';
import { toast } from 'react-toastify';
import './SelectYourPlan.css'
interface Props {
  plans: Plan[];
  select: string;
  origin: string;
}

const SelectYourPlan = ({ plans, select = "", origin }: Props) => {
    const [planSelected, setPlanSelected] = useState<Plan | null | undefined>(plans[0])
    const [loading, setLoading] = useState<boolean>(false)

    const auth = useAuth()
    const router = useRouter()
    const planSelect = [
        ...plans.filter(x => x.active).map((p: Plan) =>      
        {
            return {
                value: p.name,
                label: p.name
            }
        }), 
        {
            value: "Comunidad Gratuita",
            label: "Comunidad Gratuita"
        }

    
    ]

  useEffect(() => {
    if (!auth.user) {
      auth.fetchUser();
    }
  }, [auth.user]);

  const [planSelectedValue, setPlanSelectedValue] = useState<string>(
    planSelect[0].value
  );

    const handleClick = async () => {
        if(!auth.user) {
            toast.error('Usuario no encontrado')
            return
        }
        const email = auth.user.email
        

        setLoading(true)

        try {
            if(planSelectedValue != "Comunidad Gratuita") {
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
            else {
                console.log(email)
                const res = await fetch(endpoints.payments.createFreeSubscription, {
                    method: 'PUT',
                    headers: {  
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                  })
        
                const data = await res.json()
                setLoading(false)
        
                const { message, user, success } = data

                if(success)
                toast.success(message)
                else
                toast.error(message)
            }
        } catch (error: any) {
            console.log(error)
            toast.error(error.message)
        }
        setLoading(false)

    }

  const colourStyles: StylesConfig<any> = {
    control: (styles) => ({
      ...styles,
      backgroundColor: '#101010',
      height: 55,
      width: 300,
      borderRadius: 6,
      padding: 0
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return { ...styles, color: '#808080' };
    },
    input: (styles) => ({ ...styles, backgroundColor: '', color: '#fff' }),
    placeholder: (styles) => ({ ...styles, color: '#fff' }),
    singleValue: (styles, { data }) => ({ ...styles, color: '#808080' })
  };

  return (
    <div className='w-full px-3 py-12 relative flex flex-col lg:pr-36 pt-8'>
      <div className='flex md:space-y-1 flex-col mb-12 items-end pl-2 justify-end'>
        <h1 className='text sm:text-7xl md:text-5xl lg:text-5xl font-light capitalize font-boldFont'>
          Practica conmigo,
        </h1>
        <h1 className='text sm:text-7xl md:text-4xl lg:text-5xl font-light capitalize font-boldFont'>
          Potencia tu Entrenamiento.
        </h1>
      </div>

    <div className='flex flex-col space-y-4 capitalize md:items-end'>

        {planSelectedValue == "Comunidad Gratuita" ? (
            <>
            <div className='flex space-x-2'>
              <CheckIcon className='w-6 h-6 text-[#ae9359]' />
              {/* <CheckCircleIcon className='text-green-500/80 w-5 h-5 md:w-8 md:h-8 text-[#ae9359]'/> */}

              <p className='text-base font-light'>
                Contenido de Flexibilidad, Fuerza y Respiración Gratuitas
              </p>
            </div>
            <div className='flex space-x-2'>
                <CheckIcon className='w-6 h-6 text-[#ae9359]'/>
                <p className='text-base font-light'>Info sobre movimientos para incorporar en tu Entrenamiento</p>
            </div>
            <div className='flex space-x-2 mb-2'>
                <CheckIcon className='w-6 h-6 text-[#ae9359]'/>
                <p className='text-base font-light'>Contenido Gratuito para la Comunidad de MForMovers</p>
            </div>
          </>
        ) : (
          <>
            <div className='flex space-x-2'>
              <div>
                <CheckCircleIcon
                  style={{ flex: '1 0 5%;' }}
                  className='w-6 h-6 text-[#ae9359]'
                />
              </div>
              <p className='text-base font-light'>
                Clases de Flexibilidad, Fuerza y Respiración Ilimitadas
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
                Clases Nuevas Para Todos Los Niveles, Todas Las Semanas
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
                Contenido Exclusivo para la Comunidad de MForMovers
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
                7 Días de Garantía (Para Miembros Nuevos)
              </p>
            </div>
          </>
        )}
      </div>
      <div
        className='flex md:items-end md:justify-end right-0 mt-10
    '
      >
        <Select
            options={planSelect}
            styles={colourStyles}
            placeholder={planSelectedValue || 'Nivel de clase'}
            className='w-72 mr-5'
            value={planSelectedValue}
            onChange={(e) => {
                setPlanSelected(plans.find(x => x.name === e.label && x.active))
                setPlanSelectedValue(e.value)
            }}
        />
      </div>
      {!auth.user && (
        <div
          onClick={() => (state.loginForm = true)}
          className='flex px-24 py-3 mt-6 bg-white text-black rounded-full justify-center items-center w-full md:w-96 group cursor-pointer '
        >
          <button className='w-full text-base md:text-lg'>Continuar </button>
        </div>
      )}
      <div className='w-full flex md:justify-end md:items-end'>
        {select === 'select' && auth.user ? (
          // <a target="_blank" href={`https://checkout-sbx.dlocalgo.com/validate/subscription/${planSelected?.plan_token}`} rel="noopener noreferrer" >
          <div
            onClick={handleClick}
            className='flex px-24 py-3 mt-6 bg-white text-black rounded-full justify-center items-center w-full md:w-96 group cursor-pointer '
          >
            {loading ? (
              <>
                <MiniLoadingSpinner />
              </>
            ) : (
              <button className='w-full text-base md:text-lg'>Continuar </button>
            )}
          </div>
        ) : (
          // </a>
          <Link href={'select-plan'} className={`${!auth.user && 'hidden'}`}>
            <div className='flex px-24 py-3 mt-6 bg-white text-black rounded-full justify-center items-center w-full md:w-96 group cursor-pointer '>
              <button className='w-full text-base md:text-lg'>Continuar </button>
          </div>
      </Link>

      )}
      </div>

      <div className='w-full flex md:justify-end md:items-end'>
      {planSelectedValue == "Comunidad Gratuita" ? (
            <div className='w-full md:w-96 flex flex-col justify-center items-center space-y-2 mt-5 text-center text-xs md:text-sm font-light'>
            <p>GRATIS </p>
            <p>Oportunidad única...</p>
            </div>
    ) : (
        <>
            <div className='w-full md:w-96 flex flex-col justify-center items-center space-y-4 mt-5 text-center text-xs md:text-sm font-light'>
                <p>{planSelected?.amount} {planSelected?.currency} facturado {planSelected?.frequency_label} {planSelected?.frequency_label === "Anual" && `(ahorra ${planSelected?.amount - 12 * (plans.find(x => x.frequency_label != planSelected?.frequency_label && x.frequency_value)?.amount ?? 0)} ${planSelected?.currency})`} facturado hoy.</p>
                <p>Enviamos recordatorio antes de facturar para evitar pagos no deseados.</p>
            </div>
        </>
      )}
      </div>


      <div className='flex flex-col space-y-2 py-16 md:space-y-4 justify-end lg:items-end mr-12 lg:mr-24  overflow-hidden'>
        <div className='absolute top-0 left-0 h-[100vh] w-full -z-10 overflow-hidden'>
          {/* <video src={'/video/videoTest3.mp4'} autoPlay loop muted={!snap.volumeIndex} className='object-cover h-full w-full'>

            </video> */}
          <CldImage
            src={'my_uploads/image00029_mtsdpo'}
            preserveTransformations
            width={1000}
            height={1000}
            className={`object-cover h-full w-full opacity-40`}
            alt={'Rutina Imagen'}
            loader={imageLoader}
          />
        </div>
      </div>
    </div>
  );
};

export default SelectYourPlan;
