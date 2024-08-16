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
        <div className='w-full bg-black p-3 rounded-t-xl'>
            <h3 className='text-lg text-white font-semibold'>MODULO {classes[0].module}</h3>
            <h2 className='text-2xl text-white font-bold'>{product.modules[index - 1].name}</h2>
            <p className='text-base text-white font-medium'>{product.modules[index - 1].description}</p>
        </div>
        {classes.map(clase => (
            <div key={clase.id} className='bg-black '>

            </div>
        ))}
    </div>
  )
}

export default Module