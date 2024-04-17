import React from 'react'
import { ClassTypes, WorkShopDB } from '../../../../typings'
import MainSideBar from '../../MainSideBar'
import Head from 'next/head'
import Footer from '../../Footer'
import ProductCarousel from './ProductCarousel'
import ProductsFilters from '../ProductFiltersBoard'
import FilterNavWrapper from '../../FilterNavProductWrapper'

interface Props {
    products: WorkShopDB[]
    filters: ClassTypes[]
}

const Products = ({ products, filters }: Props) => {
  return (
    <div className='relative bg-to-dark lg:h-full min-w-[90vw] min-h-screen overflow-scroll overflow-x-hidden'  
    >    <MainSideBar where={'home'}>
      <FilterNavWrapper>

        <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
        </Head>
        <main className='relative pl-4 lg:space-y-24 lg:pl-16 mt-32'>
            <section className='!mt-0'>
                <ProductsFilters filtersDB={filters}/>
            </section>
            <ProductCarousel products={products}/>
        </main>
        <Footer />
        </FilterNavWrapper>

    </MainSideBar>

    </div>

  )
}

export default Products