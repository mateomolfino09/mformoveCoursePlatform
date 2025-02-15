'use client';

import { User } from '../../../typings';
import DeleteUser from '../../components/DeleteUser';
import { useAuth } from '../../hooks/useAuth';
import AdmimDashboardLayout from '../AdmimDashboardLayout';
import DataTable from '../snippets/DataTable/DataTable';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface Props {
  initialData: {
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

const AdminUsers = ({ initialData }: Props) => {
  const router = useRouter();
  const auth = useAuth();

  const [users, setUsers] = useState<User[]>(initialData.users);
  const [totalUsers, setTotalUsers] = useState(initialData.total);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage);
  const [filter, setFilter] = useState<'ALL' | 'VIP' | 'NON_VIP'>('ALL');

  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [userSelected, setUserSelected] = useState<User | null>(null);
  const [isOpenRemoveVIP, setIsOpenRemoveVIP] = useState(false);

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

  const fetchUsers = async (
    page: number,
    filter: 'ALL' | 'VIP' | 'NON_VIP'
  ) => {
    try {
      const response = await fetch(
        `/api/users?page=${page}&limit=10&filter=${filter}`
      );
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

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchUsers(page, filter);
  };

  const removeVIP = async () => {
    if (userSelected) {
      try {
        const res = await fetch(`/api/user/subscription/remove`, {  // ✅ RUTA CORRECTA
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: userSelected._id })  // ✅ Enviar ID en el body
        });
  
        if (res.ok) {
          toast.success(`${userSelected.name} ya no es VIP`);
          fetchUsers(currentPage, filter);
        } else {
          toast.error('Error al eliminar la suscripción VIP');
        }
      } catch (error) {
        toast.error('Error al eliminar la suscripción VIP');
      }
  
      setIsOpenRemoveVIP(false);
    }
  };
  
  

  const openModalDelete = (user: User) => {
    setUserSelected(user);
    setIsOpenDelete(true);
  };

  const columns = [
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'rol', label: 'Rol', sortable: false },
    { key: 'createdAt', label: 'Creado', sortable: true },
    { key: 'subscription', label: 'VIP', sortable: false },
    { key: 'removeVIP', label: 'Eliminar VIP', sortable: false },
    { key: 'actions', label: 'Acciones', sortable: false }
  ] as const;

  return (
    <AdmimDashboardLayout>
      <div className='w-full h-auto min-h-screen'>
        <h1 className='text-2xl mt-4 mb-4'>Usuarios</h1>

        {/* Selector de Filtros */}
        <div className='mb-4'>
          <select
            id='filter-select'
            value={filter}
            onChange={(e) => {
              const selectedFilter = e.target.value as
                | 'ALL'
                | 'VIP'
                | 'NON_VIP';
              setFilter(selectedFilter);
              fetchUsers(1, selectedFilter);
            }}
            className='bg-gray-800 text-white px-3 py-2 rounded-md'
          >
            <option value='ALL'>Todos</option>
            <option value='VIP'>VIP</option>
            <option value='NON_VIP'>No VIP</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={users}
          total={totalUsers}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          customRenderers={{
            subscription: (value) => (
              <div
                className={`w-4 h-4 rounded-full ${
                  value ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
            ),
            removeVIP: (_, user) =>
              user.subscription ? (
                <button
                  onClick={() => {
                    setUserSelected(user);
                    setIsOpenRemoveVIP(true);
                  }}
                  className='bg-red-500 text-white px-2 py-1 rounded text-sm'
                >
                  Quitar VIP
                </button>
              ) : null,
            actions: (_, user) => (
              <div className='flex items-center justify-center space-x-2'>
                <Link
                  href={`/admin/updateUser/${user._id}`}
                  className='text-blue-500'
                >
                  <PencilIcon className='h-5 w-5' />
                </Link>
                <button
                  onClick={() => openModalDelete(user)}
                  className='text-red-500'
                >
                  <TrashIcon className='h-5 w-5' />
                </button>
              </div>
            )
          }}
        />

        <DeleteUser
          deleteUser={() => {}}
          isOpen={isOpenDelete}
          setIsOpen={setIsOpenDelete}
          user={userSelected}
        />

        {isOpenRemoveVIP && (
          <div className='fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg text-black'>
              {' '}
              {/* Se agregó text-black */}
              <h2 className='text-lg font-semibold mb-4'>Confirmar</h2>
              <p>
                ¿Seguro que quieres quitar la suscripción VIP a{' '}
                {userSelected?.name}?
              </p>
              <div className='mt-4 flex justify-end space-x-2'>
                <button
                  onClick={() => setIsOpenRemoveVIP(false)}
                  className='px-4 py-2 bg-gray-300 rounded'
                >
                  Cancelar
                </button>
                <button
                  onClick={removeVIP}
                  className='px-4 py-2 bg-red-500 text-white rounded'
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdmimDashboardLayout>
  );
};

export default AdminUsers;
