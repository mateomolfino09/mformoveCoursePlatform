'use client'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import React, { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { usePathname, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify'
import { CiInstagram, CiMail, CiYoutube } from 'react-icons/ci'
import { routes } from '../../../constants/routes'

const Footer = () => {
const auth = useAuth()
const router = useRouter()
const { register, handleSubmit, formState: { errors,  } } = useForm()
const [message, setMessage] = useState("");
const [status, setStatus] = useState<number>(0);
const [loading, setLoading] = useState<boolean>(false);
const path = usePathname()

const email = "info@mateomove.com";
  const subject = encodeURIComponent("Consulta sobre tus servicios");
  const body = encodeURIComponent(
    `Hola Mateo,\n\nEstoy interesado en conocer más sobre tus servicios y tengo algunas dudas.\n\nEspecíficamente, me gustaría saber sobre:\n- [Especifica aquí tu consulta]\n\nTambién quisiera saber si hay opciones para solucionar [cualquier problema o inquietud].\n\n¡Gracias de antemano! Espero tu respuesta.\n\nSaludos,\n[Tu Nombre]`
  );

  const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

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
    <div className='bg-black w-full h-auto md:h-72 flex flex-col md:flex-row justify-start md:justify-around scrollbar-hide space-x-12 md:space-x-2 overflow-hidden relative bottom-0'>
        <div className='text-white md:max-w-[33%] md:h-full flex flex-row space-x-6 pt-12 !mx-0 overflow-x-hidden px-8 md:px-0 md:items-start md:justify-center md:pl-8 relative md:top-12'>
          <Link href={'https://www.instagram.com/mateo.move/#'} target="_blank"> 
            <CiInstagram  className='w-8 h-8 opacity-60 cursor-pointer'/>
          </Link>
          <Link href={'https://www.youtube.com/@mateomolfino4254'} target="_blank"> 
          <CiYoutube  className='w-8 h-8 opacity-60 cursor-pointer'/>
          </Link>
          <a
            href={mailtoLink}
            className=""
          >
            <CiMail  className='w-8 h-8 opacity-60 cursor-pointer'/>
          </a>
        </div>
        <div className='text-white md:max-w-[33%] flex flex-col space-y-12 pt-12 !mx-0 px-8 overflow-x-hidden md:items-center md:left-7 relative'>
        <Link href={`${path === routes.navegation.selectPlan ? routes.navegation.membresiaHome : path === routes.navegation.membresiaHome ? "/" : "/"}`}>
              <img
                alt='icon image'
                src='/images/MFORMOVE_blanco03.png'
                width={300}
                height={300}
                className='cursor-pointer object-contain transition duration-500 hover:scale-105 opacity-50 md:mt-12 text-start'
              />
            </Link>
        </div>
        <div className='text-white md:max-w-[33%] flex items-start justify-start flex-col md:pl-0 space-y-2 !mx-8 mb-8 mt-12 md:pt-12 md:pr-4 overflow-x-hidden'>
            <a target='_blank' href="/documents/terms-and-conditions.pdf" download="documents/terms-and-conditions.pdf" rel='noopener noreferrer' className="text-xs font-light md:mb-2 hover:underline focus:underline cursor-pointer">Términos y Condiciones</a>
            <a target='_blank' href="/privacy" rel='noopener noreferrer' className="text-xs font-light md:mb-2 hover:underline focus:underline cursor-pointer"> Políticas de Privacidad </a>
            {/* <p className=''>Políticas de privacidad </p> */}
            <p className='text-xs font-light md:mb-2 hover:underline focus:underline cursor-pointer'>@ 2024 Todos los derechos reservados. </p>
            <p className='text-xs font-light md:mb-2'>Desarrollo de MForMove </p>
        </div>
    </div>
  )
}

export default Footer