'use client'
import Link from 'next/link'
import React from 'react'
import { AiOutlineUser } from 'react-icons/ai'
import { motion } from 'framer-motion'

const UserHeader = () => {
  return (
    <motion.header className={`lg:bg-transparent bg-rich-black `} initial={{ opacity: 0 }} transition={{ duration: 1.2, ease: 'linear' }} animate={{ opacity: 1 }}>
    <Link href='/'>
      <img
        src='/images/logoWhite.png'
        width={120}
        height={120}
        className='cursor-pointer object-contain transition duration-500 hover:scale-105 lg:opacity-80 hover:opacity-100'
      />
    </Link>
    <Link href='/account'>
      <AiOutlineUser className='h-6 w-6 cursor-pointer text-gray-400' />
    </Link>
  </motion.header>
  )
}

export default UserHeader