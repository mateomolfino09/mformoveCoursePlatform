import { ClipboardDocumentCheckIcon, CloudArrowDownIcon, UserGroupIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { Plan } from '../../../../typings'
import PlanBenefits from './PlanBenefits'
import { Button } from '@headlessui/react'
import { CldImage } from 'next-cloudinary'
import imageLoader from '../../../../imageLoader'

interface Props {
    plans: Plan[]
}

const SelectPlanPlans = ({ plans }: Props) => {
  const bloques = ['Workshop', 'Contenido', 'Comunidad']

  const benefits = [
    {
      title: 'Workshop',
      isBonus: true,
      benefits: [{
        title: 'Transforma tu práctica',
        description: 'El primer curso creado por el Dr. La Rosa, basado en más de una década de estudio y experiencia en el consultorio.',
        active: true,
        extra: '‍Disponible inmediatamente.'
      }]
  }, {
    title: 'Encuentros y desafíos',
    isBonus: false,
    benefits: [
      {
      title: '',
      description: 'Encuentros en vivo con el Dr. La Rosa con espacio de preguntas y Masterclasses con invitados expertos.',
      active: true,
      extra: '',
    },
    {
      title: '',
      description: 'Desafíos mensuales con objetivos concretos de salud en donde te brindamos todas las herramientas para lograr lo que buscás.',
      active: true,
      extra: '',
    }
  ]
  }, {
    title: 'Comunidad',
    isBonus: false,
    benefits: [
      {
      title: '',
      description: 'Acceso a una comunidad en donde podrás conectar con personas que te inspirarán en tu camino hacia la salud óptima.',
      active: true,
      extra: '',
    },
  ]
  }
]

  return (
    <div className='w-full flex flex-col md:space-x-18 justify-start items-center md:px-4 px-2 bg-primary  relative pb-16'> 
        <div className='flex space-y-3 flex-col !mt-20 md:!mt-20 items-start justify-start md:max-w-[900px]' >
    <div className='!text-3xl md:!text-4xl font-montserrat font-normal align-middle w-full  text-center text-black'>
      <h2 className=''>Elegí tu <strong>Camino</strong>
      </h2>
    </div>
  </div>
  <div className='w-full flex flex-col md:flex-row items-center justify-center md:space-x-12'>
      {plans.filter(x => x.active).map(p => (
        <>
          <div className='w-full justify-center h-full flex !mt-16 md:flex-row md:max-w-[650px] font-montserrat '>
              <div className='w-full flex flex-col space-y-2 justify-start pt-4 px-5 bg-gray-50 shadow-2xl rounded-md items-center pb-8 '>
                <div className={`${p.frequency_type === 'year' ? 'bg-custom-stronger-alt' : 'bg-custom-gradient'} rounded-md flex justify-center items-center flex-col space-y-2   md:p-5 w-80 md:w-full h-32 relative mb-4`}>
                    <CldImage
                      src={'my_uploads/image00029_mtsdpo'}
                      preserveTransformations
                      width={500}
                      height={500}
                      className={`object-cover rounded-md  absolute h-full w-full opacity-20`}
                      alt={'Rutina Imagen'}
                      loader={imageLoader}
                    />
                    <h3 className={`${p.frequency_type === 'year' ? 'text-primary' : 'text-secondary-darker'} z-50 mt-2 md:mt-0 font-normal text-base md:text-2xl`}>{p.name}</h3>
                    <h3 className={`${p.frequency_type === 'year' ? 'text-primary' : 'text-secondary-darker'} z-50 font-normal text-4xl`}><strong>${p.amount}</strong>{p.frequency_type === 'year' ? '/año' : '/mes'}</h3>
                    <div className={`${p.frequency_type !== 'year' && 'hidden'} bg-yellow rounded-md absolute top-0 right-2 p-1 text-xs font-normal`}>
                      <p className='text-secondary-darker'>2 meses gratis</p>
                      <div className='absolute'>

                      </div>
            
                    </div>
                </div>
                <div className='flex flex-col space-y-6'>
                  {benefits.map(b => (
                    <>
                    <PlanBenefits benefits={b.benefits} isBonus={b.isBonus} show={p.frequency_type === 'year' ? true : b.isBonus ? false : true} title={b.title}/>

                    </>
                  ))}
                </div>
                <div>
                  <Button className={`w-64 h-16 bg-secondary rounded-full mt-8 font-bold first-letter:text-xl`}>Empezar</Button>
                </div>

              </div>
          </div>
        </>
      ))}

    </div>
            </div>  

  )
}
export default SelectPlanPlans