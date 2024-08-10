'use client'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import React from 'react'
import { BiRightArrow } from 'react-icons/bi'
import { BsInstagram, BsMailbox } from 'react-icons/bs'
import { MdMail, MdMailOutline } from 'react-icons/md'
import { useAuth } from '../../hooks/useAuth'
import { ProductDB } from '../../../typings'

interface Props {
    product: ProductDB
}

const FreeProductForm = ({ product }: Props) => {
const auth = useAuth()

  return (
    <>
     <section className="max-w-4xl p-6 mx-auto bg-white shadow-md dark:bg-white">
        <h2 className="text-2xl mt-4 text-center font-semibold text-black capitalize dark:text-[#141414] font-boldFont">Obtener guía gratuita</h2>
        
        <form className='font-montserrat '>
            <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
                <div>
                    <label className="text-black font-montserrat  dark:text-[#141414]" htmlFor="name">Nombre</label>
                    <input id="name" type="text" className="block w-full px-4 py-2 mt-2 text-black bg-white border border-gray-300 rounded-md dark:bg-white dark:text-gray-300 dark:border-gray-600 focus:border-[#141414] dark:focus:border-[#141414] focus:outline-none focus:ring" />
                </div>
    
                <div>
                    <label className="text-black font-montserrat dark:text-[#141414]" htmlFor="emailAddress">Email</label>
                    <input id="emailAddress" type="email" className="block w-full px-4 py-2 mt-2 text-black bg-white border border-gray-300 rounded-md dark:bg-white dark:text-gray-300 dark:border-gray-600 focus:border-[#141414] dark:focus:border-[#141414] focus:outline-none focus:ring" />
                </div>
            </div>
    
            <div className="flex justify-center mt-6">
                <button className=" leading-5 text-black transition-colors duration-200 transform bg-white border border-black px-16 py-3 rounded-full text-center hover:bg-white focus:outline-none focus:bg-white font-bold font-montserrat ">Obtener Gratis</button>
            </div>
        </form>
    </section>
    </>

  )
}

export default FreeProductForm