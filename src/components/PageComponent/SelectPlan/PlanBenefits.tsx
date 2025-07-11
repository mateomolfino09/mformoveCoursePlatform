import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import React from 'react'

interface Props {
    title: string
    isBonus: boolean
    benefits: any[]
    show: boolean
}

const PlanBenefits = ({ title, isBonus, benefits, show}: Props) => {
  return (
    <div className={`text-black flex flex-col justify-start items-start pl-3 ${!show && 'opacity-50'}`}>
    <div className={`mb-1`}>
        <h4 className='text-base md:text-lg font-semibold'>{title}</h4>
    </div>
    <div className={`${!isBonus && 'hidden'} mb-2 flex flex-row space-x-2`}>
        <div className='rounded-full text-center p bg-violet-700'>
            <p className='text-white font-medium px-2 py-1 text-xs'>Bonus</p>
        </div>
        <p className='font-medium text-sm'>Valor por separado: $250 USD</p>

    </div>
    <>
        {benefits.map(b => (
            <>
                <div className={`flex flex-row space-x-2 justify-start items-start mt-2`}>
                    {show ? (
                        <div className='flex h-full text-start'>
                        <CheckCircleIcon className={`w-5 h-5 text-start`}/>
                        </div>

                    ) : (
                        <div className='flex h-full text-start'>

                        <XCircleIcon className={`w-5 h-5 text-start`} />
                        </div>

                    )}
                    <div className='flex flex-col justify-start items-start text-sm md:text-base text-start'>
                        <h5 className=''><strong>{b.title != '' && b.title + ':'}</strong> {b.description}</h5>
                        <div  className={`${b.extra == null && 'hidden'}`}>
                            <p className={`text-xs ${isBonus && 'text-violet-700'} ${!show && 'hidden'}`}>{b.extra}</p>
                        </div>
                    </div>
                </div>
            </>
        ))}
    </>
  </div>
  )
}

export default PlanBenefits