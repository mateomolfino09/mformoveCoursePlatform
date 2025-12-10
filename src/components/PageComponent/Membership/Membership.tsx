'use client'
import React, { useEffect, useState } from 'react'
import MainSideBar from '../../MainSidebar/MainSideBar'
import Image from 'next/image'
import imageLoader from '../../../../imageLoader'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import SelectYourPlan from './SelectYourPlan'
import { Plan } from '../../../../typings'
import Select, { StylesConfig } from 'react-select';
import Link from 'next/link'
import { useAppDispatch } from '../../../hooks/useTypeSelector'
import { toggleScroll } from '../../../redux/features/headerHomeSlice'
import Footer from '../../Footer'
import PromocionFooter from './PromocionFooter'

interface Promocion {
  _id: string;
  nombre: string;
  descripcion?: string;
  porcentajeDescuento: number;
  frecuenciasAplicables: string[];
  fechaFin: string;
  codigoPromocional?: string;
}

interface Props {
    plans: Plan[]
    promociones?: Promocion[]
    origin: string
}

const Membership = ({ plans, promociones = [], origin }: Props ) => {
    const dispatch = useAppDispatch()
    const [promocionActiva, setPromocionActiva] = useState<Promocion | null>(null);

    useEffect(() => {
        // Function to handle scroll event
        const handleScroll = () => {
          // Your code to handle scroll
          if(window.scrollY === 0) {
            dispatch(toggleScroll(false))
          }
          else {
            dispatch(toggleScroll(true))
          }
        };
    
        // Add scroll event listener when component mounts
        window.addEventListener('scroll', handleScroll);
    
        // Remove scroll event listener when component unmounts
        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
      }, []);

    useEffect(() => {
      // Obtener la promoción más reciente y activa
      if (promociones && promociones.length > 0) {
        const ahora = new Date();
        const promocionesValidas = promociones.filter((p: Promocion) => {
          const fechaFin = new Date(p.fechaFin);
          return fechaFin > ahora;
        });
        
        if (promocionesValidas.length > 0) {
          setPromocionActiva(promocionesValidas[0]);
        }
      }
    }, [promociones]);

    const handlePromocionClick = () => {
      // Scroll a la sección de planes
      const plansSection = document.querySelector('.select-plan-section');
      if (plansSection) {
        plansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

  return (
    <MainSideBar where={''}>
        <div className='h-[100vh] w-full bg-transparent items-center justify-center relative flex overflow-x-hidden'>
        <div className='absolute top-0 left-0 h-full w-screen -z-10'>
          <Image
            src='/images/membershipbg.jpg'
            // src={srcImg}
            alt={'image'}
            fill={true}
            loader={imageLoader}
            className='object-cover'
          />
        </div>
        <div className='w-96 relative lg:w-[28rem] md:left-32 lg:left-1/4 bottom-24'>
            {promocionActiva && (
              <div className='mb-4 bg-gradient-to-r from-[#ae9359] to-[#c9a86a] text-white px-4 py-2 rounded-lg inline-block'>
                <p className='text-sm md:text-base font-semibold'>
                  🎉 {promocionActiva.porcentajeDescuento}% OFF - {promocionActiva.nombre}
                </p>
              </div>
            )}
            <h1 className='text-4xl md:text-5xl font-light mb-6'>Membresías</h1>
            <p className='text-base md:text-lg font-light'>Elevate your Practice: Rooted in Science, Cultivated with Mindfulness. Uniting Yoga, Movement, Breathwork, and Skill-Based Training with Dylan Werner</p>
            <Link href={'mentorship'}>
            <div className='flex px-24 py-3 mt-6 border-white border rounded-full justify-center items-center w-full group cursor-pointer hover:bg-white hover:text-black'>
                <button className='w-full'>Empezar Prueba Gratis </button>
                <ArrowRightIcon className='w-4 h-4 relative left-4'/>

            </div>
            </Link>

          </div>

        </div>
        <div className='h-auto w-full bg-[#131212] items-center justify-center relative flex flex-col pb-12 select-plan-section'>
            <SelectYourPlan plans={plans} promociones={promociones} select='' origin={origin}/>   
        </div>
        <Footer />
        {promocionActiva && (
          <div className="pb-24 md:pb-28">
            <PromocionFooter promocion={promocionActiva} onCtaClick={handlePromocionClick} plans={plans} />
          </div>
        )}
        
    </MainSideBar>
  )
}

export default Membership