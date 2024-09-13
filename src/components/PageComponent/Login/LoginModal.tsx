import { useAuth } from '../../../hooks/useAuth';
import state from '../../../valtio';
import { Transition } from '@headlessui/react';
import {
  CreditCardIcon,
  HomeIcon,
  PlusCircleIcon,
  TableCellsIcon,
  UserIcon
} from '@heroicons/react/24/solid';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { Fragment, forwardRef, useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import Image from 'next/image';
import imageLoader from '../../../../imageLoader';
import { CiBookmarkCheck, CiUnlock, CiMobile4 } from "react-icons/ci";
import { HiComputerDesktop } from "react-icons/hi2";
import { useForm } from 'react-hook-form';
import { CldImage } from 'next-cloudinary';
import { IoCloseCircle } from 'react-icons/io5';
import endpoints from '../../../services/api';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../../LoadingSpinner';
import { alertTypes } from '../../../constants/alertTypes';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import { MdEmail } from 'react-icons/md';
import { MdOutlineMarkEmailRead } from "react-icons/md";



interface Props {
}

const LoginModal = () => {
  const router = useRouter();
  const pathname = usePathname();
  const animation = useAnimation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const animationPhones = useAnimation();
  const auth = useAuth();
  const [errorMessage, setErrorMessage] = useState(null);
  const [loginForm, setLoginForm] = useState(false);
  const [forgetForm, setForgetForm] = useState(false);
  const [forgetSend, setForgetSend] = useState(false);

  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors,  } } = useForm()

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    // Attach the event listener when the component mounts
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); //

  const signupUser = async (name: string, email: string) => {
    // const { email, firstname, lastname, gender, country } = register
    try {
      setLoading(true);

      const res = await fetch(endpoints.auth.easyRegister, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, gender: "", country: "" }),
      })

      const data = await res.json()
      console.log(data)
      const { token } = data;

      console.log(data)

      //login

      if (res.ok) {
        await auth.signInPostRegister(token).then((res: any) => {
          toast.success('¡Cuenta creada con éxito!')
          setLoading(false);
          state.loginForm = false
        })
      }
      else if(data?.error) {
        setErrorMessage(data?.error)
        toast.error(data.error);
      }

    } catch (error: any) {
      console.log(error);
      setErrorMessage(error?.response?.data?.error)
      toast.error(error?.response?.data?.error); 
    }
    setLoading(false);
  };

  const signinUser = async (email: string, password: string) => {
    
    setLoading(true);

    await auth.signIn(email, password).then((res: any) => {
      if(res.type != 'error') {
        toast.success('¡Login Exitoso!')
        state.loginForm = false
      } 
      else {
        setErrorMessage(res.message);
        setLoading(false);
      } 
    })
  };

  const forgetPassword = async (email: string) => {
    
    setLoading(true);
    
    try {
      const data = await auth.forgetPasswordSendNoCaptcha(email)

      if(data?.error) {
        setErrorMessage(data.error);
        setLoading(false)
        return
      }

      toast.success(data?.message)
      setForgetSend(true);

    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error)
    }
    setLoading(false);
    
  };


  const snap = useSnapshot(state);

  useEffect(() => {
    animation.start({
      color: '#d1cfcf6e',
      x: 0,
      transition: {
        damping: 5,
        stiffness: 40,
        restDelta: 0.001,
        duration: 0.2
      }
    });
    animationPhones.start({
      x: 0,
      transition: {
        damping: 5,
        stiffness: 40,
        restDelta: 0.001,
        duration: 0.2
      }
    });
  }, []);

  const onSubmit = async (data: any) => {
    console.log(data)
    const { name, email, password } = data;
    if(loginForm && !forgetForm) await signinUser(email, password)
    else if(loginForm && forgetForm) await forgetPassword(email);
    else await signupUser(name, email);
  }

  //   flex flex-col space-y-2 py-16 md:space-y-4 h-[75vh] lg:h-[90vh] justify-end lg:items-end mr-12 lg:mr-24

  return (
    <>
      {!loginForm ? (
        <div className='fixed flex justify-center md:items-center items-end w-full h-full bg-black/70 z-[300]'>
        <div className='w-96 md:w-[30rem] h-[90%] relative bottom-0 md:mb-12 md:h-[95%] md:mt-12 bg-white rounded-2xl'>
            <CldImage layout='fill'
            alt="" src={"my_uploads/image00006_vimnul"} className="object-cover object-top rounded-2xl" />
            <div className='absolute bg-gradient-to-w from-stone-50 to-slate-50  h-full w-full rounded-2xl overflow-scroll scrollbar-hide'>
              <div className='w-full pt-12 pb-6 px-8 flex flex-col'> 
                <div className='w-full relative flex justify-between'>
                  <h1 className='text-black font-bold text-2xl md:text-3xl pr-12 mt-4 capitalize'>Registrate para empezar</h1>
                  <IoCloseCircle className='w-8 h-8 absolute -right-3 -top-8 text-black cursor-pointer' onClick={() => state.loginForm = false}/>
                </div>
                <div className='mt-12 w-full h-full flex flex-col justify-start space-y-1 capitalize'>
                  <div className='flex justify-start space-x-4 items-center h-20 w-full'>
                    <div>
                    <CiUnlock className='text-[#7912FD] w-8 h-8' style={{flex: '0 1 18%'}}/>

                    </div>
                    <div className='flex space-y-1 flex-col text-black'>
                      <h4 className='text-xl font-bold'>Acceso Instantáneo</h4>
                      <p className='text-sm font-medium'>Obtene acceso Instantáneo a la plataforma de MForMove</p>
                    </div>
                  </div>
                  <div className='flex justify-start space-x-4 items-center h-20 w-full '>
                    <div>
                      <CiBookmarkCheck style={{flex: '0 1 18%'}} className='text-[#7912FD] w-8 h-8'/>
                    </div>
                    <div className='flex space-y-1 flex-col text-black'>
                      <h4 className='text-xl font-bold'>Transforma Tu Vida</h4>
                      <p className='text-sm font-medium'>Sumate al Estilo de Vida del Movimiento</p>
                    </div>
                    
                  </div>
                  <div className='flex justify-start space-x-4 items-center h-20 w-full'>
                    <div>
                      <CiMobile4 className='text-[#7912FD] w-8 h-8' style={{flex: '0 1 18%'}}/>

                    </div>
                    <div className='flex space-y-1 flex-col text-black'>
                      <h4 className='text-xl font-bold'>Practica Donde Quieras, Cuando Quieras</h4>
                      <p className='text-sm font-medium'>Acceso Total, Estés Donde Estés</p>
                    </div>
                    
                  </div>
                </div>

              </div>
              {loading ? (
                <>
                <div className='mt-12'>
                  <MiniLoadingSpinner />
                </div>
                </>
              ) : (
                <>
                  <form className=" rounded px-8 pb-8" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Nombre
                      </label>
                      <input className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errorMessage ? 'border-red-500' : ''}`} id="name" type="text" placeholder="fulano" {...register('name', { required: true })} />
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                      </label>
                      <input className={`shadow appearance-none border ${errorMessage ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`} id="email" type="email" placeholder="example@gmail.com" {...register('email', { required: true })} />
                      <p className={`text-red-500 text-xs italic ${errorMessage ? 'block' : 'hidden'}`}>{errorMessage}</p>
                    </div>
                    <div className="flex items-center justify-between h-12">
                    <button
                    type='submit'
                      className='w-full block bg-black border border-white rounded-md transition duration-500 hover:bg-rich-black py-3 font-semibold group relative shadow'
                    >
                      <div className="absolute inset-0 w-0 bg-[#13E096] transition-all duration-[750ms] rounded-md ease-out group-hover:w-full"></div>
                      <span className='text-white transition-all group-hover:text-black duration-[500ms] ease-out relative'>Registrarme{' '}
                      </span>
                    </button>
                    </div>
                    <div className="flex items-center mb-1 mt-3">
                          <label htmlFor="checkbox-1" className="text-sm ml-3  font-medium text-gray-900">Al subscribirte estas de acuerdo con nuestras
                          <a target='_blank' href="/privacy" rel='noopener noreferrer' className="text-blue-600 hover:underline"> Políticas de Privacidad </a>
                          y 
                          <a target='_blank' href="/documents/terms-and-conditions.pdf" download="documents/terms-and-conditions.pdf" rel='noopener noreferrer' className="text-blue-600 hover:underline"> Términos y Condiciones</a></label>
                        </div>
                        <div className="flex items-center mb-1 mt-3">
                          <label htmlFor="checkbox-1" className="text-sm ml-3  font-medium text-gray-900">¿Ya tenés una cuenta?
                          <p onClick={() => setLoginForm(true)} className="text-blue-600 underline hover:underline"> Apreta Acá</p></label>
                        </div>
                </form>
                
                </>
              )}
            
            </div>


        </div>
        </div>
      ) :
      (
        <>
      {forgetForm ? (
                <div className='fixed flex justify-center md:items-center items-end w-full h-full bg-black/70 z-[300]'>
                <div className='w-96 md:w-[30rem] h-[25rem] relative bottom-0 md:mb-12 md:h-[25rem] md:mt-12 bg-white rounded-2xl'>
                    <CldImage layout='fill'

                    alt="" src={"my_uploads/image00006_vimnul"} className="object-cover object-top rounded-2xl" />
                    {loading ? (
                      <>
                    <div className='absolute bg-gradient-to-w from-stone-50 to-slate-50  h-full w-full rounded-2xl overflow-scroll scrollbar-hide'>
                      
                      <div className='w-full pt-12 pb-6 px-8 flex flex-col'> 
                        <div className='w-full h-full relative flex justify-between'>
                          <h1 className='text-black font-bold text-2xl md:text-3xl pr-12 mt-4 capitalize'>Recuperar Contraseña</h1>
                          <IoCloseCircle className='w-8 h-8 absolute -right-3 -top-8 text-black cursor-pointer' onClick={() => state.loginForm = false}/>                     
                        </div>        
                      </div>
     
                        <div className='h-12 mt-6 w-full flex items-center justify-center'>
                          <MiniLoadingSpinner />    
                        </div>
                        </div>
                      </>
    

                      ) : (
                        <>
                      <div className='absolute bg-gradient-to-w from-stone-50 to-slate-50  h-full w-full rounded-2xl overflow-scroll scrollbar-hide'>
                      <div className='w-full pt-12 pb-6 px-8 flex flex-col'> 
                        <div className='w-full relative flex justify-between'>
                          <h1 className='text-black font-bold text-2xl md:text-3xl pr-12 mt-4 capitalize'>Recuperar Contraseña</h1>
                          <IoCloseCircle className='w-8 h-8 absolute -right-3 -top-8 text-black cursor-pointer' onClick={() => state.loginForm = false}/>
                        </div>
        
                      </div>
                        <form className={`rounded px-8 pb-8 ${forgetSend ? 'flex flex-col items-center h-48 justify-start bg-gray-400/30 rounded-md mx-4 mb-12' : ''}`} onSubmit={handleSubmit(onSubmit)}>
                          {forgetSend ? (
                            <>
                                <div className="w-[80%] h-full">
                                  <div className='w-full flex flex-col justify-center items-center'>
                                    <MdOutlineMarkEmailRead className='w-16 h-16 mb-4 text-[#7912FD]'/>
                                    <h5 className='text-lg md:text-xl font-bold text-black'>¡Email enviado!</h5>
                                    <h6 className='text-sm md:text-base font-medium text-black'>Chequea tu Inbox</h6>
                                  </div>
                              </div>  
                              <div className="flex items-center mb-1 mt-3">
                                <label htmlFor="checkbox-1" className="text-sm ml-3  font-medium text-gray-900">
                                <p onClick={() =>  {
                                  setForgetSend(false);
                                  setForgetForm(false);
                                }} className="text-blue-600 underline cursor-pointer"> Volver al Login</p></label>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="mb-0">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                  Email
                                </label>
                                <input className={`shadow appearance-none border ${errorMessage ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`} id="email" type="email" placeholder="example@gmail.com" {...register('email', { required: true })} />
                                <p className={`text-red-500 text-xs italic ${errorMessage ? 'block' : 'hidden'}`}>{errorMessage}</p>
                              </div>
                              <div className="flex items-center justify-between h-12">
                              <button
                              type='submit'
                                className='w-full block bg-black border border-white rounded-md transition duration-500 hover:bg-rich-black py-3 font-semibold group relative shadow'
                              >
                                <div className="absolute inset-0 w-0 bg-[#13E096] transition-all duration-[750ms] rounded-md ease-out group-hover:w-full"></div>
                                <span className='text-white transition-all group-hover:text-black duration-[500ms] ease-out relative'>Recuperar{' '}
                                </span>
                              </button>
                              </div>
                              <div className="flex items-center mb-1 mt-3">
                                <label htmlFor="checkbox-1" className="text-sm ml-3  font-medium text-gray-900">
                                <p onClick={() => setForgetForm(false)} className="text-blue-600 underline cursor-pointer"> Volver al Login</p></label>
                              </div>
                            
                            </>
                          )}
                      </form>
                      </div>
                        </>
                      )} 
                </div>
                </div>
      ) : 
      (
        <div className='fixed flex justify-center md:items-center items-end w-full h-full bg-black/70 z-[300]'>
        <div className='w-96 md:w-[30rem] h-[54%] relative bottom-0 md:mb-12 md:min-h-fit md:mt-12 bg-white rounded-2xl'>
            <CldImage layout='fill'
            alt="" src={"my_uploads/image00006_vimnul"} className="object-cover object-top rounded-2xl" />
            <div className='absolute bg-gradient-to-w from-stone-50 to-slate-50  h-full w-full rounded-2xl overflow-scroll scrollbar-hide'>
              <div className='w-full pt-12 pb-6 px-8 flex flex-col'> 
                <div className='w-full relative flex justify-between'>
                  <h1 className='text-black font-bold text-2xl md:text-3xl pr-12 mt-4 capitalize'>Ingresa tu cuenta para empezar</h1>
                  <IoCloseCircle className='w-8 h-8 absolute -right-3 -top-8 text-black cursor-pointer' onClick={() => state.loginForm = false}/>
                </div>

              </div>
              {loading ? (
                <div className='mt-12'>
                  <MiniLoadingSpinner />

                </div>
              ) : (
                <>
                <form className=" rounded px-8 pb-8" onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-0">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                      Email
                    </label>
                    <input className={`shadow appearance-none border ${errorMessage ? 'border-red-500' : ''} rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`} id="email" type="email" placeholder="example@gmail.com" {...register('email', { required: true })} />
                    <p className={`text-red-500 text-xs italic ${errorMessage ? 'block' : 'hidden'}`}>{errorMessage}</p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                      Contraseña
                    </label>
                    <input className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errorMessage ? 'border-red-500' : ''}`} type="password" id="password" placeholder="••••••••" {...register('password', { required: true })} />
                  </div>
                  <div className="flex items-center w-ull justify-end relative -top-2 mb-3 text-xs">
                    <label htmlFor="checkbox-1" className="text-sm ml-3  font-medium text-gray-900">
                    <p onClick={() => {
                      setForgetForm(true)
                    } } className="text-blue-600 hover:underline cursor-pointer"> Olvidé mi Contraseña</p></label>
                  </div>
                  <div className="flex items-center justify-between h-12">
                  <button
                  type='submit'
                    className='w-full block bg-black border border-white rounded-md transition duration-500 hover:bg-rich-black py-3 font-semibold group relative shadow'
                  >
                    <div className="absolute inset-0 w-0 bg-[#13E096] transition-all duration-[750ms] rounded-md ease-out group-hover:w-full"></div>
                    <span className='text-white transition-all group-hover:text-black duration-[500ms] ease-out relative'>Ingresar{' '}
                    </span>
                  </button>
                  </div>
                  <div className="flex items-center mb-1 mt-3">
                    <label htmlFor="checkbox-1" className="text-sm ml-3  font-medium text-gray-900">¿No tenés una cuenta?
                    <p onClick={() => setLoginForm(false)} className="text-blue-600 underline cursor-pointer"> Apreta Acá</p></label>
                  </div>
              </form>
                </>
              )}
            
            </div>


        </div>
        </div>
      )}
        </>
      )}

    </>
  );
};

export default LoginModal;
