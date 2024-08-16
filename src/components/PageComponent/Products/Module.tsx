import React from 'react'
import { ClassesDB, ClassesProduct, ProductDB } from '../../../../typings'
import Image from 'next/image'
import imageLoader from '../../../../imageLoader'

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
                <div key={clase.id} className=' flex flex-col items-center justify-center'>
                    <div className='w-full justify-center items-center flex h-16 py-3'>
                        <div className='image w-full'>
                            <Image src={clase.image_url} width={50} height={50} alt={clase.name} loader={imageLoader}/>

                        </div>
                        <div className='w-full'>
                            <p className='text-black text-sm'>{clase.name}</p>
                            <div className='w-24 h-5 flex justify-center items-center bg-white rounded-l-full rounded-r-full'>
                                <span className='text-black font-bold text-sm'>{Math.floor((clase.totalTime /
                                60 )%
                                60)} min</span>
                            </div>
                        </div>
                    </div>
                    <hr className={`${classes[classes.length - 1]._id == clase._id ? 'hidden' : ''} w-[90%] border-[0.5px] px-4 border-gray-300/50`}/>
                </div>
            ))}
        </div>
    </div>
  )
}

export default Module