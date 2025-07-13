'use client';
import { useEffect, useState } from 'react';
import Products from '../../components/PageComponent/Products/Products';


export default function Page() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState([]);

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

    async function fetchFilters() {
      try {
        const res = await fetch('/api/product/getFilters', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        });
        const filtersData = await res.json();
        setFilters(filtersData);
      } catch (err) {
        console.error('Error fetching filters:', err);
        setFilters([]); // Set empty array on error
      }
    }

    fetchProducts();
    fetchFilters();
  }, []);

  return <Products products={products} filters={filters} />;
}
