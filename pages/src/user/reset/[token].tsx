import imageLoader from '../../../../imageLoader'
import axios from 'axios'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

function Token() {
  const [password, setPassword] = useState('')
  const [conPassword, setConPassword] = useState('')
  const router = useRouter()
  const { token } = router.query

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      }

      const { data } = await axios.put(
        `/api/user/reset/${token}`,
        { conPassword, password },
        config
      )
      toast.success(data.message)
    } catch (error: any) {
      toast.error(error?.response?.data?.error)
    }
    router.push('/src/user/login')
  }

  return (
    <div className='relative flex h-screen w-screen flex-col bg-black md:items-center md:justify-center md:bg-transparent'>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='h-full w-full relative flex flex-col md:items-center md:justify-center'>
        <Image
          src='/images/bgIndex2.jpg'
          layout='fill'
          className='-z-10 !hidden opacity-60 sm:!inline'
          objectFit='cover'
          alt='icon image'
          loader={imageLoader}
        />
        {/* Logo position */}
        <img
          src='/images/logo.png'
          className='absolute left-4 top-4 cursor-pointer object-contain md:left-10 md:top-6 transition duration-500 hover:scale-105'
          width={150}
          alt='icon image'
          height={150}
        />
        <div className='relative mt-24 space-y-8 rounded bg-black/75 py-10 px-6 md:mt-0 md:max-w-lg md:px-14'>
          <h1 className='text-4xl font-semibold'>Resetear Contraseña</h1>
          <form className='relative space-y-8 md:mt-0 md:max-w-lg'>
            <label className='inline-block w-full'>
              <input
                type='password'
                placeholder='Nueva Contraseña'
                className='input'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className='inline-block w-full'>
              <input
                type='password'
                placeholder='Confirmar Contraseña'
                className='input'
                value={conPassword}
                onChange={(e) => setConPassword(e.target.value)}
              />
            </label>

            <button
              className='w-full bg-black/10 border border-white rounded-md transition duration-500 hover:bg-black py-3 font-semibold'
              onClick={(e) => handleSubmit(e)}
            >
              Resetear
            </button>
          </form>
          <div className='space-y-4'>
            <Link href={'/src/user/login'}>
              <button
                type='button'
                className='text-white underline cursor-pointer'
              >
                Volver al Inicio
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Token
