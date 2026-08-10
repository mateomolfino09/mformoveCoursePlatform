'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { PencilIcon, TrashIcon, EyeIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import AdmimDashboardLayout from '../../AdmimDashboardLayout';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from '../../../hooks/useToast';
import endpoints from '../../../services/api';
import DeleteProduct from './DeleteProduct';

type FreeSequentialProduct = {
  _id: string;
  nombre: string;
  descripcion: string;
  createdAt: string;
  secuenciaConfig?: { slug?: string; publicado?: boolean };
  classCount: number;
};

type Props = {
  products: FreeSequentialProduct[];
};

export default function FreeSequentialProductsList({ products }: Props) {
  const router = useRouter();
  const auth = useAuth();

  const [elementos, setElementos] = useState<FreeSequentialProduct[]>(products);
  const [productSelected, setProductSelected] = useState<FreeSequentialProduct | null>(null);
  const [isOpenDelete, setIsOpenDelete] = useState(false);

  useEffect(() => {
    const cookie = Cookies.get('userToken');
    if (!cookie) {
      router.push('/iniciar-sesion');
      return;
    }
    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol !== 'Admin') {
      router.push('/iniciar-sesion');
    }
  }, [auth.user]);

  useEffect(() => {
    setElementos(products);
  }, [products]);

  function openDelete(product: FreeSequentialProduct) {
    setProductSelected(product);
    setIsOpenDelete(true);
  }

  async function deleteProduct() {
    if (!productSelected) return;

    const res = await fetch(endpoints.product.delete(productSelected._id), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: productSelected._id }),
    });
    const data = await res.json();

    if (data.success) {
      setElementos((prev) => prev.filter((p) => p._id !== productSelected._id));
      toast.success(`${productSelected.nombre} fue eliminado correctamente`);
    } else {
      toast.error('No se pudo eliminar el producto');
    }
    setIsOpenDelete(false);
  }

  return (
    <AdmimDashboardLayout>
      <div className="w-full min-h-screen font-montserrat">
        <div className="flex justify-between items-center mb-8 mt-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-montserrat">
              Clases Gratuitas
            </h1>
            <p className="text-gray-600 text-lg font-montserrat">
              Productos de clases gratuitas secuenciales (lead magnet evergreen)
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/productos/clases-gratis">
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-montserrat transition-colors duration-300">
                Volver
              </button>
            </Link>
            <Link href="/admin/productos/clases-gratis/crear">
              <button className="bg-[#1A1A1A] text-white px-4 py-2 rounded-md hover:bg-[#234C8C] hover:text-white flex items-center space-x-2 font-montserrat transition-colors duration-300">
                <PlusCircleIcon className="w-5 h-5" />
                <span>Crear Producto</span>
              </button>
            </Link>
          </div>
        </div>

        {elementos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-600 font-montserrat">
              Todavía no creaste ningún producto de clases gratuitas.
            </p>
            <Link
              href="/admin/productos/clases-gratis/crear"
              className="mt-4 inline-block text-[#234C8C] hover:underline font-montserrat"
            >
              Crear el primero
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm font-light bg-[#F7F7F7] rounded-xl shadow font-montserrat border border-[#E5E7EB]">
              <thead className="border-b font-medium border-[#E5E7EB] bg-white">
                <tr>
                  <th className="px-6 py-4 text-[#1A1A1A]">Nombre</th>
                  <th className="px-6 py-4 text-[#1A1A1A]">Página pública</th>
                  <th className="px-6 py-4 text-[#1A1A1A]">Clases</th>
                  <th className="px-6 py-4 text-[#1A1A1A]">Publicado</th>
                  <th className="px-6 py-4 text-[#1A1A1A]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {elementos.map((product) => {
                  const slug = product.secuenciaConfig?.slug;
                  return (
                    <tr
                      key={product._id}
                      className="border-b border-[#E5E7EB] text-[#222] font-montserrat bg-[#F7F7F7]"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="font-semibold text-[#1A1A1A]">{product.nombre}</p>
                        <p className="max-w-xs truncate text-xs text-[#6B7280]">
                          {product.descripcion}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[#6B7280]">
                        {slug ? `/clases-gratis/${slug}` : 'Sin slug'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[#1A1A1A]">
                        {product.classCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            product.secuenciaConfig?.publicado
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {product.secuenciaConfig?.publicado ? 'Publicado' : 'Borrador'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3 text-base">
                          {slug && (
                            <Link
                              href={`/clases-gratis/${slug}`}
                              target="_blank"
                              className="w-6 transform text-gray-600 transition hover:scale-110 hover:text-[#234C8C]"
                              title="Ver página pública"
                            >
                              <EyeIcon />
                            </Link>
                          )}
                          <Link
                            href={`/admin/productos/editar-producto/${product._id}`}
                            className="w-6 transform text-gray-600 transition hover:scale-110 hover:text-[#A7B6C2]"
                            title="Editar"
                          >
                            <PencilIcon />
                          </Link>
                          <button
                            onClick={() => openDelete(product)}
                            className="w-6 transform text-gray-600 transition hover:scale-110 hover:text-[#FFD600]"
                            title="Eliminar"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <DeleteProduct
          product={productSelected as any}
          deleteProduct={deleteProduct}
          isOpen={isOpenDelete}
          setIsOpen={setIsOpenDelete}
        />
      </div>
    </AdmimDashboardLayout>
  );
}
