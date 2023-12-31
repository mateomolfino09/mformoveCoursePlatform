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

  const logoutHandler = async (e: any) => {
    e.preventDefault();

    auth.signOut()
    router.push('/login')
  };


  return (
    <motion.header className={`bg-rich-black `} initial={{ opacity: 0 }} transition={{ duration: 0.8, ease: 'linear' }} animate={{ opacity: 1 }}>
    <Link href='/home'>
      <img
        src='/images/logoWhite.png'
        width={120}
        height={120}
        className='cursor-pointer object-contain transition duration-500 hover:scale-105 lg:opacity-80 hover:opacity-100'
      />
    </Link>
      <AiOutlineLogout onClick={(e) => logoutHandler(e)} className='md:h-6 md:w-6 h-5 w-5 cursor-pointer text-white transition duration-500 hover:scale-105 lg:opacity-80 hover:opacity-100' />
  </motion.header>
  )
}

export default ProfileHeader