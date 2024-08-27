import { ArrowRightIcon, CheckCircleIcon, CheckIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { CheckmarkIcon } from 'react-hot-toast'
import { Plan } from '../../../../typings'
import Select, { StylesConfig } from 'react-select';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import endpoints from '../../../services/api';
import { toast } from 'react-toastify';
import state from '../../../valtio';
import { useRouter } from 'next/navigation';

interface Props {
    plans: Plan[]
    select: string
}

const SelectYourPlan = ({ plans, select = "" }: Props) => {
    const [planSelected, setPlanSelected] = useState<Plan | null | undefined>(plans[0])
    const auth = useAuth()
    const router = useRouter()
    const planSelect = [
        {
            value: "Membresía Gratis",
            label: "Membresía Gratis"
        },
        ...plans.map((p: Plan) => {
            return {
                value: p.name,
                label: p.name
            }
        }) 
    ]

    useEffect(() => {
        
        if(!auth.user) {
          auth.fetchUser()
        }    
    
      }, []);

    
    const [planSelectedValue, setPlanSelectedValue] = useState<string>(planSelect[0].value)
    console.log(planSelect, planSelectedValue)


    const handleClick = async () => {
        if(!auth.user) {
            toast.error('Usuario no encontrado')
            return
        }
        const email = auth.user.email

        if(planSelectedValue != "Membresía Gratis") {
            const res = await fetch(endpoints.payments.createPaymentToken, {
                method: 'POST',
                headers: {  
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
              })
    
            const data = await res.json()
    
            const { token } = data
            console.log(token)
            Cookies.set('userPaymentToken', token ? token : '', { expires: 5})
            router.push(`https://checkout-sbx.dlocalgo.com/validate/subscription/${planSelected?.plan_token}`)
        }
        else {
            const res = await fetch(endpoints.payments.createFreeMembership, {
                method: 'POST',
                headers: {  
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
              })
    
            const data = await res.json()
    
            const { message } = data
        }

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
    <div className='w-full px-3 mt-24 mb-9 lg:right-1/4 md:right-32 flex flex-col lg:pl-36 lg:py-8'>
        <div className='flex md:space-y-1 flex-col mb-12 items-start pl-2 justify-start'>
            <h1 className='text-4xl md:text-5xl font-light capitalize font-boldFont'>Practica conmigo,</h1>
            <h1 className='text-4xl md:text-5xl font-light capitalize font-boldFont'>Aprende mi métodología,</h1>
            <h1 className='text-4xl md:text-5xl font-light capitalize font-boldFont'>Potencia tu Entrenamiento.</h1>
        </div>



    <div className='flex flex-col space-y-4 capitalize'>

        {planSelectedValue == "Membresía Gratis" ? (
            <>
            <div className='flex space-x-2'>
            <CheckIcon className='w-6 h-6 text-[#ae9359]'/>
            {/* <CheckCircleIcon className='text-green-500/80 w-5 h-5 md:w-8 md:h-8 text-[#ae9359]'/> */}

            <p className='text-base font-light'>Clases de Flexibilidad, Fuerza y Respiración Gratuitas</p>
            </div>
            <div className='flex space-x-2'>
                <CheckIcon className='w-6 h-6 text-[#ae9359]'/>
                <p className='text-base font-light'>Info sobre mi metodología para incorporar en tu Entrenamiento</p>
            </div>
            <div className='flex space-x-2 mb-2'>
                <CheckIcon className='w-6 h-6 text-[#ae9359]'/>
                <p className='text-base font-light'>Contenido Exclusivo y Gratuito para la Comunidad de MForMovers</p>
            </div>
            </>
        ) : (
            <>
                <div className='flex space-x-2'>
                  <div>
                        <CheckCircleIcon style={{flex: "1 0 5%;"}} className='w-6 h-6 text-[#ae9359]'/>
                    </div>
                    <p className='text-base font-light'>Rutina de Flexibilidad</p>
                </div>
                <div className='flex space-x-2'>
              <div>
                        <CheckCircleIcon style={{flex: "1 0 5%;"}} className='w-6 h-6 text-[#ae9359]'/>
                    </div>
                <p className='text-base font-light'>Clases de Flexibilidad, Fuerza y Respiración Exclusivas</p>
                </div>
                <div className='flex space-x-2'>
                  <div>
                        <CheckCircleIcon style={{flex: "1 0 5%;"}} className='w-6 h-6 text-[#ae9359]'/>
                    </div>
                    <p className='text-base font-light'>Asesoramiento Personal Semanal</p>
                </div>
                <div className='flex space-x-2'>
                  <div>
                        <CheckCircleIcon style={{flex: "1 0 5%;"}} className='w-6 h-6 text-[#ae9359]'/>
                    </div>
                    <p className='text-base font-light'>Info EXCLUSIVA sobre mi metodología para incorporar en tu Entrenamiento</p>
                </div>
                <div className='flex space-x-2'>
                    <div>
                        <CheckCircleIcon style={{flex: "1 0 5%;"}} className='w-6 h-6 text-[#ae9359]'/>
                    </div>
                    <p className='text-base font-light'>Contenido Exclusivo para la Comunidad de MForMovers</p>
                </div>
            </>
        )}
    </div>
    <div className=' right-0 mt-4
    '>
        <Select
            options={planSelect}
            styles={colourStyles}
            placeholder={planSelectedValue || 'Nivel de clase'}
            className='w-72 ml-3'
            value={planSelectedValue}
            onChange={(e) => {
                setPlanSelected(plans.find(x => x.name === e.label))
                setPlanSelectedValue(e.value)
            }}
        />
    </div>
    {!auth.user && (    
        <div onClick={() => state.loginForm = true} className='flex px-24 py-3 mt-6 bg-white text-black rounded-full justify-center items-center w-full md:w-96 group cursor-pointer '>
            <button className='w-full text-base md:text-lg'>Continuar </button>
        </div>     
    )}
    {select === "select" && auth.user ? (
        // <a target="_blank" href={`https://checkout-sbx.dlocalgo.com/validate/subscription/${planSelected?.plan_token}`} rel="noopener noreferrer" >
        <div onClick={handleClick} className='flex px-24 py-3 mt-6 bg-white text-black rounded-full justify-center items-center w-full md:w-96 group cursor-pointer '>
            <button className='w-full text-base md:text-lg'>Continuar </button>
        </div>     
        // </a>
    ) : (
    <Link href={'select-plan'} className={`${!auth.user && "hidden"}`}>
        <div className='flex px-24 py-3 mt-6 bg-white text-black rounded-full justify-center items-center w-full md:w-96 group cursor-pointer '>
            <button className='w-full text-base md:text-lg'>Continuar </button>
        </div>
    </Link>

    )}
    {planSelectedValue == "Membresía Gratis" ? (
            <div className='w-full md:w-96 flex flex-col justify-center items-center space-y-2 mt-5 text-center text-xs md:text-sm font-light'>
            <p>GRATIS </p>
            <p>Oportunidad única...</p>
            </div>
    ) : (
        <>
            <div className='w-full md:w-96 flex flex-col justify-center items-center space-y-2 mt-5 text-center text-xs md:text-sm font-light'>
                <p>{planSelected?.amount} {planSelected?.currency} facturado {planSelected?.frequency_label} {planSelected?.frequency_label === "Anual" && `(ahorra ${12 * (plans.find(x => x.frequency_label != planSelected?.frequency_label)?.amount ?? 0) - planSelected?.amount } ${planSelected?.currency})`} </p>
                <p>Enviamos recordatorio antes de facturar para evitar pagos no deseados.</p>
            </div>
        </>
    )}

  </div>
  
  )
}

export default SelectYourPlan