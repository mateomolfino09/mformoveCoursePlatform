'use client'
import React, { useEffect } from 'react'
import { ClassTypes, ProductDB} from '../../../../typings'
import MainSideBar from '../../MainSidebar/MainSideBar'
import Head from 'next/head'
import Footer from '../../Footer'
import ProductCarousel from './ProductCarousel'

import FilterNavProductWrapper from '../../FilterNavProductWrapper'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../hooks/useAuth'

interface Props {
    products: ProductDB[]
    filters: ClassTypes[]
}

const Products = ({ products, filters }: Props) => {

  const router = useRouter()
  const auth = useAuth()

  useEffect(() => {
    
    if(!auth.user) {
      auth.fetchUser()
    }

  }, [auth.user]);

  return (
    <div className='relative bg-to-dark lg:h-full min-w-[90vw] min-h-screen overflow-scroll overflow-x-hidden'  
    >    
    <MainSideBar where={'productsHome'}>
      <FilterNavProductWrapper>
        <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
        </Head>
        <main className='relative lg:space-y-12 space-y-5 mt-32'>
            <section className='!mt-0 px-2  pl-4 md:pl-20 lg:pl-28'>
                {/* <ProductsFilters filtersDB={filters}/> */}
                <h1 className='text-white text-3xl md:text-4xl mb-2 font-semibold capitalize font-montserrat'>Mis Cursos</h1>
                <h3 className='text-white text-xl md:text-2xl capitalize font-montserrat'>Programas guiados en profundidad.</h3>
                <h4 className='text-white text-xl md:text-2xl capitalize font-montserrat'>Paga una vez y es tuyo para siempre.</h4>
               
            </section>
            <hr className='w-[90%] border-[0.5px]'/>
            <div className=' '>
            <h1 className='text-white text-xl md:text-2xl mb-2 ml-4 md:ml-20 lg:ml-28 font-semibold capitalize font-montserrat'>Todos los Cursos</h1>
            <ProductCarousel products={products}/>

            </div>
        </main>
        <Footer />
        </FilterNavProductWrapper>

    </MainSideBar>

    </div>

  )
}

export default Products