import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import imageLoader from '../imageLoader'
import { AiOutlineCheckCircle } from 'react-icons/ai'
import { genders } from '../constants/genders'
import { countries } from '../constants/countries'
import Select, { StylesConfig } from 'react-select'
import { ConsoleConstructorOptions } from 'console'
import { toast } from 'react-toastify'

const colourStyles: StylesConfig<any> = {
    control: (styles) => ({ ...styles, backgroundColor: '#333', height: 55, borderRadius: 6,padding: 0 }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => { 
        return { ...styles, color: '#808080',}
    },
    input: (styles) => ({ ...styles, backgroundColor: '', color: '#fff'}),
    placeholder: (styles) => ({ ...styles, color: '#fff' }),
    singleValue: (styles, { data }) => ({ ...styles, color: '#808080' }),
    
  };

interface Props {
    step2ToStep3: any
    setData: any
}

const RegisterStepOne = ({ step2ToStep3, setData }: Props) => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleClick = () => {
      console.log(password.length)
        if(password != confirmPassword ) {
            toast.error('Las contraseñas no coinciden')
        } 
        else if(password.length < 8) {
          toast.error('La contraseña debe contener almenos 8 caracteres')
          console.log('hola')
        } 
        else {
            setData(password, confirmPassword)
            step2ToStep3()

        }

    }

  return (
    <div className={`h-full w-full relative flex flex-col md:items-center md:justify-center bg-white`}>
    {/* Logo position */}
    <div className='flex flex-col items-center justify-center relative mt-48 space-y-4 rounded py-12 md:-mt-24'>
        <AiOutlineCheckCircle className='text-light-red w-12 h-12'/>
        <p className='font-extralight text-black text-base'>PASO 2 DE 3</p>
        <h1 className='font-extrabold text-4xl text-center text-black'>Ya estamos por terminar!</h1>
        <h2 className='font-normal text-xl text-center text-black'>Crea una contraseña segura para tu cuenta</h2>
    </div>
    <div className='flex flex-col items-center justify-center relative space-y-8 rounded px-8 md:w-full'>
        <div className='space-x-4 flex'>
                <label className=''>
                    <input type="password"
                    placeholder='Contraseña' 
                    className='input transition duration-1000'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    />
            </label>
                <label className=''>
                    <input type="password"
                    placeholder='Confirmar Contraseña' 
                    className='input transition duration-1000'
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    />
                </label>
        </div>
        <div className='space-x-4 flex'>

        </div>
    <button onClick={() => handleClick()} className='w-1/3 rounded bg-light-red py-3 font-semibold md:w-[20%] lg:w-[10%]'>Siguiente! </button>
    </div>
  </div>
  )
}

export default RegisterStepOne