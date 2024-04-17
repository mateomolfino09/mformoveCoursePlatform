'use client'
import Image from 'next/image'
import React from 'react'
import imageLoader from '../../../../imageLoader'
import { ProductDB } from '../../../../typings'

interface Props {
    products: ProductDB[]
}

const ProductCarousel = ({ products }: Props) => {
    

  return (
    <div className='flex flex-col space-y-2 py-16 md:space-y-4 min-h-[100vh] justify-end lg:items-end mr-12 lg:mr-24  overflow-hidden'>
    <div className='absolute top-0 left-0 h-[100vh] w-full -z-10 overflow-hidden'>
        <div>
            
        </div>
    </div>
  </div>
  )
}

export default ProductCarousel