'use client';
import { useEffect, useState } from 'react';
import AllProducts from '../../../../components/PageComponent/Products/AllProducts';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';

export default function Page() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <AdmimDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </AdmimDashboardLayout>
    );
  }

  return <AllProducts products={products} />;
}
