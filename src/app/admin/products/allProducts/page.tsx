'use client';
import { useEffect, useState } from 'react';
import AllProducts from '../../../../components/PageComponent/Products/AllProducts';

export default function Page() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/product/getProducts', {
          // Configuración para evitar el caché:
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        });
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    }

    fetchProducts();
  }, []);

  return <AllProducts products={products} />;
}
