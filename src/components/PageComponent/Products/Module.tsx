import React from 'react'
import { ClassesDB, ClassesProduct, ProductDB } from '../../../../typings'

interface Props {
    classes: ClassesProduct[]
    product: ProductDB
    index: number
}

const Module = ({ classes, product, index }: Props) => {
    console.log(classes)
  return (
    <div className='w-full'>
        <div className='w-full bg-black py-4 px-4 flex flex-col space-y-2 rounded-t-xl'>
            <h3 className='text-lg text-white font-semibold'>MODULO {classes[0].module}</h3>
            <h2 className='text-2xl text-white font-bold'>{product.modules[index - 1].name}</h2>
            <p className='text-base text-white font-medium'>{product.modules[index - 1].description}</p>
        </div>
        <div className='bg-gray-200/50 rounded-b-xl w-full'>
            {classes.map(clase => (
                <div key={clase.id} className='border-b-[1px] border-b-black rounded-b-xl'>
                    <div className='w-full flex h-16 py-3'>
                        <div className='image w-1/2'>

                        </div>
                        <div className='w-1/2'>
                            <p className='text-black text-sm'>{clase.name}</p>
                            <div className='w-12 h-5 flex justify-center items-center bg-white rounded-l-full rounded-r-full'>
                                <span className='text-black text-sm'>{clase.totalTime} min</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  )
}

export default Module