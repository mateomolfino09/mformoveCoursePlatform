import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import imageLoader from '../imageLoader'
import axios from 'axios'
import { toast } from 'react-toastify'
import { LoadingSpinner } from './LoadingSpinner'
interface Props {
    setEmail: (email: string) => void
    step0ToStep1: any
}

const RegisterStepCero = ({ setEmail, step0ToStep1 }: Props) => {
    const [email, setEmailStep] = useState('')
    const [loading, setLoading] = useState(false)

    const handleClick = async () => {
      if(!email.includes('@')) {
        toast.error('Ingresa un email válido')
        return
      } 
      setLoading(true)

        try {
            const config = {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            let { data } = await axios.post('/api/user/email/verifyEmail', { email }, config)

            

            setEmail(email)
            step0ToStep1()



        } catch (error: any) {
            toast.error(error.response.data.message)
        }

        setLoading(false)

    }

  return (
    <div className={`h-full w-full relative flex flex-col md:items-center md:justify-center bg-black`}>
    {/* Logo position */}
    <header className=''>
    <Link href={'/'}>

        <img
                alt='icon image'
        src="/images/logo.png"
        className="left-4 top-4 cursor-pointer object-contain md:left-10 md:top-6 transition duration-500 hover:scale-105"
        width={150}
        height={150}
        />
        </Link>
        <Link href={"/src/user/login"}> 
          <button type='button' className='text-white text-sm rounded-md hover:underline ml-2 bg-light-red w-16 h-8 md:w-20 '>Sign In</button>
        </Link>
    </header>
    <Image
      src={'/images/bgIndex2.jpg'}
      layout="fill"
    className="!inline opacity-50"
      objectFit="cover"
      alt='icon image'
      loader={imageLoader}
    />
    {loading ? (
      <>
      <LoadingSpinner />
      </>
    ) : (
      <>
          <div className='flex flex-col items-center justify-center relative mt-48 space-y-8 rounded py-12 md:-mt-24'>
        <h1 className='font-extrabold text-4xl text-center'>Lleva al siguiente nivel tus conocimientos de peluqueria</h1>
        <h2 className='font-semibold text-xl text-center'>Pronto para aprender? Ingresa tu email para crear tu cuenta.</h2>
    </div>
    <div className='flex items-center justify-center relative space-x-8 rounded px-8 md:w-full'>
      <div className='w-2/3 bg-transparent md:w-[40%] lg:w-[30%]'>
          <label className='inline-block w-full'>
              <input type="email"
              placeholder='Email' 
              className='inputRegister'
              value={email}
              onChange={e => setEmailStep(e.target.value)}
              />
          </label>
      </div>
    <button onClick={() => handleClick()} className='w-1/3 rounded bg-light-red py-3 font-semibold md:w-[20%] lg:w-[10%]'>Empezar! </button>
    </div>
      </>
    )}


  </div>
  )
}

export default RegisterStepCero