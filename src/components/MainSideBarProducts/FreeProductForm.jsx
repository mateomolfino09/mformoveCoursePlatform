'use client'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { BiRightArrow } from 'react-icons/bi'
import { BsInstagram, BsMailbox } from 'react-icons/bs'
import { MdMail, MdMailOutline } from 'react-icons/md'
import { useAuth } from '../../hooks/useAuth'
import { useForm } from 'react-hook-form'
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import './freeProductStyle.css'

const FreeProductForm = ({ product, setRef }) => {
const auth = useAuth()
const { register, handleSubmit, formState: { errors,  } } = useForm()
const rowRef = useRef(null);
const scrollRowRef = useRef(null);
const theWidth = rowRef.current?.scrollWidth
? -(rowRef.current?.scrollWidth - rowRef.current?.offsetWidth)
: 0;
const [width, setWidth] = useState(theWidth);

useEffect(() => {
  if (rowRef !== null && setRef !== null) {
    setRef(rowRef);
  }
  setWidth(
    rowRef.current?.scrollWidth
      ? -(rowRef.current?.scrollWidth - rowRef.current?.offsetWidth)
      : 0
  );
}, []);

const onSubmit = (data) => {
    console.log(data)
  }
  return (
    <>
     <section className="max-w-4xl p-6 py-12 pb-20 mx-auto bg-light-cream shadow-md dark:bg-light-cream" ref={rowRef}>
     <h1 className="text-chill-black font-montserrat font-bold text-sm mb-1">Casi casi...</h1>

     <h1 className="text-chill-black font-montserrat font-bold text-2xl mb-1">Llena el Formulario y obtené la guía</h1>
     <p className="text-sm font-normal font-montserrat text-gray-600 mb-8">Te doy la bienvenida a mi metodología de movimiento :)</p>
        
        <form className='font-montserrat' onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
                <div className='border-b-black border-b-[1px] flex md:w-full w-80  group mb-2'>
                    <input {...register('name')}  placeholder='Nombre' id="name" type="text" className="relative m-0 block w-[1px] min-w-0 flex-auto rounded-r  bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3]  focus:text-neutral-700 focus:outline-none focus:border-none  dark:placeholder:text-neutral-500/80 dark:placeholder:font-light"
                                    aria-label="Sizing example input"
                                    aria-describedby="inputGroup-sizing-default" />
                    <ArrowRightIcon className='w-5 h-5 group-hover:translate-x-2 transition-all' />
                </div>
                <div className='border-b-black border-b-[1px] flex md:w-full w-80  group mb-2'>
                    <input {...register('email')} placeholder='Email' type="email" className="relative m-0 block w-[1px] min-w-0 flex-auto rounded-r  bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3]  focus:text-neutral-700 focus:outline-none focus:border-none  dark:placeholder:text-neutral-500/80 dark:placeholder:font-light"
                                    aria-label="Sizing example input"
                                    aria-describedby="inputGroup-sizing-default" />
                    <ArrowRightIcon className='w-5 h-5 group-hover:translate-x-2 transition-all' />
                </div>
            </div>
    
            <div className="flex justify-center mt-6">
            <m.button
                initial={{ "--x": "100%", scale: 1 }}
                animate={{ "--x": "-100%" }}
                whileTap={{ scale: 0.97 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 1,
                  type: "spring",
                  stiffness: 20,
                  damping: 15,
                  mass: 2,
                  scale: {
                    type: "spring",
                    stiffness: 10,
                    damping: 5,
                    mass: 0.1,
                  },
                }}
                className="px-5 py-2 mt-6 rounded-full relative radial-gradient"
              >
                <span className="text-white tracking-wide font-semibold h-full w-full block relative linear-mask font-montserrat text-base ">
                  Obtener Gratis...
                </span>
      <span className="block absolute inset-0 rounded-full p-px linear-overlay" />
    </m.button>
            </div>
        </form>
    </section>
    </>

  )
}

export default FreeProductForm