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
    step1ToStep2: any
    setData: any
}

const RegisterStepOne = ({ step1ToStep2, setData }: Props) => {
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [gender, setGender] = useState('')
    const [country, setCountry] = useState('')

    const handleClick = () => {
        if(firstname == '' || lastname == '' || gender == '' ||  country == '' || firstname.length <= 2 || lastname.length <= 2) {
            toast.error('Hay un error en los datos que ingresó, rellene todos los campos o vuelva a intentar')
            console.log('hola')
        } else {
            setData(firstname, lastname, gender, country)
            step1ToStep2()

        }

    }

  return (
    <div className={`h-full w-full relative flex flex-col md:items-center md:justify-center bg-white`}>
    {/* Logo position */}
    <div className='flex flex-col items-center justify-center relative mt-48 space-y-4 rounded py-12 md:-mt-24'>
        <AiOutlineCheckCircle className='text-light-red w-12 h-12'/>
        <p className='font-extralight text-black text-base'>PASO 1 DE 3</p>
        <h1 className='font-extrabold text-4xl text-center text-black'>Completa tu Nombre, Apellidos, Pais y Género</h1>
        <h2 className='font-normal text-xl text-center text-black'>Pronto para aprender? Ingresa los datos para crear tu cuenta.</h2>
    </div>
    <div className='flex flex-col items-center justify-center relative space-y-8 rounded px-8 md:w-full'>
        <div className='space-x-4 flex'>
                <label className=''>
                    <input type="nombre"
                    placeholder='Nombre' 
                    className='input transition duration-1000 placeholder:text-white'
                    value={firstname}
                    onChange={e => setFirstname(e.target.value)}
                    />
            </label>
                <label className=''>
                    <input type="apellido"
                    placeholder='Apellidos' 
                    className='input transition duration-1000 placeholder:text-white'
                    value={lastname}
                    onChange={e => setLastname(e.target.value)}
                    />
                </label>
        </div>
        <div className='space-x-4 flex'>
                <Select 
                options={genders} 
                styles={colourStyles}
                placeholder={gender || 'Género'}
                className='w-52'
                value={gender}
                onChange={e => { 
                    return setGender(e.label)
                    }}/>
                <Select 
                options={countries}
                 styles={colourStyles} 
                 className=' w-56' 
                 placeholder={country || 'País'}
                 value={country}
                 onChange={e => {
                 console.log(e.label)
                 return setCountry(e.label)}}/>

        </div>
        <div className='space-x-4 flex'>

        </div>
    <button onClick={() => handleClick()} className='w-1/3 rounded bg-light-red py-3 font-semibold md:w-[20%] lg:w-[10%]'>Siguiente! </button>
    </div>
  </div>
  )
}

export default RegisterStepOne