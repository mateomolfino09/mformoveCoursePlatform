'use client';

import IndividaulProduct from '../../../../components/PageComponent/Products/IndividaulProduct';
import endpoints from '../../../../services/api';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function Page() {
  const productId = useSelector(
    (state: any) => state.productIdReducer.productId
  );

  const [product, setProduct] = useState();

  const fetchProduct = async () => {
    try {
      const response = await fetch(
        endpoints.product.getOne(productId.toString()),
        {
          method: 'GET'
        }
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setProduct(data.product);
      console.log(data.product);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]); // Call fetchProduct whenever productId changes

  return <IndividaulProduct product={product} />;
}
