import React from 'react'
import { ProductDB } from '../../../../typings'
import Image from 'next/image'
import { CldImage } from 'next-cloudinary'
import { AcademicCapIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useRouter } from 'next/navigation';

interface Props {
  product: ProductDB
}

const ProductCard = ({ product }: Props) => {
  const router = useRouter();

  return (
  <div onClick={() => router.push(`/products/${product.url}`)} className="max-w-4xl h-96 md:h-[28rem] font-montserrat flex flex-col bg-white border border-gray-200 rounded-xl shadow dark:bg-light-cream dark:border-gray-700 cursor-pointer hover:scale-105 transition-all">
      <div className='pt-3 px-3 flex justify-between space-x-1'>
        <h5 className="text-xs md:text-sm font-bold tracking-tight text-[#141414]">{product.phraseName.toUpperCase()}</h5>
        <div>
          <AcademicCapIcon className='h-5 w-5 text-black'/>
        </div>
      </div>
      <div className="pl-3 h-16">
          <a href="#">
              <h4 className="mb-2 text-xl font-bold tracking-tight text-[#141414]">{product.name.toUpperCase()}</h4>
          </a>
      </div>
      <div className='h-96 relative'>
          <CldImage layout='fill'
              alt="" src={product.image_url} className="rounded-b-lg object-cover" />
            {/* <Image loader={imageLoader} fill={true} className="rounded-b-lg object-cover" src="" alt=""  /> */}
        <div className='h-12 w-16 bg-[#4CE096] absolute flex justify-center items-center bottom-3 rounded-l-xl right-0'>
          <p className='text-black p-1 text-sm font-bold'>{product.price} {product.currency}</p>
        </div>
      </div>
  </div>

  )
}

export default ProductCard