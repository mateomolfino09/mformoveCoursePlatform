'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next13-progressbar';
import { PlusCircleIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { useAuth } from '../../../../hooks/useAuth';

export default function Page() {
  const router = useRouter();
  const auth = useAuth();

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

  return (
    <AdmimDashboardLayout>
      <div className="w-full md:h-[100vh]">
        <div className="mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-montserrat mb-4">
            Clases Gratuitas
          </h1>
          <p className="text-gray-600 text-lg font-montserrat">
            Productos evergreen de clases gratuitas secuenciales — sin fechas, desbloqueo por
            consumo del usuario.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8 max-w-2xl">
          <Link href="/admin/productos/clases-gratis/crear">
            <div className="group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4">
                <PlusCircleIcon className="w-12 h-12 text-white transition-colors duration-300" />
              </div>
              <p className="text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300">
                Crear Producto
              </p>
            </div>
          </Link>
          <Link href="/admin/productos/clases-gratis/todas">
            <div className="group relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl h-48 shadow-lg hover:shadow-xl hover:border-[#4F7CCF]/50 flex flex-col justify-center items-center transition-all duration-300 cursor-pointer overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="p-4 rounded-full bg-gray-800 group-hover:bg-[#4F7CCF] transition-all duration-300 mb-4">
                <TableCellsIcon className="w-12 h-12 text-white transition-colors duration-300" />
              </div>
              <p className="text-gray-900 font-medium text-lg font-montserrat group-hover:text-[#4F7CCF] transition-colors duration-300">
                Ver Listado
              </p>
            </div>
          </Link>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
}
