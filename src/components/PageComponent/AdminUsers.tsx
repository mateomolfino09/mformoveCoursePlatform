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
  const [filter, setFilter] = useState<'ALL' | 'VIP' | 'NON_VIP'>('ALL'); // Selector state

  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [userSelected, setUserSelected] = useState<User | null>(null);

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

  const fetchUsers = async (page: number, filter: 'ALL' | 'VIP' | 'NON_VIP') => {
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

  const handleSort = (key: keyof User, direction: 'asc' | 'desc') => {
    const sortedUsers = [...users].sort((a, b) => {
      if (direction === 'asc') {
        return String(a[key]).localeCompare(String(b[key]));
      } else {
        return String(b[key]).localeCompare(String(a[key]));
      }
    });
    setUsers(sortedUsers);
  };

  const deleteUser = async () => {
    if (userSelected) {
      const userId = userSelected._id;

      try {
        const res = await fetch(`/api/user/delete/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          toast.success(`${userSelected.name} fue eliminado correctamente`);
          fetchUsers(currentPage, filter);
        } else {
          toast.error('Error al eliminar el usuario');
        }
      } catch (error) {
        toast.error('Error al eliminar el usuario');
      }

      setIsOpenDelete(false);
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
  ] as const;

  return (
    <AdmimDashboardLayout>
      <div className="w-full h-auto min-h-screen">
        <h1 className="text-2xl mt-4 mb-4">Usuarios</h1>
        <div className="mb-4">

  <select
    id="filter-select"
    value={filter}
    onChange={(e) => {
      const selectedFilter = e.target.value as 'ALL' | 'VIP' | 'NON_VIP';
      setFilter(selectedFilter);
      fetchUsers(1, selectedFilter); // Fetch users on change
    }}
    className="block w-40 px-3 py-2 border border-gray-300 bg-white text-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  >
    <option value="ALL">Todos</option>
    <option value="VIP">VIP</option>
    <option value="NON_VIP">No VIP</option>
  </select>
</div>

        <DataTable
          columns={columns}
          data={users}
          total={totalUsers}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onSort={handleSort}
          customRenderers={{
            subscription: (value) => (
              <div
                className={`w-4 h-4 rounded-full ${
                  value ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={value ? 'VIP' : 'No VIP'}
              ></div>
            ),
          }}
          renderActions={(user) => (
            <div className="flex items-center justify-center text-base">
              <Link href={`/admin/updateUser/${user._id}`} className="w-6 mr-2">
                <PencilIcon className="h-6 w-6 text-blue-500" />
              </Link>
              <div
                onClick={() => openModalDelete(user)}
                className="w-6 mr-2 cursor-pointer"
              >
                <TrashIcon className="h-6 w-6 text-red-500" />
              </div>
            </div>
          )}
        />
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

export default AdminUsers;
