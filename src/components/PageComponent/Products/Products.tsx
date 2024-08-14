import React from 'react'
import { ClassTypes, ProductDB} from '../../../../typings'
import MainSideBar from '../../MainSideBar'
import Head from 'next/head'
import Footer from '../../Footer'
import ProductCarousel from './ProductCarousel'
import ProductsFilters from '../ProductFiltersBoard'
import FilterNavProductWrapper from '../../FilterNavProductWrapper'

interface Props {
    products: ProductDB[]
    filters: ClassTypes[]
}

const Products = ({ products, filters }: Props) => {
  return (
    <div className='relative bg-to-dark lg:h-full min-w-[90vw] min-h-screen overflow-scroll overflow-x-hidden'  
    >    
    <MainSideBar where={'home'}>
      <FilterNavProductWrapper>
        <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
        </Head>
        <main className='relative pl-4 lg:space-y-12 space-y-5 md:pl-20 lg:pl-28 mt-32'>
            <section className='!mt-0 px-2'>
                {/* <ProductsFilters filtersDB={filters}/> */}
                <h1 className='text-white text-3xl md:text-4xl mb-2 font-semibold capitalize font-montserrat'>Mis Cursos</h1>
                <h3 className='text-white text-xl md:text-2xl capitalize font-montserrat'>Programas guiados en profundidad.</h3>
                <h4 className='text-white text-xl md:text-2xl capitalize font-montserrat'>Paga una vez y es tuyo para siempre.</h4>
               
            </section>
            <hr className='w-[90%] border-[0.5px]'/>
            <div className=''>
            <h1 className='text-white text-xl md:text-2xl mb-2 font-semibold capitalize font-montserrat'>Todos los Cursos</h1>
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