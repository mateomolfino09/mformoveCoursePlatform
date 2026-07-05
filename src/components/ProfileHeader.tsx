'use client'
import Link from 'next/link'
import React from 'react'
import { AiOutlineLogout } from 'react-icons/ai'
import { motion } from 'framer-motion'
import { useLogout } from '../hooks/useLogout'
import { usePathname } from 'next/navigation'
import { routes } from '../constants/routes'

const ProfileHeader = () => {
  const { performLogout } = useLogout(routes.navegation.index);
  const path = usePathname()
  const logoHref = routes.navegation.index

  return (
    <motion.header className={`bg-black w-full h-16 py-1 `} initial={{ opacity: 0 }} transition={{ duration: 0.8, ease: 'linear' }} animate={{ opacity: 1 }}>
    <Link href={logoHref}>
      <img
        src='/images/MFORMOVE_blanco03.png'
        width={180}
        height={180}
        className='cursor-pointer object-contain transition py-2 duration-500 hover:scale-105 lg:opacity-80 hover:opacity-100'
      />
    </Link>
    <button type="button" onClick={() => performLogout()} aria-label="Cerrar sesión">
      <AiOutlineLogout className='md:h-6 md:w-6 h-5 w-5 cursor-pointer text-white transition duration-500 hover:scale-105 lg:opacity-80 hover:opacity-100' />
    </button>
  </motion.header>
  )
}

export default ProfileHeader