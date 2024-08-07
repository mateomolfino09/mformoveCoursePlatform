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
import { toast } from 'react-toastify';
import {  setProductId } from '../../../redux/features/productId';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

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

    console.log(arrayOfObjects);

    dispatch(setProducts(arrayOfObjects));
    setProductsCar(arrayOfObjects);
  }, [reload]);

  useEffect(() => {
    const ic = filterProductSlice.individualClasses;
    let newArr: any = [];
    setLoading(true);

    console.log(ic);

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

    console.log(newArr);

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

 
  const showProductPage = async (productId: string): Promise<void> => {
    try {
      const response = await fetch(endpoints.product.getOne(productId.toString()), {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log(data.product);
    } catch (error) {
      console.error(error);
    }

    dispatch(setProductId(productId.toString()))
    router.push('/admin/products/individualProduct')
  };




  return (
    <div className='flex flex-col space-y-3 py-16 justify-end lg:items-end mr-12 lg:mr-24 overflow-hidden'>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
     
        {filteredProducts.map((item: ProductDB) => (
        
          <>
          
            <div
              key={item._id}
              style={styleCard}
              className={`bg-white p-4 rounded-lg shadow-md p-0`}
              onClick={()=>showProductPage( item._id)}
            >
              <center>
                <img
                  src={
                    'https://img.freepik.com/foto-gratis/vista-posterior-mujer-haciendo-yoga-al-aire-libre_23-2148769551.jpg'
                  }
                  alt={item.name}
                 // loader={imageLoader}
                  width={"100%"}
                  height={"200px"}
                  style={styleImage}
                />
              </center>
              <div className='p-4'>
                <div>
                  <p className='text-lg font-bold mb-2 text-gray-600 mt-3'>
                    {item.name}
                  </p>
                </div>
                <div className='text-sm text-gray-600 text-wrap'>
                  {' '}
                  {/* Added the 'text-sm' class here */}
                  <p>{item.description}</p>
                </div>
                <div className='flex justify-between items-center mt-4'>
                  <p className='text-sm text-gray-600'>
                    Price: {item.price} {item.currency}
                  </p>
                  <p className='text-sm text-gray-600'>Likes: {item.likes}</p>
                </div>
                <div className='mt-4'>
                 {/*  <a
                    href={item?.paymentLink}
                    className='text-blue-500 hover:underline'
                  >
                    Payment Link
                  </a> */}
                  <p   className='text-blue-500 hover:underline'>Payment Link</p>
                </div>
              </div>
            </div>
          </>
          
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
