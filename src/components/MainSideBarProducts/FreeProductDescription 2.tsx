import React from 'react'
import { FreeProduct } from '../../../typings'

interface Props {
    product: FreeProduct
}

const FreeProductDescription = ({ product } : Props) => {
  return (
    <div className='bg-[#141414] w-full min-h-[50vh] p-12'>
        <p className='text-2xl text-white font-montserrat'>{product.description}</p>
    </div>
  )
}

export default FreeProductDescription