'use client'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import React, { useState } from 'react'
import { BiRightArrow } from 'react-icons/bi'
import { BsInstagram, BsMailbox } from 'react-icons/bs'
import { MdMail, MdMailOutline } from 'react-icons/md'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify'
import { MiniLoadingSpinner } from './PageComponent/Products/MiniSpinner'

const Footer = () => {
const auth = useAuth()
const router = useRouter()
const { register, handleSubmit, formState: { errors,  } } = useForm()
const [message, setMessage] = useState("");
const [status, setStatus] = useState<number>(0);
const [loading, setLoading] = useState<boolean>(false);

function validateEmail(email: string) {
    // Regular expression for basic email validation
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Test the email against the regular expression
    return re.test(String(email).toLowerCase());
  }

const onSubmit = async (data: any) => {
    console.log(data)
    setLoading(true)
    let email = data.email;
    if(!validateEmail(email)) {
      setMessage(
        "Error. Ingresa un email válido"
      )
      setLoading(false)
      return
    }
  
    {
      try {
        const response = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        });
        const datas = await response.json();
        if (datas.status >= 400) {
          setStatus(datas.status);
          if(datas.title == "Member Exists") toast.error(
            "Esta cuenta ya pertenece a la lista."
          );
          else toast.error(
            "Error al unirte. Contactanos directamente via Instagram!."
          );
  
          setLoading(false)
          return;
        }

        setLoading(false)
        setStatus(201);
        toast.success("Gracias por subscribirte! 👻.");

      } catch (error) {
        console.log(error)
        setStatus(500);
        setMessage(
          "Error al unirte. Contactanos directamente via Instagram!."
        );
        setTimeout(() => {
          setMessage("");
        }, 2000);
      }
    }
    }

  return (
    <div className='bg-white w-full h-auto md:h-72 flex flex-col md:flex-row justify-start md:justify-between scrollbar-hide space-x-12 overflow-hidden relative bottom-0'>
        <div className='text-black flex flex-col md:flex-col pt-12 pl-8 '>
            <h3 className='text-base md:text-lg mb-2'>Newsletter: </h3>
            <form onSubmit={handleSubmit(onSubmit)} className='border-b-black border-b-[1px] flex md:w-full w-80  group mb-2'>
                <input placeholder='email' type="email"  {...register('email')} className="relative m-0 block w-[1px] min-w-0 flex-auto rounded-r  bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3]  focus:text-neutral-700 focus:outline-none focus:border-none  dark:placeholder:text-neutral-500/80 dark:placeholder:font-light"
                                aria-label="Sizing example input"
                                aria-describedby="inputGroup-sizing-default" />
                                {loading ? (
                                    <>
                                    <MiniLoadingSpinner />
                                    </>
                                ) : (
                                    <>
                                    <button type='submit'>
                                        <ArrowRightIcon className='w-5 h-5 group-hover:translate-x-2 transition-all cursor-pointer' />
                                    </button>
                                    </>
                                )}

            </form>
            <p className='text-xs md:text-sm'>Subscribete hoy para todas las actualizaciones y promociones</p>
        </div>
        <div className='text-black flex flex-col space-y-12 pt-12 !mx-0 px-6 overflow-x-hidden'>
            <div className='flex w-full flex-col md:pl-0 space-y-4 md:space-y-0 md:flex-row md:space-x-5'>
                {/* <Link href={'/home'}> */}
                <div style={{flex: '1 1 0px;'}} className='md:w-1/4 w-full flex justify-center items-center'>
                    <h4 className='font-light text-sm md:text-base w-full md:text-center' >Home page</h4>
                </div>
                <div style={{flex: '1 1 0px;'}} className='md:w-1/4 w-full'>
                    <h4 className='font-light text-sm md:text-base md:text-center' >Memberships</h4>
                </div>
                {/* <div style={{flex: '1 1 0px;'}} className='md:w-1/4 w-full'>
                    <h4 className='font-light text-sm md:text-base md:text-center' >Sobre Nosotros</h4>

                </div> */}
     
                {/* </Link> */}
                {/* <Link href={'/membership'}> */}
                {/* </Link> */}
                {/* <Link href={'/aboutUs'}> */}
                {/* </Link> */}
                {auth.user ? (
                    <div style={{flex: '1 1 0px;'}} className='md:w-1/4 w-full'>
                    <h4 className='font-light text-sm md:text-base md:text-center' >Mi Cuenta</h4>

                    </div>
                // <Link href={'/account'}>
                // </Link>
                ) : (
                    <div style={{flex: '1 1 0px;'}} className='md:w-1/4 w-full'>
                        <h4 className='font-light text-sm md:text-base md:text-center' >Log In</h4>

                    </div>
                // <Link href={'/login'}>
                // </Link>
                )}
            </div>
            <div className='flex w-full flex-row md:justify-center justify-start space-x-6 md:pl-0'>
                <BsInstagram className='md:w-6 md:h-6 w-5 h-5 cursor-pointer' onClick={() => router.push('https://www.instagram.com/mformove_/')}/>
                    <a href="mailto:info@mateomove.com?subject=Contacto%20Here&body=Tu mensaje aqui.">
                        <MdMailOutline className='md:w-7 md:h-7 w-6 h-6'/>
                    </a>
            </div>
        </div>
        <div className='text-black flex items-start justify-start flex-col md:pl-0 space-y-2 !mx-6 mb-8 mt-12 md:pt-12 md:pr-4 overflow-x-hidden'>
            <a target='_blank' href="/documents/terms-and-conditions.pdf" download="documents/terms-and-conditions.pdf" rel='noopener noreferrer' className="text-xs font-light md:mb-2 hover:underline focus:underline cursor-pointer"> Términos y Condiciones</a>
            <a target='_blank' href="/privacy" rel='noopener noreferrer' className="text-xs font-light md:mb-2 hover:underline focus:underline cursor-pointer"> Políticas de Privacidad </a>
            {/* <p className=''>Políticas de privacidad </p> */}
            <p className='text-xs font-light md:mb-2 hover:underline focus:underline cursor-pointer'>@ 2024 Todos los derechos reservados. </p>
            <p className='text-xs font-light md:mb-2'>Desarrollo de MForMove </p>
        </div>
    </div>
  )
}

export default Footer