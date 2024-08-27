'use client'
import Link from 'next/link'
import React from 'react'
import { AiOutlineLogout } from 'react-icons/ai'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/navigation'

const ProfileHeader = () => {
  const auth = useAuth();
  const router = useRouter();

  return (
    <motion.header className={`bg-black w-full h-14 py-1 `} initial={{ opacity: 0 }} transition={{ duration: 0.8, ease: 'linear' }} animate={{ opacity: 1 }}>
    <Link href='/home'>
      <img
        src='/images/MFORMOVE_blanco03.png'
        width={180}
        height={180}
        className='cursor-pointer object-contain transition py-2 duration-500 hover:scale-105 lg:opacity-80 hover:opacity-100'
      />
    </Link>
    <a href="/login"> <AiOutlineLogout onClick={(e) => auth.signOut()} className='md:h-6 md:w-6 h-5 w-5 cursor-pointer text-white transition duration-500 hover:scale-105 lg:opacity-80 hover:opacity-100' /> </a>
  </motion.header>
  )
}

export default ProfileHeader