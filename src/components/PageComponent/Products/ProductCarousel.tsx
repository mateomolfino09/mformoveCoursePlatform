'use client';

import imageLoader from '../../../../imageLoader';
import { ProductDB } from '../../../../typings';
import { useAuth } from '../../../hooks/useAuth';
import { setProducts } from '../../../redux/features/filterProduct';
import { useAppSelector } from '../../../redux/hooks';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import Cookies from 'js-cookie';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import endpoints from '../../../services/api';
import { toast } from '../../../hooks/useToast';
import {  setProductId } from '../../../redux/features/productId';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import ProductCard from './ProductCard';

interface Props {
  products: ProductDB[];
}

const ProductCarousel = ({ products }: Props) => {
  const router = useRouter();
  const productType = useSelector(
    (state: any) => state?.filterProduct?.value?.productType

  );

  const [filteredProducts, setFilteredProducts] = useState<any>(products);

  const [typedProducts, setProductsCar] = useState<any | null>(null);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);

  const filterProductSlice = useAppSelector(
    (state) => state.filterProduct.value
  );

  const auth = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');

    if (!auth.user) {
      auth.fetchUser();
    }
    setReload(true);

    const groupedData = products?.reduce((acc: any, obj) => {
      const groupKey = obj.productType;

      // If the group doesn't exist in the accumulator, create it
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }

      // Push the current object to the group
      acc[groupKey].push(obj);

      return acc;
    }, {});

    const arrayOfObjects = Object.entries(groupedData).map(
      ([group, groupArray]) => {
        return {
          group,
          items: groupArray
        };
      }
    );

    dispatch(setProducts(arrayOfObjects));
    setProductsCar(arrayOfObjects);
  }, [reload]);

  useEffect(() => {
    const ic = filterProductSlice.individualClasses;
    let newArr: any = [];
    setLoading(true);

    ic?.forEach((iCGroup: any) => {
      let classesFilter: ProductDB[] = [];
      classesFilter = [
        ...iCGroup.items.filter((iC: ProductDB) => {
          let lengthCondition = true;
          if (
            filterProductSlice.largo &&
            filterProductSlice.largo?.length > 0
          ) {
            filterProductSlice.largo.forEach((l) => {
              lengthCondition ? (lengthCondition = iC.id <= +l) : false;
            });
          }

          let levelCondition = false;

          if (
            filterProductSlice.nivel &&
            filterProductSlice.nivel?.length > 0
          ) {
            filterProductSlice.nivel.forEach((n) => {
              !levelCondition ? (levelCondition = iC.id == +n) : true;
            });
          } else {
            levelCondition = true;
          }
          0;

          let orderCondition = true;

          if (
            filterProductSlice.ordenar &&
            filterProductSlice.ordenar?.length > 0
          ) {
            filterProductSlice.ordenar.forEach((n) => {
              if (n == 'nuevo') {
                orderCondition ? (orderCondition = iC.isOpen) : false;
              }
            });
          } else {
            orderCondition = true;
          }

          let seenCondition = true;
          if (filterProductSlice.seen) {
            if (auth.user) {
              seenCondition = auth.user?.classesSeen?.includes(iC._id);
            } else seenCondition = false;
          }

          return (
            levelCondition && lengthCondition && seenCondition && orderCondition
          );
        })
      ];
      classesFilter.length > 0 &&
        newArr.push({ group: iCGroup.group, items: classesFilter });
    });

    // setClasses(newArr)
    setLoading(false);
  }, [
    filterProductSlice.largo,
    filterProductSlice.nivel,
    filterProductSlice.ordenar,
    filterProductSlice.seen
  ]);

  const styleCard = {
    height: '100%',
    borderRadius: '20px'
  };

  const styleImage = {
   // display: 'block',
    borderTopLeftRadius: '20px 20px',
    borderTopRightRadius: '20px 20px',

  };

  useEffect(()=>{

    if(productType == "all"){
      setFilteredProducts(products)
    }
    if(productType.toLowerCase() == "workshop"){
      const workShops =  products.filter(x => x?.productType.toLowerCase() == "workshop")
      setFilteredProducts(workShops)
    }
    if(productType.toLowerCase() == "curso"){
      const cursos =  products.filter(x => x?.productType.toLowerCase() == "curso")
      setFilteredProducts(cursos)
    }


  },[productType])


  return (
    <div className='flex flex-col space-y-3 py-16 justify-end lg:items-end pr-4 lg:mr-24 overflow-hidden'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-12 ml-4 md:ml-20 lg:ml-28'>
        {filteredProducts.map((item: ProductDB) => (
          <div key={item._id}>

            <ProductCard product={item}/>
          
          </div>
          
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
