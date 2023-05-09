import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { CursorArrowRaysIcon } from '@heroicons/react/24/solid'
import dynamic from 'next/dynamic'
import React, { useEffect, useMemo, useRef, useState } from 'react'

const Jodit = dynamic(() => import('./Jodit'), { ssr: false })

const ClassComments = () => {
  const [question, setQuestion] = useState(false)
  const [content, setContent] = useState('')
  const refEditor = useRef(null)
  const [hasWindow, setHasWindow] = useState(false)

  useEffect(() => {
    if (window) setHasWindow(true)
  }, [])

  useEffect(() => {}, [question])

  return (
    <div className='p-8 lg:pr-4'>
      <div className='w-full h-full shadow-2xl flex flex-col'>
        <label className='inline-block w-full '>
          <textarea
            placeholder='Escribe tu pregunta'
            className='input'
            onFocus={() => setQuestion(!question)}
          />
        </label>
        <div className='w-full flex justify-end'>
          <button className='group bg-white text-black hover:text-white hover:border-white border hover:bg-black transition-all duration-200  px-2 py-0.5 rounded-md flex mt-1 mb-4'>
            <CursorArrowRaysIcon className='h-6 w-6' />
            <span>PUBLICAR</span>
          </button>
        </div>
      </div>
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Numquam
        aliquam, quidem, ad doloribus repudiandae atque illo a, vitae et
        temporibus ipsa incidunt nisi. Nobis eius dolor, similique facere vitae
        sequi! Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe
        repudiandae sit repellat eaque, illum sequi! Quos laudantium deserunt
        debitis facere nemo laborum, atque, similique doloremque voluptatem
        inventore molestias quisquam magnam! Lorem ipsum dolor sit amet
        consectetur adipisicing elit. Incidunt perspiciatis unde nisi? Neque nam
        autem rerum accusantium, at, ipsam ipsa velit placeat deleniti facilis
        non maiores blanditiis asperiores debitis repudiandae?
      </p>
    </div>
  )
}

export default ClassComments
