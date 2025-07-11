'use client'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import React, { useState } from 'react'
import { BiRightArrow } from 'react-icons/bi'
import { BsInstagram, BsMailbox } from 'react-icons/bs'
import { MdMail, MdMailOutline } from 'react-icons/md'
import { useAuth } from '../../../hooks/useAuth'
import { usePathname, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify'
import { MiniLoadingSpinner } from '../../PageComponent/Products/MiniSpinner'
import state from '../../../valtio'

const NewsletterF = () => {
const auth = useAuth()
const router = useRouter()
const { register, handleSubmit, formState: { errors,  } } = useForm()
const [message, setMessage] = useState("");
const [status, setStatus] = useState<number>(0);
const [loading, setLoading] = useState<boolean>(false);
const path = usePathname()

function validateEmail(email: string) {
    // Regular expression for basic email validation
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Test the email against the regular expression
    return re.test(String(email).toLowerCase());
  }

const onSubmit = async (data: any) => {
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
    <div className='bg-gradient-to-bl w-full h-auto flex flex-col md:flex-col justify-start md:justify-center items-center scrollbar-hide space-x-16 overflow-hidden relative bottom-0 pb-12 md:pb-24 lg:px-24 md:px-20 '>
        <div className='text-white flex flex-col items-center justify-center md:flex-col space-y-3 pl-8 pr-12 w-full'>
            <h3 className='text-3xl md:text-4xl font-normal'>Unite a la comunidad de movimiento</h3>
            <p className='text-base md:text-lg font-light md:w-[70%] md:text-center'>Esta no es cualquier newsletter deportiva... </p>
            <p className='text-base md:text-lg font-bold italic md:w-[70%] md:text-center'>Es salud, movimiento, cambio, pensamiento crítico, desarrollo personal y creativo.</p>
            <p className='text-sm md:text-base font-light md:w-[70%] md:text-center'>Si no te interesa, mejor no te suscribas, porque vas a recibir mails con tips para tu practica de movimiento y salud fisica junto a reflexiones para pensar, cuestionar y ver el cuerpo (y la vida)de otra manera.</p>
            <form onSubmit={handleSubmit(onSubmit)} className='border-b-white border-b-[1px] flex md:w-96 w-80  group mb-2 !mt-8'>
                <input placeholder='Correo electrónico' type="email"  {...register('email')} className="relative m-0 block w-[1px] min-w-0 flex-auto rounded-r  bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-200 outline-none transition duration-200 ease-in-out focus:z-[3]  focus:text-neutral-200 focus:outline-none focus:border-none  dark:placeholder:text-neutral-500/80 dark:placeholder:font-light"
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
        </div>
    </div>
  )
}

export default NewsletterF