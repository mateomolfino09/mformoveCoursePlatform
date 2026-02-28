'use client'
import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import {
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';
import endpoints from '../../../services/api';
import { toast } from '../../../hooks/useToast';
import Link from 'next/link';

interface Promocion {
  _id: string;
  nombre: string;
  descripcion?: string;
  porcentajeDescuento: number;
  frecuenciasAplicables: string[];
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  codigoPromocional?: string;
  createdAt: string;
}

const AllPromociones = () => {
  const router = useRouter();
  const auth = useAuth();
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [promocionSelected, setPromocionSelected] = useState<Promocion | null>(null);
  const [isOpenDelete, setIsOpenDelete] = useState(false);

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');
    
    if (!cookies) {
      router.push('/login');
    }
    
    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol != 'Admin') {
      router.push('/login');
    }
  }, [auth.user]);

  useEffect(() => {
    fetchPromociones();
  }, []);

  const fetchPromociones = async () => {
    try {
      const url = endpoints?.payments?.promocion?.getActive 
        ? `${endpoints.payments.promocion.getActive}?all=true`
        : '/api/payments/promocion/getActive?all=true';
      
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
      const data = await res.json();
      if (data.success) {
        setPromociones(data.promociones);
      }
    } catch (err) {
      console.error('Error fetching promociones:', err);
      toast.error('Error al cargar las promociones');
    } finally {
      setLoading(false);
    }
  };

  const deletePromocion = async () => {
    if (!promocionSelected) return;

    try {
      const url = endpoints?.payments?.promocion?.delete
        ? endpoints.payments.promocion.delete(promocionSelected._id)
        : `/api/payments/promocion/${promocionSelected._id}`;
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`${promocionSelected.nombre} fue eliminada correctamente`);
        setPromociones(promociones.filter(p => p._id !== promocionSelected._id));
        setIsOpenDelete(false);
        setPromocionSelected(null);
      } else {
        toast.error(data.error || 'Error al eliminar la promoción');
      }
    } catch (error: any) {
      toast.error('Error al eliminar la promoción');
    }
  };

  const openModalDelete = (p: Promocion) => {
    setPromocionSelected(p);
    setIsOpenDelete(true);
  };

  const isActive = (promocion: Promocion) => {
    const now = new Date();
    const fechaFin = new Date(promocion.fechaFin);
    const fechaInicio = new Date(promocion.fechaInicio);
    return promocion.activa && fechaFin > now && fechaInicio <= now;
  };

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>Promociones</title>
        <meta name='description' content='Gestiona las promociones' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='w-full h-[100vh]'>
        <div className='flex flex-col'>
          <div className='overflow-x-auto sm:-mx-6 lg:-mx-8'>
            <div className='inline-block min-w-full py-2 sm:px-6 lg:px-8'>
              <div className='overflow-hidden'>
                <div className='mb-8 mt-8 flex justify-between items-center'>
                  <div>
                    <h1 className='text-4xl md:text-5xl font-bold text-gray-900 font-montserrat mb-4'>
                      Promociones
                    </h1>
                    <p className='text-gray-600 text-lg font-montserrat'>
                      Gestiona tus promociones de membresía
                    </p>
                  </div>
                  <Link href={'/admin/memberships/promociones/create'}>
                    <button className='bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#4F7CCF] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center space-x-2 font-montserrat font-semibold shadow-lg'>
                      <span>+</span>
                      <span>Crear Promoción</span>
                    </button>
                  </Link>
                </div>
                {loading ? (
                  <div className='flex justify-center items-center py-12'>
                    <p className='text-gray-500'>Cargando promociones...</p>
                  </div>
                ) : promociones.length === 0 ? (
                  <div className='bg-white border border-gray-200 rounded-2xl shadow-lg p-12 text-center'>
                    <p className='text-gray-500 text-lg mb-4'>No hay promociones creadas</p>
                    <Link href={'/admin/memberships/promociones/create'}>
                      <button className='bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#4F7CCF] text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 font-montserrat font-semibold'>
                        Crear Primera Promoción
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className='bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden'>
                    <table className='min-w-full text-left text-sm font-light font-montserrat'>
                      <thead className='border-b font-medium border-gray-200 bg-gray-50'>
                        <tr>
                          <th scope='col' className='px-6 py-4 text-gray-900 font-semibold'>
                            Nombre
                          </th>
                          <th scope='col' className='px-6 py-4 text-gray-900 font-semibold'>
                            Descuento
                          </th>
                          <th scope='col' className='px-6 py-4 text-gray-900 font-semibold'>
                            Frecuencias
                          </th>
                          <th scope='col' className='px-6 py-4 text-gray-900 font-semibold'>
                            Fecha Inicio
                          </th>
                          <th scope='col' className='px-6 py-4 text-gray-900 font-semibold'>
                            Fecha Fin
                          </th>
                          <th scope='col' className='px-6 py-4 text-gray-900 font-semibold'>
                            Estado
                          </th>
                          <th scope='col' className='px-6 py-4 text-gray-900 font-semibold'>
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {promociones.map((promocion: Promocion) => (
                          <tr
                            key={promocion._id}
                            className='border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200'
                          >
                            <td className='whitespace-nowrap px-6 py-4 font-medium text-gray-900'>
                              {promocion.nombre}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4 text-gray-900 font-semibold'>
                              {promocion.porcentajeDescuento}%
                            </td>
                            <td className='whitespace-nowrap px-6 py-4 text-gray-600'>
                              {promocion.frecuenciasAplicables.join(', ')}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4 text-gray-600'>
                              {new Date(promocion.fechaInicio).toLocaleDateString('es-ES')}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4 text-gray-600'>
                              {new Date(promocion.fechaFin).toLocaleDateString('es-ES')}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  isActive(promocion)
                                    ? 'bg-green-100 text-green-800 border border-green-300'
                                    : 'bg-red-100 text-red-800 border border-red-300'
                                }`}
                              >
                                {isActive(promocion) ? 'Activa' : 'Inactiva'}
                              </span>
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              <div className='flex items-center justify-center gap-3'>
                                <Link href={`/admin/memberships/promociones/edit/${promocion._id}`}>
                                  <button
                                    className='text-[#4F7CCF] hover:text-[#234C8C] hover:scale-110 cursor-pointer transition-all duration-200'
                                    title='Editar'
                                  >
                                    <PencilIcon className='w-5 h-5' />
                                  </button>
                                </Link>
                                <button
                                  onClick={() => openModalDelete(promocion)}
                                  className='text-red-600 hover:text-red-700 hover:scale-110 cursor-pointer transition-all duration-200'
                                  title='Eliminar'
                                >
                                  <TrashIcon className='w-5 h-5' />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {isOpenDelete && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl'>
            <h3 className='text-2xl font-bold text-gray-900 mb-4 font-montserrat'>
              Confirmar Eliminación
            </h3>
            <p className='text-gray-600 mb-6 font-montserrat'>
              ¿Estás seguro de que deseas eliminar la promoción "{promocionSelected?.nombre}"?
              Esta acción no se puede deshacer.
            </p>
            <div className='flex justify-end space-x-4'>
              <button
                onClick={() => {
                  setIsOpenDelete(false);
                  setPromocionSelected(null);
                }}
                className='px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 font-montserrat border border-gray-200'
              >
                Cancelar
              </button>
              <button
                onClick={deletePromocion}
                className='px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 font-montserrat'
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdmimDashboardLayout>
  );
};

export default AllPromociones;

