'use client'
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { BiRightArrow } from 'react-icons/bi'
import { BsInstagram, BsMailbox } from 'react-icons/bs'
import { MdMail, MdMailOutline } from 'react-icons/md'
import { useAuth } from '../../hooks/useAuth'
import { useForm } from 'react-hook-form'
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import './freeProductStyle.css'
import Confetti from "react-confetti";
import { IoCarOutline } from 'react-icons/io5'

const FreeProductForm = ({ product, setRef }) => {
const auth = useAuth()
const { register, handleSubmit, formState: { errors,  } } = useForm()
const rowRef = useRef(null);
const scrollRowRef = useRef(null);
const theWidth = rowRef.current?.scrollWidth
? -(rowRef.current?.scrollWidth - rowRef.current?.offsetWidth)
: 0;
const [width, setWidth] = useState(theWidth);
const [totalCounts, setTotalCounts] = useState(400);
const [showConfetti, setShowConfetti] = useState(false);
const [buttonDisabled, setButtonDisabled] = useState(false);
const [message, setMessage] = useState("");
const [status, setStatus] = useState(null);
const [checked, setChecked] = useState(false);

const [dimensions, setDimensions] = useState({
  width: 0,
  height: 0,
});
const [run, setRun] = useState(false);
const [subscribed, setSubscribed] = useState(false);

const formAnimation = useAnimation(false);
const divAnimation = useAnimation(false);


useEffect(() => {
  if (subscribed) {
    formAnimation.start({
      x: -2000,
      transition: {
        type: 'just',
        damping: 5,
        stiffness: 40,
        restDelta: 0.001,
        duration: 1
      }
    });
    divAnimation.start({
      x: 0,
      transition: {
        delay: 0.05,
        ease: 'linear',
        duration: 0.25,
        stiffness: 0
      }
    });
  }
}, [subscribed]);


useEffect(() => {
  const { innerWidth: width, innerHeight: height } = window;
  console.log(height, width)
  setDimensions({
    width,
    height: height * 2,
  });
}, []);

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

function validateEmail(email) {
  // Regular expression for basic email validation
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Test the email against the regular expression
  return re.test(String(email).toLowerCase());
}

const onSubmit = async (data) => {
  console.log(data)
  let email = data.email;
  let name = data.name;

  if(!validateEmail(email)) {
    setMessage(
      "Error. Ingresa un email válido"
    )
    return
  }

  if(!name || name.length < 3) {
    setMessage(
      "Error. Ingresa un nombre válido"
    );
    return
  }

  if(!checked) {
    setMessage(
      "Error. Lee y acepta los Términos y Condiciones"
    );
    return
  }

  {
    setButtonDisabled(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          name: name
        }),
      });
      const datas = await response.json();
      // let datas = {
      //   status: 200,
      //   title: "Miembro"
      // }
      if (datas.status >= 400) {
        setStatus(datas.status);
        if(datas.title == "Member Exists") setMessage(
          "Esta cuenta ya pertenece a la lista."
        );
        else setMessage(
          "Error al unirte. Contactanos directamente via Instagram!."
        );

        setTimeout(() => {
          setMessage("");
          setButtonDisabled(false);
        }, 5000);
        return;
      }

      setStatus(201);
      setMessage("Gracias por subscribirte! 👻.");
      setShowConfetti(true);
      setRun(true);
      setSubscribed(true)
      setTimeout(() => {
        setTotalCounts(0);
        setMessage("");
        setButtonDisabled(false);
      }, 4000);
      setTotalCounts(400);
    } catch (error) {
      console.log(error)
      setStatus(500);
      setMessage(
        "Error al unirte. Contactanos directamente via Instagram!."
      );
      setTimeout(() => {
        setMessage("");
        setButtonDisabled(false);
      }, 2000);
    }
  }
  }

  const checkHandler = () => {
    setChecked(!checked)
  }

  return (
    <>

     <section className="max-w-4xl overflow-hidden relative md:rounded-lg p-6 py-12 pb-20 mx-auto bg-light-cream shadow-md dark:bg-light-cream" ref={rowRef}>
     <m.h1 animate={formAnimation} className="text-chill-black font-montserrat font-bold text-sm md:text-base mb-1">Casi casi...</m.h1>
     {showConfetti && (
    <Confetti
      width={dimensions.width}
      height={dimensions.height}
      numberOfPieces={totalCounts}
      run={run}
      onConfettiComplete={() => setShowConfetti(false)}
    />
    )}
     <m.h1 animate={formAnimation} className="text-chill-black font-montserrat font-bold text-2xl md:text-3xl mb-1">Subscribite a mi Newsletter y obtené la guía</m.h1>
     <m.p animate={formAnimation} className="text-sm md:text-base font-normal font-montserrat text-gray-600 mb-8">Te doy la bienvenida a mi metodología de movimiento :)</m.p>
      <>
        <form
             className='font-montserrat' onSubmit={handleSubmit(onSubmit)}>
            <m.div animate={formAnimation} className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
                <div className='border-b-black border-b-[1px] flex md:w-full w-80  group mb-2'>
                    <input {...register('name')}  placeholder='Nombre' id="name" type="text" className="relative m-0 block w-[1px] min-w-0 flex-auto rounded-r  bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3]  focus:text-neutral-700 focus:outline-none focus:border-none  dark:placeholder:text-neutral-500/80 dark:placeholder:font-light"
                                    aria-label="Sizing example input"
                                    aria-describedby="inputGroup-sizing-default" />
                </div>
                <div className='border-b-black border-b-[1px] flex md:w-full w-80  group mb-2'>
                    <input {...register('email')} placeholder='Email' type="email" className="relative m-0 block w-[1px] min-w-0 flex-auto rounded-r  bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3]  focus:text-neutral-700 focus:outline-none focus:border-none  dark:placeholder:text-neutral-500/80 dark:placeholder:font-light"
                                    aria-label="Sizing example input"
                                    aria-describedby="inputGroup-sizing-default" />
                </div>

                <div className="flex items-center mb-4">
                  <input id="checkbox-1" aria-describedby="checkbox-1" onChange={checkHandler} type="checkbox" className="bg-gray-50 border-gray-300 focus:ring-3 focus:ring-blue-300 h-4 w-4 rounded" checked={checked} />
                  <label htmlFor="checkbox-1" className="text-sm ml-3 font-medium text-gray-900">He leído y acepto los  <a target='_blank' href="/documents/terms-and-conditions.pdf" download="documents/terms-and-conditions.pdf" alt="terminos y condiciones" rel='noopener noreferrer' className="text-blue-600 hover:underline">términos y condiciones</a></label>
                </div>
            </m.div>
    
            <m.div animate={formAnimation} className="flex justify-center mt-6">
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
                className="px-5 py-2 md:px-6 md:py-3 mt-6 rounded-full relative radial-gradient"
                disabled={buttonDisabled}
              >
                <span className="text-white tracking-wide font-semibold h-full w-full block relative linear-mask font-montserrat text-base md:text-lg">
                  Obtener Gratis...
                </span>
      <span className="block absolute inset-0 rounded-full p-px linear-overlay" />
    </m.button>
            </m.div>
            {message && (
              <p
                className={`${
                  status !== 201 ? "text-red-500" : "text-green-500"
                } pt-4 font-medium font-montserrat text-sm`}
              >
                {message}
              </p>
            )}


        </form>
        <m.div initial={{ x: 2000 }}
            animate={divAnimation} className='font-montserrat absolute top-5 pr-4' onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-1 mt-6 px-3 sm:px-24">
                <div className='flex w-full  group mb-3 md:mb-10'>
                    <h3 className='text-chill-black text-left font-montserrat font-bold text-3xl md:text-4xl mb-1'>¡Felicidades! Te subscribiste a la Newsletter</h3>
                </div>
                <div className='flex w-full text-black text-base space-x-2 text-center group mb-1'>
                    <CheckCircleIcon className='text-green-500/80 w-5 h-5 md:w-8 md:h-8 text-black' style={{flex: "1 0 5%;"}}/>
                    <p className='text-left text-base md:text-lg'>Chequea tu Email en Recibidos y Spam para asegurarte de recibir "{product.name}"</p>
                </div>
                <div className='space-x-2 flex w-full text-black text-base text-center group'>
                  <CheckCircleIcon className='text-green-500/80 w-5 h-5 md:w-8 md:h-8 text-black' style={{flex: "1 0 5%;"}}/>
                  <p className='text-left text-base md:text-lg'>Te hice una pregunta para conocer TU proceso y ayudarte en TUS objetivos personales. Esa es la idea de esta NewsLetter. ¡No olvides responder!</p>
                </div>
                <div className='space-x-2 flex w-full text-black text-base text-center group'>
                  <CheckCircleIcon className='text-green-500/80 w-5 h-5 md:w-8 md:h-8 text-black' style={{flex: "1 0 5%;"}}/>
                  <p className='text-left text-base md:text-lg'>Disfruta de los beneficios gratuitos que estamos ofreciendo. Cualquier duda no dudes en consultarme, estoy para eso.</p>
                </div>
            </div>
          </m.div>
      </>
   

    </section>
    </>

  )
}

export default FreeProductForm