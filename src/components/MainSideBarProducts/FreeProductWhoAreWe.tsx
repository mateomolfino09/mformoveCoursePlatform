import Image from 'next/image'
import React from 'react'
import imageLoader from '../../../imageLoader'

const FreeProductWhoAreWe = () => {
  return (
    <div className= "inline-block text-left bg-[#141414] rounded-lg overflow-hidden align-bottom transition-all transform shadow-2xl py-4 sm:py-8 sm:align-middle sm:w-full">
        <div className="items-center w-full mr-auto ml-auto relative max-w-7xl md:px-12 lg:px-24">
<div className="grid grid-cols-1 h-full">
  <div className="mt-4 mb-4 bg-[#141414] max-w-lg">
    <div className="flex flex-col items-center pt-6 pr-12 pb-6 pl-6 justify-end h-full">
      <img
        src='/images/image00010.jpeg'
        className="flex-shrink-0 object-cover object-center btn- flex w-24 h-24 md:w-32 md:h-32 mr-auto ml-auto rounded-full shadow-xl"
      />
      <p className="mt-8 text-2xl md:text-4xl font-semibold leading-none text-white tracking-tighter lg:text-3xl font-montserrat text-center">
        Mi nombre es Mateo Molfino
      </p>
      <p className="mt-5 text-base md:text-lg leading-relaxed text-center text-gray-200 font-montserrat">
        Soy instructor certificado de yoga y profe de movimiento. Mi trabajo es guiar prácticas y procesos de
        exploración personal enraizadas en la ciencia y la creatividad estructural.
      </p>
      <p className="mt-2 text-lg md:text-lg leading-relaxed text-center text-gray-200 font-montserrat">
        La idea es que salgas del molde, que disfrutes de entrenar y puedas potenciar el cuerpo que se te dio, para
        que TU calidad de vida MEJORE.
      </p>
    </div>
  </div>
</div>
        </div>
    </div>
  )
}

export default FreeProductWhoAreWe