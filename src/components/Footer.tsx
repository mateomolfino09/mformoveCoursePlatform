'use client'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import React from 'react'
import { BiRightArrow } from 'react-icons/bi'
import { BsInstagram, BsMailbox } from 'react-icons/bs'
import { MdMail, MdMailOutline } from 'react-icons/md'
import { useAuth } from '../hooks/useAuth'

const Footer = () => {
const auth = useAuth()

  return (
    <div className='bg-white w-full h-auto md:h-72 flex flex-col md:flex-row justify-start md:justify-between scrollbar-hide space-x-12 overflow-hidden relative bottom-0'>
        <div className='text-black flex flex-col md:flex-col pt-12 pl-8 '>
            <h3 className='text-base md:text-lg mb-2'>Newsletter: </h3>
            <div className='border-b-black border-b-[1px] flex md:w-full w-80  group mb-2'>
                <input placeholder='email' type="text" className="relative m-0 block w-[1px] min-w-0 flex-auto rounded-r  bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3]  focus:text-neutral-700 focus:outline-none focus:border-none  dark:placeholder:text-neutral-500/80 dark:placeholder:font-light"
                                aria-label="Sizing example input"
                                aria-describedby="inputGroup-sizing-default" />
                <ArrowRightIcon className='w-5 h-5 group-hover:translate-x-2 transition-all' />
            </div>
            <p className='text-xs md:text-sm'>Susbribite hoy para todas las actualizaciones y promociones</p>
        </div>
        <div className='text-black flex flex-col space-y-12 pt-12 !mx-0 px-6 overflow-x-hidden'>
            <div className='flex w-full flex-col md:pl-0 space-y-4 md:space-y-0 md:flex-row md:space-x-5'>
                <Link href={'/home'}>
                    <h4 className='font-light text-sm md:text-base w-full'>Home page</h4>
                </Link>
                <Link href={'/membership'}>
                    <h4 className='font-light text-sm md:text-base'>Memberships</h4>
                </Link>
                <Link href={'/aboutUs'}>
                    <h4 className='font-light text-sm md:text-base'>Sobre Nosotros</h4>
                </Link>
                {auth.user ? (

                <Link href={'/account'}>
                    <h4 className='font-light text-sm md:text-base'>Mi Cuenta</h4>
                </Link>
                ) : (
                <Link href={'/login'}>
                <h4 className='font-light text-sm md:text-base'>Log In</h4>
                </Link>
                )}
            </div>
            <div className='flex w-full flex-row md:justify-center justify-start space-x-6 md:pl-0'>
                <BsInstagram className='md:w-6 md:h-6 w-5 h-5'/>
                <MdMailOutline className='md:w-7 md:h-7 w-6 h-6'/>
            </div>
        </div>
        <div className='text-black flex items-start justify-start flex-col md:pl-0 space-y-2 !mx-6 mb-8 mt-12 md:pt-12 md:pr-4 overflow-x-hidden'>
            <p className='text-xs font-light md:mb-2 hover:underline focus:underline cursor-pointer'>Términos del servicio: </p>
            <p className='text-xs font-light md:mb-2 hover:underline focus:underline cursor-pointer'>Políticas de privacidad </p>
            <p className='text-xs font-light md:mb-2 hover:underline focus:underline cursor-pointer'>@ 2024 Todos los derechos reservados. </p>
            <p className='text-xs font-light md:mb-2'>Hecho por MForMove </p>
        </div>
    </div>
  )
}

export default Footer