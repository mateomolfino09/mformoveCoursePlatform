'use client'
import Link from 'next/link'
import React from 'react'
import { AiOutlineUser } from 'react-icons/ai'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

const UserHeader = () => {
  const auth = useAuth()

  return (
    <motion.header className={`bg-black md:bg-transparent py-3 `} initial={{ opacity: 0 }} transition={{ duration: 1.2, ease: 'linear' }} animate={{ opacity: 1 }}>
    <Link href='/'>
      <img
        src='/images/MFORMOVE_blanco03.png'
        width={180}
        height={180}
        className='cursor-pointer pt-2 object-contain transition duration-500 hover:scale-105 lg:opacity-80 hover:opacity-100'
      />
    </Link>
    {auth?.user != null ? (
      <>
        <Link href='/account'>
          <AiOutlineUser className='md:h-6 md:w-6 h-5 w-5 cursor-pointer text-white transition duration-500 hover:scale-105 lg:opacity-80 hover:opacity-100' />
        </Link>
      </>
    ) : (
      <>
         {/* <Link href='/account'>
          <AiOutlineUser className='md:h-6 md:w-6 h-5 w-5 cursor-pointer text-white transition duration-500 hover:scale-105 lg:opacity-80 hover:opacity-100' />
        </Link>      */}
      </>
    )} 

  </motion.header>
  )
}

export default UserHeader