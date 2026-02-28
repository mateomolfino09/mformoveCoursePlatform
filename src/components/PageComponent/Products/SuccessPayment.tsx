'use client';

import { toast } from '../../../hooks/useToast';
import imageLoader from '../../../../imageLoader';
import { Plan, ProductDB, User } from '../../../../typings';
import { useAuth } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';
import Footer from '../../Footer';
import { LoadingSpinner } from '../../LoadingSpinner';
import MainSideBar from '../../MainSidebar/MainSideBar';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion as m } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { AiFillCheckCircle } from 'react-icons/ai';
import Select, { StylesConfig } from 'react-select';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface Props {
    product: ProductDB
}

const SuccessProductPayment = ({ product }: Props) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [productDb, setProductDb] = useState<ProductDB>(product);

  useEffect(() => {
    let userProduct = productDb?.users.filter(x => x._id === auth?.user?._id)[0]
    const paymentToken = Cookies.get('userPaymentToken');

    if (!userProduct && auth.user && paymentToken) {
        handleProductUser();
    }
    else if(userProduct && auth.user) {
      setLoading(false);
      Cookies.remove('userPaymentToken');
    }
    setLoading(false);
  }, [auth.user]);

  const handleProductUser = () => {
    setLoading(true);
    const paymentToken = Cookies.get('userPaymentToken');

    if (!paymentToken) {
      toast.error(`No podes acceder a esta página, te redireccionaremos al inicio...`);
      router.push('/mentorship');
      return;
    }

    const fetchProductUser = async () => {
      try {
        const user = auth.user;
        const prod = productDb;

        let userProduct = prod?.users.filter(x => x._id === auth?.user?._id).length > 0;
        if(userProduct) {
          toast.success('ya lo agregaste')
          return
        }
        if (!user) {
          await auth.fetchUser();
          return;
        }
        const data = await auth.newProductUser(user._id, paymentToken, product._id);
        if (data.error) {
          toast.error(`${data.error}`);
        } else {
          toast.success(`Felicidades, adquiriste ${product.name}.`)
          setProductDb(data.product)
        }
      } catch (error) {
        } finally {
        setLoading(false);
      }
    };

    fetchProductUser();
  };

  useEffect(() => {
    if (!auth.user) {
      auth.fetchUser();
    }

    const handleScroll = () => {
      if (window.scrollY === 0) {
        dispatch(toggleScroll(false));
      } else {
        dispatch(toggleScroll(true));
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
     <MainSideBar where={''}>
       <div className='h-[100vh]  w-full bg-transparent items-center justify-center relative flex overflow-x-hidden'>
         <div className='absolute top-0 left-0 h-full w-screen -z-10'>
           <Image
             src='/images/image00006.jpeg'
             alt={'image'}
             fill={true}
             loader={imageLoader}
             className='object-cover opacity-50 '
           />
         </div>
         <m.div
           initial={{ y: '-150%' }}
           animate={{ y: '0%' }}
           transition={{ duration: 0.9, ease: 'easeOut' }}
           exit={{ opacity: 1 }}
           className='w-96 relative lg:w-[28rem] md:left-32 lg:left-1/4 bottom-24'
         >
           <div className='flex'>
             <h1 className='text-4xl md:text-5xl font-light mb-6'>
               Bienvenido a la Membresía de MforMove
             </h1>
             <AiFillCheckCircle className='h-32 w-32 text-green-500' />
           </div>
           <p className='text-base md:text-lg font-light'>
           Eleva tu práctica: enraizada en la ciencia, cultivada con conciencia plena. Uniendo yoga, movimiento, trabajo de respiración y entrenamiento basado en habilidades con Mateo Molfino.
           </p>
           {loading ? (
             <>
               <LoadingSpinner />
             </>
           ) : (
             <div className='flex px-24 py-3 mt-6 border-white border rounded-full justify-center items-center w-full group cursor-pointer hover:bg-white hover:text-black'>
               <button className='w-full' onClick={() => router.push('/')}>
                 Empezar{' '}
               </button>
               <ArrowRightIcon className='w-4 h-4 relative left-4' />
             </div>
           )}
         </m.div>
       </div>
       <Footer />
     </MainSideBar>
  );
};

export default SuccessProductPayment;
