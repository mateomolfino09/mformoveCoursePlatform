import { useAuth } from '../../../hooks/useAuth';
import state from '../../../valtio';
import { Button, Transition } from '@headlessui/react';
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
import Cookies from 'js-cookie';



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

  useEffect(() => {
    if(!auth.user) {
      auth.fetchUser()
    }
  }, [auth.user]);

  const accentColor = '#FBBF24';

  const signupUser = async (name: string, email: string) => {
    // const { email, firstname, lastname, gender, country } = register
    try {
      setLoading(true);

      const res = await fetch(endpoints.auth.easyRegisterSubscribe, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, gender: "", country: "" }),
      })

      const data = await res.json()
      if (data.ok) {
        const { token } = data;
        await auth.signInPostRegister(token).then(() => {
          toast.success('¡Cuenta creada! Ya estás dentro. Revisa tu correo para confirmar tu cuenta.');
          state.loginForm = false;
        });
        setLoading(false);
        return;
      }
      else if(data?.error) {
        setErrorMessage(data?.error)
        toast.error(data.error);
      }

    } catch (error: any) {
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
      const data = await auth.resetPasswordSendMailchamp(email)

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
    const { name, email, password } = data;
    if(loginForm && !forgetForm) await signinUser(email, password)
    else if(loginForm && forgetForm) await forgetPassword(email);
    else await signupUser(name, email);
  }

  //   flex flex-col space-y-2 py-16 md:space-y-4 h-[75vh] lg:h-[90vh] justify-end lg:items-end mr-12 lg:mr-24

  return (
    <>
      {!loginForm ? (
        <div className='fixed flex justify-center items-end md:items-center w-full h-full bg-black/80 z-[300] font-montserrat px-3 pb-4 md:pb-0'>
          <div className='w-full max-w-md md:max-w-[32rem] h-full max-h-[95vh] relative rounded-t-2xl md:rounded-2xl overflow-hidden'>
            <CldImage
              layout='fill'
              alt=""
              src={"my_uploads/fondos/DSC01436_sy7os9"}
              className="object-cover object-top"
            />
            <div className='absolute inset-0 bg-black/70' />
            <div className='absolute inset-0 h-full w-full overflow-y-auto scrollbar-hide px-6 md:px-8 pt-10 pb-10'>
              <div className='w-full relative flex justify-between items-start'>
                <div className="space-y-2 pr-10">
                  <p className='text-[11px] uppercase tracking-[0.25em] text-white/60'>Acceso</p>
                  <h1 className='text-white font-extrabold text-3xl md:text-4xl leading-tight'>Registrate para empezar</h1>
                  <p className='text-white/70 text-sm md:text-base'>Acceso inmediato y progreso guardado.</p>
                </div>
                <IoCloseCircle className='w-8 h-8 text-white cursor-pointer' onClick={() => state.loginForm = false}/>
              </div>
              <div className='mt-8 space-y-4 text-white/85'>
                <div className='flex gap-3 items-start'>
                  <CiUnlock className='w-7 h-7 flex-shrink-0 text-white' />
                  <div className='space-y-1'>
                    <h4 className='text-lg font-semibold'>Acceso instantáneo</h4>
                    <p className='text-sm text-white/70'>Entrás y seguís tu práctica al instante.</p>
                  </div>
                </div>
                <div className='flex gap-3 items-start'>
                  <CiBookmarkCheck className='w-7 h-7 flex-shrink-0 text-white' />
                  <div className='space-y-1'>
                    <h4 className='text-lg font-semibold'>Progreso sincronizado</h4>
                    <p className='text-sm text-white/70'>Guardamos tu avance y biblioteca.</p>
                  </div>
                </div>
                <div className='flex gap-3 items-start'>
                  <CiMobile4 className='w-7 h-7 flex-shrink-0 text-white' />
                  <div className='space-y-1'>
                    <h4 className='text-lg font-semibold'>En cualquier dispositivo</h4>
                    <p className='text-sm text-white/70'>Móvil y escritorio, sin fricción.</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className='mt-10 flex justify-center'>
                  <MiniLoadingSpinner />
                </div>
              ) : (
                <form className="mt-10 rounded-2xl bg-[#0f1115]/85 border border-white/15 p-5 backdrop-blur space-y-4 shadow-2xl" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2" htmlFor="name">
                      Nombre
                    </label>
                    <input className={`w-full rounded-lg border-0 bg-white/5 py-2.5 px-3 text-white placeholder-white/50 leading-tight focus:outline-none focus:ring-2 focus:ring-white/25 ${errorMessage ? 'ring-1 ring-red-400' : ''}`} id="name" type="text" placeholder="Nombre" {...register('name', { required: true })} />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2" htmlFor="email">
                      Email
                    </label>
                    <input className={`w-full rounded-lg border-0 bg-white/5 py-2.5 px-3 text-white placeholder-white/50 leading-tight focus:outline-none focus:ring-2 focus:ring-white/25 ${errorMessage ? 'ring-1 ring-red-400' : ''}`} id="email" type="email" placeholder="example@gmail.com" {...register('email', { required: true })} />
                    <p className={`text-red-400 text-xs mt-1 ${errorMessage ? 'block' : 'hidden'}`}>{errorMessage}</p>
                  </div>
                  <div className="flex items-center justify-between h-12">
                    <Button
                      type='submit'
                      className='w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-white via-[#f7f7f7] to-[#eaeaea] text-black py-3 px-6 text-base font-semibold shadow-lg shadow-black/25 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-black/40 hover:scale-[1.01] focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-white/50'
                    >
                      Crear cuenta
                    </Button>
                  </div>
                  <div className="text-xs text-white/70 space-y-1">
                    <p>Al suscribirte aceptás nuestras <a target='_blank' href="/privacy" rel='noopener noreferrer' className="underline">Políticas de Privacidad</a> y <a target='_blank' href="/documents/terms-and-conditions.pdf" download="documents/terms-and-conditions.pdf" rel='noopener noreferrer' className="underline">Términos y Condiciones</a>.</p>
                  </div>
                  <div className="flex items-center mt-2">
                    <p className="text-sm text-white/80">
                      ¿Ya tenés una cuenta?{' '}
                      <span onClick={() => setLoginForm(true)} className="underline cursor-pointer" style={{ color: accentColor }}>Ingresá acá</span>
                    </p>
                  </div>
                </form>
              )}

            </div>


        </div>
        </div>
      ) :
      (
        <>
      {forgetForm ? (
                <div className='fixed flex justify-center md:items-center items-end w-full h-full bg-black/70 z-[300]'>
                <div className='w-96 md:w-[30rem] h-[25rem] relative bottom-0 md:mb-12 md:h-[25rem] md:mt-12 bg-white rounded-t-2xl md:rounded-2xl'>
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
                                    <MdOutlineMarkEmailRead className='w-16 h-16 mb-4 text-[#a38951]'/>
                                    <h5 className='text-lg md:text-xl font-bold text-black'>¡Email enviado!</h5>
                                    <h6 className='text-sm md:text-base font-medium text-black'>Chequea tu Inbox</h6>
                                  </div>
                              </div>  
                              <div className="flex items-center mb-1 mt-3">
                                <label htmlFor="checkbox-1" className="text-sm ml-3  font-medium text-gray-900">
                                <p onClick={() =>  {
                                  setForgetSend(false);
                                  setForgetForm(false);
                                }} className="text-[#234C8C] underline cursor-pointer"> Volver al Login</p></label>
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
                                <div className="absolute inset-0 w-0 bg-[#a38951] transition-all duration-[750ms] rounded-md ease-out group-hover:w-full"></div>
                                <span className='text-white transition-all group-hover:text-black duration-[500ms] ease-out relative'>Recuperar{' '}
                                </span>
                              </button>
                              </div>
                              <div className="flex items-center mb-1 mt-3">
                                <label htmlFor="checkbox-1" className="text-sm ml-3  font-medium text-gray-900">
                                <p onClick={() => setForgetForm(false)} className="text-[#234C8C] underline cursor-pointer"> Volver al Login</p></label>
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
        <div className='w-full max-w-md md:max-w-[32rem] h-full max-h-[65vh] relative bottom-0 md:mb-12 md:min-h-fit md:mt-12 rounded-t-2xl md:rounded-2xl overflow-hidden'>
            <CldImage layout='fill'
            alt="" src={"my_uploads/fondos/DSC01436_sy7os9"} className="object-cover object-top rounded-2xl" />
            <div className='absolute inset-0 bg-black/70' />
            <div className='absolute h-full w-full overflow-y-auto scrollbar-hide font-montserrat px-8 pt-10 pb-12'>
              <div className='w-full relative flex justify-between items-start mb-4'>
                <h1 className='text-white font-bold text-2xl md:text-3xl pr-12 leading-snug'>Ingresa a tu cuenta</h1>
                <IoCloseCircle className='w-8 h-8 text-white cursor-pointer' onClick={() => state.loginForm = false}/>
              </div>
              {loading ? (
                <div className='mt-12'>
                  <MiniLoadingSpinner />

                </div>
              ) : (
                <>
                <form className="rounded-2xl bg-[#0f1115]/85 border border-white/15 p-5 backdrop-blur space-y-4 shadow-2xl" onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-0">
                    <label className="block text-white text-sm font-medium mb-2" htmlFor="email">
                      Email
                    </label>
                    <input className={`w-full rounded-lg border-0 bg-white/5 py-2.5 px-3 text-white placeholder-white/50 leading-tight focus:outline-none focus:ring-2 focus:ring-white/25 ${errorMessage ? 'ring-1 ring-red-400' : ''}`} id="email" type="email" placeholder="example@gmail.com" {...register('email', { required: true })} />
                    <p className={`text-red-400 text-xs mt-1 ${errorMessage ? 'block' : 'hidden'}`}>{errorMessage}</p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2" htmlFor="name">
                      Contraseña
                    </label>
                    <input className={`w-full rounded-lg border-0 bg-white/5 py-2.5 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-white/25 ${errorMessage ? 'ring-1 ring-red-400' : ''}`} type="password" id="password" placeholder="••••••••" {...register('password', { required: true })} />
                  </div>
                  <div className="flex items-center w-ull justify-end relative -top-2 mb-3 text-xs">
                    <label htmlFor="checkbox-1" className="text-sm ml-3  font-medium text-white/80">
                    <p onClick={() => {
                      setForgetForm(true)
                                                } } className="text-white underline cursor-pointer"> Olvidé mi Contraseña</p></label>
                  </div>
                  <div className="flex items-center justify-between h-12">
                  <Button
                      type='submit'
                      className='w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-white via-[#f7f7f7] to-[#eaeaea] text-black py-3 px-6 text-base font-semibold shadow-lg shadow-black/25 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-black/40 hover:scale-[1.01]'
                      >
                    Ingresar
                      </Button>
  
                  </div>
                  <div className="flex items-center mb-1 mt-3">
                    <label htmlFor="checkbox-1" className="text-sm ml-3  font-medium text-white/80">¿No tenés una cuenta?
                                                <p onClick={() => setLoginForm(false)} className="text-white underline cursor-pointer"> Click aquí</p></label>
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
