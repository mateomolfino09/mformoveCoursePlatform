import React from 'react'
import { ClassesDB, ClassesProduct, ProductDB } from '../../../../typings'
import Image from 'next/image'
import imageLoader from '../../../../imageLoader'
import { PlayIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'

interface Props {
    classes: ClassesProduct[]
    product: ProductDB
    index: number
}

const Module = ({ classes, product, index }: Props) => {
    const router = useRouter();
  return (
    <div className='w-full'>
        <div className='w-full bg-black py-4 px-4 flex flex-col space-y-2 rounded-t-xl'>
            <h3 className='text-lg text-white font-semibold'>MODULO {classes[0].module}</h3>
            <h2 className='text-2xl text-white font-bold'>{product.modules[index - 1].name}</h2>
            <p className='text-base text-white font-medium'>{product.modules[index - 1].description}</p>
        </div>
        <div className='bg-gray-200/50 rounded-b-xl w-full'>
            {classes.map(clase => (
                <div key={clase.id} onClick={() => router.push(`/products/${product.url}/${clase.video_url}`)} className=' flex h-24 pt-4 flex-col items-center justify-start cursor-pointer'>
                    <div className='w-full justify-center space-x-4 px-4 items-center flex h-16'>
                        <div className='image relative w-16 h-16'>
                            <Image src={clase.image_url} fill={true} alt={clase.name} loader={imageLoader} className='rounded-lg object-cover'/>
                            <PlayIcon className='text-black absolute lg:top-[40%] lg:left-[35%] top-[40%] left-[35%] w-4 h-4'/>

                        </div>
                        <div className='w-full flex flex-col space-y-2'>
                            <p className='text-black text-base'>{clase.name}</p>
                            <div className='w-16 h-6 flex justify-center items-center bg-white rounded-l-full rounded-r-full'>
                                <span className='text-black font-bold text-sm'>{Math.floor((clase.totalTime /
                                60 )%
                                60)} min</span>
                            </div>
                        </div>
                    </div>
                    <hr className={`${classes[classes.length - 1]._id == clase._id ? 'hidden' : ''} w-[90%] border-[0.5px] mt-4 px-4 border-gray-300/50`}/>
                </div>
            ))}
        </div>
    </div>
  )
}

export default Module