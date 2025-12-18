import imageLoader from '../../../../imageLoader';
import { Plan } from '../../../../typings';
import { useAuth } from '../../../hooks/useAuth';
import endpoints from '../../../services/api';
import state from '../../../valtio';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { CheckmarkIcon } from 'react-hot-toast';
import Select, { StylesConfig } from 'react-select';
import { toast } from 'react-toastify';
import './SelectYourPlan.css'
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
  plans: Plan[];
  promociones?: Promocion[];
  select: string;
  origin: string;
}

const SelectYourPlan = ({ plans, promociones = [], select = "", origin }: Props) => {
    const [planSelected, setPlanSelected] = useState<Plan | null | undefined>(plans[0] ?? null)
    const [loading, setLoading] = useState<boolean>(false)

    // Función para obtener la promoción aplicable a un plan
    const getPromocionAplicable = (plan: Plan | null | undefined): Promocion | null => {
      if (!plan || !promociones || promociones.length === 0) return null;
      
      const ahora = new Date();
      const promocionesValidas = promociones.filter((p: Promocion) => {
        const fechaFin = new Date(p.fechaFin);
        return fechaFin > ahora;
      });

      // Mapear frequency_label y frequency_type a frecuencias de promoción
      const frecuenciaPlan = plan.frequency_label?.toLowerCase() || '';
      const frequencyType = plan.frequency_type?.toLowerCase() || '';
      let frecuenciaPromocion = '';
      
      if (frecuenciaPlan.includes('mensual') || 
          frequencyType === 'month' || 
          frequencyType === 'monthly' ||
          frequencyType === 'mensual') {
        frecuenciaPromocion = 'mensual';
      } else if (frecuenciaPlan.includes('trimestral') || 
                 frequencyType === 'quarter' || 
                 frequencyType === 'quarterly' ||
                 frequencyType === 'trimestral') {
        frecuenciaPromocion = 'trimestral';
      } else if (frecuenciaPlan.includes('anual') || 
                 frequencyType === 'year' || 
                 frequencyType === 'yearly' ||
                 frequencyType === 'anual') {
        // Los planes anuales pueden aplicar a promociones trimestrales o ambas
        frecuenciaPromocion = 'trimestral';
      }

      // Buscar promoción que aplique a esta frecuencia
      const promocionAplicable = promocionesValidas.find((p: Promocion) => {
        return p.frecuenciasAplicables.includes(frecuenciaPromocion) || 
               p.frecuenciasAplicables.includes('ambas');
      });

      return promocionAplicable || null;
    };

    const promocionPlan = getPromocionAplicable(planSelected);
    const precioConDescuento = promocionPlan && planSelected
      ? planSelected.amount * (1 - promocionPlan.porcentajeDescuento / 100)
      : null;

    const auth = useAuth()
    const router = useRouter()
    const planSelect = [
        ...plans.filter(x => x.active).map((p: Plan) =>      
        {
            return {
                value: p.name,
                label: p.name
            }
        })
    ]

  useEffect(() => {
    if (!auth.user) {
      auth.fetchUser();
    }
  }, [auth.user]);

  useEffect(() => {
    setPlanSelectedValue(planSelect[0]?.value ?? "¡Elegí ti Plan!")
    setPlanSelected(plans.find(x => x.name === planSelect[0]?.label))
  }, [plans])

  const [planSelectedValue, setPlanSelectedValue] = useState<string>(
    planSelect[0]?.value ?? "¡Elegí ti Plan!"
  );

    const handleClick = async () => {
        if(!auth.user) {
            toast.error('Usuario no encontrado')
            return
        }
        const email = auth.user.email
        

        setLoading(true)

        try {
            if(planSelected?.provider != "stripe") {
                const res = await fetch(endpoints.payments.createPaymentToken, {
                    method: 'POST',
                    headers: {  
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, planId: planSelected?.id }),
                  })
        
                const data = await res.json()
                setLoading(false)

                if(!data.success) {
                    toast.error(data.message)
                    return
                }
        
                const { token, planToken } = data
                Cookies.set('planToken', planToken ? planToken : '', { expires: 5})
                
                router.push(`${origin}/validate/subscription/${planSelected?.plan_token}?external_id=${auth?.user?._id}`)


            }
            else{
              try {
                const res = await fetch(endpoints.payments.stripe.createPaymentURL, {
                  method: 'POST',
                  headers: {  
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email, planId: planSelected?.id }),
                })

  
                const data = await res.json()
                setLoading(false)
  
                if(!data.success) {
                    toast.error(data.message)
                    return
                }
        
                const { url, planToken } = data;
                Cookies.set('planToken', planToken ? planToken : '', { expires: 5})
  
                router.push(url)
              }
              catch (error: any) {
                setLoading(false);
                toast.error(error?.message);
              }

            }
        } catch (error: any) {
            toast.error(error.message)
        }
        setLoading(false)

    }

  const colourStyles: StylesConfig<any> = {
    control: (styles) => ({
      ...styles,
      backgroundColor: '#101010',
      height: 55,
      width: 300,
      borderRadius: 6,
      padding: 0
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return { ...styles, color: '#808080' };
    },
    input: (styles) => ({ ...styles, backgroundColor: '', color: '#fff' }),
    placeholder: (styles) => ({ ...styles, color: '#fff' }),
    singleValue: (styles, { data }) => ({ ...styles, color: '#808080' })
  };

  return (
    <div className='w-full px-3 py-12 hidden relative flex-col lg:pr-36 pt-8'>
      <div className='flex md:space-y-1 flex-col mb-12 items-end pl-2 justify-end'>
        <h1 className='text sm:text-7xl md:text-5xl lg:text-5xl font-bold capitalize font-montserrat'>
          Movete conmigo,
        </h1>
        <h1 className='text sm:text-7xl md:text-4xl lg:text-5xl font-bold capitalize font-montserrat'>
          Potencia tu Entrenamiento.
        </h1>
      </div>

    <div className='flex flex-col space-y-4 capitalize md:items-end'>

        {planSelectedValue == "Comunidad Gratuita" ? (
            <>
            <div className='flex space-x-2'>
              <CheckIcon className='w-6 h-6 text-[#ae9359]' />
              {/* <CheckCircleIcon className='text-green-500/80 w-5 h-5 md:w-8 md:h-8 text-[#ae9359]'/> */}

              <p className='text-base font-light'>
                Contenido de Flexibilidad, Fuerza y Respiración Gratuitas
              </p>
            </div>
            <div className='flex space-x-2'>
                <CheckIcon className='w-6 h-6 text-[#ae9359]'/>
                <p className='text-base font-light'>Info sobre movimientos para incorporar en tu Entrenamiento</p>
            </div>
            <div className='flex space-x-2 mb-2'>
                <CheckIcon className='w-6 h-6 text-[#ae9359]'/>
                <p className='text-base font-light'>Contenido Gratuito para la Comunidad de MForMovers</p>
            </div>
          </>
        ) : (
          <>
            <div className='flex space-x-2'>
              <div>
                <CheckCircleIcon
                  style={{ flex: '1 0 5%;' }}
                  className='w-6 h-6 text-[#ae9359]'
                />
              </div>
              <p className='text-base font-light'>
                Clases de Flexibilidad, Fuerza y Respiración Ilimitadas
              </p>
            </div>
            {/* <div className='flex space-x-2'>
                  <div>
                        <CheckCircleIcon style={{flex: "1 0 5%;"}} className='w-6 h-6 text-[#ae9359]'/>
                    </div>
                    <p className='text-base font-light'>Asesoramiento Personal Semanal</p>
                </div> */}
            <div className='flex space-x-2'>
              <div>
                <CheckCircleIcon
                  style={{ flex: '1 0 5%;' }}
                  className='w-6 h-6 text-[#ae9359]'
                />
              </div>
              <p className='text-base font-light'>
                Clases Nuevas Para Todos Los Niveles, Todas Las Semanas
              </p>
            </div>
            <div className='flex space-x-2'>
              <div>
                <CheckCircleIcon
                  style={{ flex: '1 0 5%;' }}
                  className='w-6 h-6 text-[#ae9359]'
                />
              </div>
              <p className='text-base font-light'>
                Contenido Exclusivo para la Comunidad de MForMovers
              </p>
            </div>
            <div className='flex space-x-2'>
              <div>
                <CheckCircleIcon
                  style={{ flex: '1 0 5%;' }}
                  className='w-6 h-6 text-[#ae9359]'
                />
              </div>
              <p className='text-base font-light'>
                7 Días de Garantía (Para Miembros Nuevos)
              </p>
            </div>
          </>
        )}
      </div>
      <div
        className='flex md:items-end md:justify-end right-0 mt-10
    '
      >
        <div className='relative'>
          {promocionPlan && (
            <div className='absolute -top-8 right-0 bg-gradient-to-r from-[#ae9359] to-[#c9a86a] text-white px-3 py-1 rounded-full text-xs font-semibold z-10'>
              {promocionPlan.porcentajeDescuento}% OFF
            </div>
          )}
          <Select
              options={planSelect}
              styles={colourStyles}
              placeholder={planSelectedValue || '¡Elegí tu plan!'}
              className='w-72 mr-5'
              value={planSelectedValue}
              onChange={(e) => {
                  setPlanSelected(plans.find(x => x.name === e.label && x.active))
                  setPlanSelectedValue(e.value)
              }}
          />
        </div>
      </div>
      {!auth.user && (
        <div className='w-full flex justify-end'>
        <div
          onClick={() => (state.loginForm = true)}
          className='flex px-24 py-3 mt-6 bg-white text-black rounded-full justify-center items-center w-full md:w-96 group cursor-pointer '
        >
          <button className='w-full text-base md:text-lg'>Continuar </button>
        </div>
        </div>

      )}
      <div className='w-full flex md:justify-end md:items-end'>
        {select === 'select' && auth.user ? (
          <div
            onClick={handleClick}
            className='flex px-24 py-3 mt-6 bg-white text-black rounded-full justify-center items-center w-full md:w-96 group cursor-pointer '
          >
            {loading ? (
              <>
                <MiniLoadingSpinner />
              </>
            ) : (
              <button className='w-full text-base md:text-lg'>Continuar </button>
            )}
          </div>
        ) : (
          // </a>
          <Link href={'mentorship'} className={`${!auth.user && 'hidden'}`}>
            <div className='flex px-24 py-3 mt-6 bg-white text-black rounded-full justify-center items-center w-full md:w-96 group cursor-pointer '>
              <button className='w-full text-base md:text-lg'>Continuar </button>
          </div>
      </Link>

      )}
      </div>

      <div className='w-full flex md:justify-end md:items-end'>
      {planSelectedValue == "Comunidad Gratuita" ? (
            <div className='w-full md:w-96 flex flex-col justify-center items-center space-y-2 mt-5 text-center text-xs md:text-sm font-light'>
            <p>GRATIS </p>
            <p>Oportunidad única...</p>
            </div>
    ) : (
        <>
            <div className='w-full md:w-96 flex flex-col justify-center items-center space-y-4 mt-5 text-center text-xs md:text-sm font-light'>
              {promocionPlan && precioConDescuento ? (
                <>
                  <div className='bg-gradient-to-r from-[#ae9359] to-[#c9a86a] text-white px-4 py-2 rounded-lg mb-2'>
                    <p className='font-semibold text-base'>{promocionPlan.porcentajeDescuento}% OFF - {promocionPlan.nombre}</p>
                  </div>
                  <div className='space-y-1'>
                    <p className='line-through text-gray-400'>
                      {planSelected?.amount} {planSelected?.currency}
                    </p>
                    <p className='text-lg font-semibold text-[#ae9359]'>
                      {Math.round(precioConDescuento)} {planSelected?.currency} facturado {planSelected?.frequency_label}
                    </p>
                    <p className='text-xs text-gray-400'>
                      Ahorras {Math.round(planSelected?.amount - precioConDescuento)} {planSelected?.currency}
                    </p>
                  </div>
                </>
              ) : (
                <p>{planSelected?.amount} {planSelected?.currency} facturado {planSelected?.frequency_label} {planSelected?.frequency_label === "Anual" && `(ahorra ${Math.round(-planSelected?.amount + 12 * (plans.find(x => x.frequency_label != planSelected?.frequency_label && x.frequency_value)?.amount ?? 0))} ${planSelected?.currency})`} facturado hoy.</p>
              )}
                <p>Enviamos recordatorio antes de facturar para evitar pagos no deseados.</p>
            </div>
        </>
      )}
      </div>


      <div className='flex flex-col space-y-2 py-16 md:space-y-4 justify-end lg:items-end mr-12 lg:mr-24  overflow-hidden'>
        <div className='absolute top-0 left-0 h-[100vh] w-full -z-10 overflow-hidden'>
          {/* <video src={'/video/videoTest3.mp4'} autoPlay loop muted={!snap.volumeIndex} className='object-cover h-full w-full'>

            </video> */}
          <CldImage
            src={'my_uploads/image00029_mtsdpo'}
            preserveTransformations
            width={1000}
            height={1000}
            className={`object-cover h-full w-full opacity-40`}
            alt={'Rutina Imagen'}
            loader={imageLoader}
          />
        </div>
      </div>
    </div>
  );
};

export default SelectYourPlan;
