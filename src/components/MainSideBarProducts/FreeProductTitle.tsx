import React from 'react'
import { FreeProduct, ProductDB } from '../../../typings'

interface Props {
    product: FreeProduct
}

const FreeProductTitle = ({product}: Props) => {
  return (
    <div className='md:w-2/3 w-[90%] text-center'>
        <h1 className='font-boldFont text-5xl lg:text-7xl'>
            {product.name}
        </h1>
        <h2 className='font-boldFont bg-gradient-to-r from-[#ece8d5] via-[#ffec8e] to-[#9b8b3b] inline-block text-transparent bg-clip-text text-xl lg:text-3xl mb-4'>(Por Mateo Molfino)</h2>
        <p className='text-lg mt-2 text-white font-montserrat'>{product.description}</p>

    </div>
  )
}

export default FreeProductTitle