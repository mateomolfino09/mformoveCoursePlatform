'use client';

import DeleteUser from '../../components/DeleteUser';
import { User } from '../../../typings';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import Cookies from 'js-cookie';
import AdmimDashboardLayout from '../AdmimDashboardLayout';

interface InitialData {
  users: User[];
  total: number;
  totalPages: number;
  currentPage: number;
}

interface Props {
  initialData: InitialData;
}

const ShowUsers = ({ initialData }: Props) => {
  const router = useRouter();

  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [userSelected, setUserSelected] = useState<User | null>(null);

  // Estados para usuarios y paginación
  const [users, setUsers] = useState<User[]>(initialData.users);
  const [totalUsers, setTotalUsers] = useState(initialData.total);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage);

  const auth = useAuth();

  // Manejo de autenticación
  useEffect(() => {
    const userToken = Cookies.get('userToken');
    if (!userToken) {
      router.push('/login');
    }

    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol !== 'Admin') {
      router.push('/login');
    }
  }, [auth.user, router]);

  /**
   * Función para actualizar la lista de usuarios al cambiar de página.
   */
  const fetchUsers = async (page: number) => {
    try {
      const response = await fetch(`/api/users?page=${page}&limit=10`);
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
  
      const data = await response.json();
  
      setUsers(data.users);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalUsers(data.total);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar usuarios');
    }
  };
  

  /**
   * Función para manejar el cambio de página.
   * @param page Número de página a navegar.
   */
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;

    router.push(`/admin/users?page=${page}`);
    fetchUsers(page);
  };

  /**
   * Función para eliminar un usuario.
   */
  const deleteUser = async () => {
    if (userSelected) {
      const userId = userSelected._id;

      try {
        const res = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
          }),
        });

        const data = await res.json();
        if (data.success) {
          toast.success(`${userSelected.name} fue eliminado correctamente`);
          fetchUsers(currentPage); // Refrescar usuarios después de la eliminación
        } else {
          toast.error('Error al eliminar el usuario');
        }
      } catch (error) {
        toast.error('Error al eliminar el usuario');
      }

      setIsOpenDelete(false);
    }
  };

  /**
   * Abre el modal para eliminar un usuario.
   * @param user Usuario seleccionado.
   */
  function openModalDelete(user: User) {
    setUserSelected(user);
    setIsOpenDelete(true);
  }

  /**
   * Genera los botones de paginación.
   */
  const renderPagination = () => {
    const pages = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
            i === currentPage
              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='w-full h-auto min-h-screen'>
        <div className='flex flex-col'>
          <div className='overflow-x-auto sm:-mx-6 lg:-mx-8'>
            <div className='inline-block min-w-full py-2 sm:px-6 lg:px-8'>
              <div className='overflow-hidden'>
                <h1 className='text-2xl mt-4 mb-4'>Usuarios</h1>
                <table className='min-w-full text-left text-sm font-light'>
                  <thead className='border-b font-medium dark:border-neutral-500'>
                    <tr>
                      <th className='px-6 py-4'>Nombre</th>
                      <th className='px-6 py-4'>Email</th>
                      <th className='px-6 py-4'>Rol</th>
                      <th className='px-6 py-4'>Creado</th>
                      <th className='px-6 py-4'>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user._id} className='border-b dark:border-neutral-500'>
                          <td className='px-6 py-4'>{user.name}</td>
                          <td className='px-6 py-4'>{user.email}</td>
                          <td className='px-6 py-4'>{user.rol}</td>
                          <td className='px-6 py-4'>
                            {new Date(user.createdAt).toLocaleDateString('es-ES')}
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center justify-center text-base'>
                              <Link href={`/admin/updateUser/${user._id}`} className='w-6 mr-2'>
                                <PencilIcon />
                              </Link>
                              <div
                                onClick={() => openModalDelete(user)}
                                className='w-6 mr-2 cursor-pointer'
                              >
                                <TrashIcon />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className='text-center py-4'>
                          No hay usuarios para mostrar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className='flex justify-between items-center mt-4'>
                  <p className='text-sm text-gray-700'>
                    Mostrando {users.length > 0 ? (currentPage - 1) * 10 + 1 : 0} a{' '}
                    {(currentPage - 1) * 10 + users.length} de {totalUsers} resultados
                  </p>
                  <nav className='isolate inline-flex -space-x-px rounded-md shadow-sm'>
                    {renderPagination()}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DeleteUser
          isOpen={isOpenDelete}
          setIsOpen={setIsOpenDelete}
          user={userSelected}
          deleteUser={deleteUser}
        />
      </div>
    </AdmimDashboardLayout>
  );
};

export default ShowUsers;
