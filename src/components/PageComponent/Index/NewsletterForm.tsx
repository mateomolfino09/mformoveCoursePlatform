'use client'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import React from 'react'

const NewsletterF = () => {
  return (
    <div className='bg-gradient-to-bl w-full h-auto flex flex-col justify-start md:justify-center items-center scrollbar-hide space-x-16 overflow-hidden relative bottom-0 pb-12 md:pb-24 lg:px-24 md:px-20 '>
      <div className='text-white flex flex-col items-center justify-center space-y-4 pl-8 pr-12 w-full text-center'>
        <h3 className='text-3xl md:text-4xl font-extrabold'>Unite a la Move Crew</h3>
        <p className='text-base md:text-lg font-light md:w-[70%]'>
          Entrena motivado, con sesiones guiadas y una comunidad que sostiene tu progreso.
        </p>
        <p className='text-base md:text-lg font-bold italic md:w-[70%]'>
          Programas, devoluciones y retos para avanzar en fuerza, movilidad y control corporal. Desarrollo personal y creativo.
        </p>
        <div className='pt-4'>
          <Link
            href='/move-crew'
            className='inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-white transition hover:bg-white/20 hover:border-white/50'
          >
            Ir a Move Crew
            <ArrowRightIcon className='w-5 h-5' />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NewsletterF