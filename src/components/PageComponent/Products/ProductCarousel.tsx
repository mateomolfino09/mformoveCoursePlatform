'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import imageLoader from '../../../../imageLoader'
import { ProductDB } from '../../../../typings'
import Cookies from 'js-cookie'
import { useAuth } from '../../../hooks/useAuth'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { setProducts } from '../../../redux/features/filterProduct'

interface Props {
    products: ProductDB[]
}

const ProductCarousel = ({ products }: Props) => {

  const [typedProducts, setProductsCar] = useState<any | null>(null);
  const [reload, setReload] = useState(false)
  const [loading, setLoading] = useState(false)

  const filterProductSlice = useAppSelector(
    (state) => state.filterProduct.value
    );

  const auth = useAuth();
  const dispatch = useAppDispatch()

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if(!auth.user) {
      auth.fetchUser()
    } 
    setReload(true)
    
    const groupedData = products?.reduce((acc: any , obj) => {
      const groupKey = obj.productType;
    
      // If the group doesn't exist in the accumulator, create it
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
    
      // Push the current object to the group
      acc[groupKey].push(obj);

      return acc
    
    }, {});


    const arrayOfObjects = Object.entries(groupedData).map(([group, groupArray]) => {
      return {
        group,
        items: groupArray,
      };
    });

    console.log(arrayOfObjects)

    dispatch(setProducts(arrayOfObjects))
    setProductsCar(arrayOfObjects)

  }, [reload]);

  useEffect(() => {

    const ic = filterProductSlice.individualClasses
    let newArr: any = []
    setLoading(true)

    console.log(ic)
    
    ic?.forEach((iCGroup: any) => {
      let classesFilter: ProductDB[] = []
      classesFilter = [...iCGroup.items.filter((iC: ProductDB) => {
        let lengthCondition = true
        if(filterProductSlice.largo && filterProductSlice.largo?.length > 0) {
          filterProductSlice.largo.forEach(l => {
            lengthCondition ? lengthCondition = iC.id <= +l : false
          });
        } 

        let levelCondition = false

        if(filterProductSlice.nivel && filterProductSlice.nivel?.length > 0) {
          filterProductSlice.nivel.forEach(n => {
            !levelCondition ? levelCondition = iC.id == +n : true
          });
        }
        else {
          levelCondition = true
        }0

        let orderCondition = true

        if(filterProductSlice.ordenar && filterProductSlice.ordenar?.length > 0) {
          filterProductSlice.ordenar.forEach(n => {
            if(n == "nuevo") {
              orderCondition ? orderCondition = iC.isOpen : false
            }
            
          });
        }
        else {
          orderCondition = true
        }

        let seenCondition = true 
          if(filterProductSlice.seen) {
            if(auth.user) {
              seenCondition = auth.user?.classesSeen?.includes(iC._id)
            }
            else seenCondition = false
          }
        
        return levelCondition && lengthCondition && seenCondition && orderCondition
      })];
      classesFilter.length > 0 && newArr.push({ group: iCGroup.group , items: classesFilter })
      
    });

    console.log(newArr)

    // setClasses(newArr)
    setLoading(false)
  }, [filterProductSlice.largo, filterProductSlice.nivel, filterProductSlice.ordenar, filterProductSlice.seen])
  
    

  return (
    <div className='flex flex-col space-y-2 py-16 md:space-y-4 min-h-[100vh] justify-end lg:items-end mr-12 lg:mr-24  overflow-hidden'>
    <div className='absolute top-0 left-0 h-[100vh] w-full -z-10 overflow-hidden'>
        <div>
            
        </div>
    </div>
  </div>
  )
}

export default ProductCarousel