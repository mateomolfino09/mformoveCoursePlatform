'use client'


import React, { RefObject, useEffect, useState } from 'react';
import './IndividualProduct.css';
import { ClassesProduct, ProductDB } from '../../../../typings';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import {
  oneTymePaymentSlice,
  setOnePaymentToken
} from '../../../redux/features/oneTimePayment';
import endpoints from '../../../services/api';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import MainSideBar from '../../MainSidebar/MainSideBar';
import Footer from '../../Footer';
import { AcademicCapIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion as m, useAnimation } from 'framer-motion';
import '../../MainSideBarProducts/freeProductStyle.css'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Module from './Module';
import VideoPlayer from './VideoPlayer';
import ReactPlayer from 'react-player';
import state from '../../../valtio';
import { LoadingSpinner } from '../../LoadingSpinner';
import { MiniLoadingSpinner } from './MiniSpinner';
import { formatearPrecioEventoSync } from '../../../utils/currencyHelpers';

interface Props {
  product: ProductDB;
}

const IndividualProduct = ({ product }: Props) => {
  const auth = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [modulesQuantity, setModulesQuantity] = useState<any>([]);
  const [playerRef, setPlayerRef] = useState<RefObject<ReactPlayer> | null>(
    null
  );
  const [play, setPlay] = useState<boolean>(false);
  const [hasWindow, setHasWindow] = useState(false);
  const [activateFrequent, setActivateFrequent] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }

  }, [auth.user]);


  const checkLogin = () => {
    if(!auth.user) {
      state.loginForm = true;
      return false;
    }
    else {
      state.loginForm = false;
      return true
    }
  }

  // --- Lógica para precio vigente (solo eventos con precios escalonados) ---
  function getCurrentPriceInfo() {
    const { precios, stripePrices, tipo } = product as any;
    if (tipo !== 'evento' || !precios || !stripePrices) return null;
    const now = new Date();
    // Early Bird
    if (
      precios.earlyBird?.price &&
      precios.earlyBird.start &&
      precios.earlyBird.end &&
      now >= new Date(precios.earlyBird.start) &&
      now <= new Date(precios.earlyBird.end)
    ) {
      return {
        label: 'Early Bird',
        price: precios.earlyBird.price,
        stripePriceId: stripePrices.earlyBird,
      };
    }
    // General
    if (
      precios.general?.price &&
      precios.general.start &&
      precios.general.end &&
      now >= new Date(precios.general.start) &&
      now <= new Date(precios.general.end)
    ) {
      return {
        label: 'General',
        price: precios.general.price,
        stripePriceId: stripePrices.general,
      };
    }
    // Last Tickets
    if (
      precios.lastTickets?.price &&
      precios.lastTickets.start &&
      precios.lastTickets.end &&
      now >= new Date(precios.lastTickets.start) &&
      now <= new Date(precios.lastTickets.end)
    ) {
      return {
        label: 'Last Tickets',
        price: precios.lastTickets.price,
        stripePriceId: stripePrices.lastTickets,
      };
    }
    return null;
  }
  const currentPriceInfo = getCurrentPriceInfo();

  async function handleSubmit() {

    const pass = checkLogin();

    if(!pass) return

    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      // Usar el priceId vigente si es evento escalonado
      let priceId = undefined;
      const { tipo } = product as any;
      if (tipo === 'evento' && currentPriceInfo) {
        priceId = currentPriceInfo.stripePriceId;
      }
      const { data } = await axios.post(
        '/api/payments/oneTimePayment',
        {
          name: product.name,
          description: product.phraseName,
          currency: 'USD',
          amount: currentPriceInfo ? currentPriceInfo.price : product.price,
          priceId,
          back_url: `/products/${product.url}`,
          success_url: `/products/${product.url}/success-payment`
        },
        config
      );
      const token = data?.response?.merchant_checkout_token;
      dispatch(setOnePaymentToken(token));
     

      const userId = auth?.user._id;
      const productId = product?._id;

      if(!userId || !productId) {
        toast.error('El usuario o producto tienen un error. Comunicate con soporte.')
      }

      const res = await axios.put(
        '/api/user/product/assignToken',
        {
          userId,
          token,
          productId
        },
        config
      );

      Cookies.set('userPaymentToken', token ? token : '', { expires: 5 });
      auth.fetchUser();
      const redirectPaymentLink = data?.response?.redirect_url;
      if (res.status == 200) {
        router.push(redirectPaymentLink);
      }
      // dispatch(clearData()) //VERLO BIEN
    } catch (error: any) {
      toast.error(error.response.data.error);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasWindow(true);
    }
  }, []);

  useEffect(() => {
    let modules: any = [];
    for (let index = 1; index <= product.classes[product.classes.length - 1].module; index++) {
      modules.push(product.classes.filter(x => x.module === index))
    }
    setModulesQuantity(modules)
    
  }, [])

  return (
    <div className='relative bg-to-dark font-montserrat lg:h-full min-w-[90vw] min-h-screen overflow-scroll overflow-x-hidden'>
    <MainSideBar where={'product'}>
    <main className='pt-32 bg-white'>
        <div className='product-details flex flex-col space-y-12 lg:flex-row'>
          <div className='product-name-image cursor-pointer lg:w-1/2 flex flex-col space-y-4 px-5 lg:pl-24'>
          <div onClick={() => router.push('/products')} className='flex w-32 justify-start items-center space-x-2'>
                <ArrowLeftIcon className='font-bold w-5 h-5 text-black hidden md:block'/>
                <p className='text-black text-sm font-bold'>Volver</p>
              </div>
            <div className='w-full lg:pr-12 flex justify-between items-center'>

              <h2 className='text-black text-4xl md:text-5xl font-bold lg:pr-4'>{product?.name}</h2>
              <AcademicCapIcon className='h-8 w-8 hidden lg:block text-black'/>
            </div>
            <p className='text-black lg:pr-12 text-lg md:text-lg font-normal'>{product.description}</p>
            <div className='product-image md:py-8'>
            {hasWindow && (
                <>
            <VideoPlayer
                    url={product.intro_video_url}
                    title={product.name}
                    img={product.image_url}
                    setPlayerRef={(val: any) => setPlayerRef(val)}
                    play={play}
                    isToShow={true}
                    />
                </>
            )}
            </div>
            <div className='flex w-full lg:bg-gray-300/50 lg:p-6 lg:rounded-md flex-col lg:space-y-4 md:space-y-4'>
              {/* Mostrar precio vigente */}
              {(() => { const { tipo } = product as any; return tipo === 'evento' && currentPriceInfo })() ? (
                <div className='mb-2'>
                  <span className='text-lg font-bold text-black'>
                    {currentPriceInfo?.label}: {formatearPrecioEventoSync(currentPriceInfo?.price, product).textoCompleto}
                  </span>
                </div>
              ) : (
                <div className='mb-2'>
                  <span className='text-lg font-bold text-black'>
                    Precio: {formatearPrecioEventoSync(product.price, product).textoCompleto}
                  </span>
                </div>
              )}
              <button
                onClick={(e) => handleSubmit()}
                className='w-full hidden md:block bg-black border border-white rounded-md transition duration-500 hover:bg-rich-black py-3 font-semibold group relative shadow'
                disabled={(() => { const { tipo } = product as any; return tipo === 'evento' && !currentPriceInfo })()}
              >
                {loading ? (
                  <div className='w-full h-5 flex justify-center items-center'>
                    <MiniLoadingSpinner />
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 w-0 bg-[#a38951] transition-all duration-[750ms] rounded-md ease-out group-hover:w-full"></div>
                    <span className='text-white transition-all group-hover:text-black duration-[500ms] ease-out relative'>
                      {(() => { const { tipo } = product as any; return tipo === 'evento' && currentPriceInfo })()
                        ? `Comprar (${currentPriceInfo?.label} ${formatearPrecioEventoSync(currentPriceInfo?.price, product).textoCompleto})`
                        : `Comprar Ahora (${formatearPrecioEventoSync(product.price, product).textoCompleto})`}
                    </span>
                  </>
                )}
              </button>
              <p className='text-black text-lg  md:text-lg font-normal'>{product.longDescription}</p>
            </div>
            <div className='w-full hidden lg:flex lg:flex-col lg:bg-gray-300/50 lg:p-6 cursor-pointer rounded-md' onClick={() => setActivateFrequent(!activateFrequent)}>
              <div className='flex lg:rounded-md mb-4 items-center justify-between'>
                <p className='text-black text-lg  font-bold md:text-xl'>Preguntas Frecuentes</p>
                <div>
                  <ArrowRightIcon className={`w-8 h-8 text-black transition-all`}/>
                </div>
              </div>
              <div className={`w-full text-black ${activateFrequent ? 'flex flex-col space-y-6' : 'hidden'} transition-all duration-500`}>
                {product.frequentQuestions.map((fq) => (
                  <div key={fq.id}>
                    <h3 className='text-xl font-semibold'>{fq.question}</h3>
                    <p className='text-base'>{fq.answer}</p>
                  </div> 
                ))}
                {/* {product.frequentQuestions.map((x) => (
                  <>
                  
                  </>
                )} */}
              </div>
            </div>

          </div>
          <div className='product-name-image md:px-16 px-5 lg:w-1/2 flex flex-col space-y-4'>
          <div className='w-full flex flex-col justify-center space-y-10'>
          <h2 className='text-black text-3xl md:text-4xl font-bold'>Contenido del Curso</h2>
            {modulesQuantity.map((classes: [ClassesProduct]) => (
              <Module classes={classes} product={product} index={classes[0].module}/>
            ))}
          </div>
          </div>
        </div>
        <div className='w-full flex justify-center items-center cursor-pointer rounded-md md:hidden' onClick={() => setActivateFrequent(!activateFrequent)}>
          <div className='w-[90%] mt-12 flex flex-col p-6 cursor-pointer rounded-md bg-gray-300/50'>
              <div className='flex rounded-md mb-4 items-center justify-between'>
                <p className='text-black text-lg  font-bold md:text-xl'>Preguntas Frecuentes</p>
                <div>
                  <ArrowRightIcon className={`w-8 h-8 text-black transition-all`}/>
                </div>
              </div>
              <div className={`w-full text-black ${activateFrequent ? 'flex flex-col space-y-6' : 'hidden'} transition-all duration-500`}>
                {product.frequentQuestions.map((fq) => (
                  <div key={fq.id}>
                    <h3 className='text-xl font-semibold'>{fq.question}</h3>
                    <p className='text-base'>{fq.answer}</p>
                  </div> 
                ))}
                {/* {product.frequentQuestions.map((x) => (
                  <>
                  
                  </>
                )} */}
              </div>
          </div>
            </div>
      </main>
      <Footer />
      </MainSideBar>
      <div className='bottom-0 md:hidden flex justify-center items-end mb-4 text-center fixed w-full h-24 px-3' style={{background: 'linear-gradient(180deg,hsla(0,0%,100%,0),#fff 25.91%)'}}>
      <button
          onClick={(e) => handleSubmit()}
          className='w-full bg-black border border-white rounded-md transition duration-500 text-xl font-light hover:bg-black py-4 shadow-2xl shadow-white'
        >
          Comprar Ahora{' '} ({product.price} {product.currency})
        </button>
      </div>
    </div>
  );
};

export default IndividualProduct;
