import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline'
import React, { useState } from 'react'
import { CheckmarkIcon } from 'react-hot-toast'
import { Plan } from '../../../../typings'
import Select, { StylesConfig } from 'react-select';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import endpoints from '../../../services/api';
import { toast } from 'react-toastify';

interface Props {
    plans: Plan[]
    select: string
}

const SelectYourPlan = ({ plans, select = "" }: Props) => {
    const [planSelected, setPlanSelected] = useState<Plan | null | undefined>(plans[0])
    const auth = useAuth()
    const planSelect = plans.map((p: Plan) => {
        return {
            value: p.frequency_value,
            label: p.frequency_label
        }
    }
    ) 
    const [planSelectedValue, setPlanSelectedValue] = useState<string>(planSelect[0].label)

    const handleClick = async () => {
        if(!auth.user) {
            toast.error('Usuario no encontrado')
            return
        }
        const email = auth.user.email
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
    <h1 className='text-4xl md:text-5xl font-light mb-12 px'>Selecciona tu plan</h1>
    <div className='flex flex-col space-y-4'>
        <div className='flex space-x-2'>
            <CheckIcon className='w-6 h-6 text-[#ae9359]'/>
            <p className='text-base font-light'>Unlimited Yoga, Breathwork, Meditation, and Movement classes</p>
        </div>
        <div className='flex space-x-2'>
            <CheckIcon className='w-6 h-6 text-[#ae9359]'/>
            <p className='text-base font-light'>Clases nuevas todas las semanas</p>
        </div>
        <div className='flex space-x-2'>
            <CheckIcon className='w-6 h-6 text-[#ae9359]'/>
            <p className='text-base font-light'>Clases para todos los niveles</p>
        </div>
        <div className='flex space-x-2'>
            <CheckIcon className='w-6 h-6 text-[#ae9359]'/>
            <p className='text-base font-light'>Clases para todos los niveles</p>
        </div>
    </div>
    <div className=' right-0 mt-4
    '>
        <Select
            options={planSelect}
            styles={colourStyles}
            placeholder={planSelectedValue || 'Nivel de clase'}
            className='w-full sm:w-full'
            value={planSelectedValue}
            onChange={(e) => {
                setPlanSelected(plans.find(x => x.frequency_label === e.label))
                setPlanSelectedValue(e.label)
            }}
        />
    </div>
    {!auth.user && (
        <a href={`/login`} rel="noopener noreferrer">
        <div className='flex px-24 py-3 mt-6 bg-white text-black rounded-full justify-center items-center w-full md:w-96 group cursor-pointer '>
            <button className='w-full text-base md:text-lg'>Continuar </button>
        </div>     
        </a>
    )}
    {select === "select" && auth.user ? (
        <a target="_blank" href={`https://checkout-sbx.dlocalgo.com/validate/subscription/${planSelected?.plan_token}`} rel="noopener noreferrer" onClick={handleClick}>
        <div className='flex px-24 py-3 mt-6 bg-white text-black rounded-full justify-center items-center w-full md:w-96 group cursor-pointer '>
            <button className='w-full text-base md:text-lg'>Continuar </button>
        </div>     </a>
    ) : (
    <Link href={'select-plan'} className={`${!auth.user && "hidden"}`}>
        <div className='flex px-24 py-3 mt-6 bg-white text-black rounded-full justify-center items-center w-full md:w-96 group cursor-pointer '>
            <button className='w-full text-base md:text-lg'>Continuar </button>
        </div>
    </Link>

    )}
    <div className='w-full md:w-96 flex flex-col justify-center items-center space-y-2 mt-5 text-center text-xs md:text-sm font-light'>
        <p>$0.00 debido hoy.</p>
        <p>7 dias gratis (para miembros nuevos) luego {planSelected?.amount} {planSelected?.currency} facturado {planSelected?.frequency_label} {planSelected?.frequency_label === "Anual" && `(ahorra ${12 * (plans.find(x => x.frequency_label != planSelected?.frequency_label)?.amount ?? 0) - planSelected?.amount } ${planSelected?.currency})`} </p>
        <p>Enviamos recordatorio antes de facturar para evitar pagos no deseados.</p>
    </div>
  </div>
  
  )
}

export default SelectYourPlan