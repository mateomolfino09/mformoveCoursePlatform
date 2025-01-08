'use client';

import DeleteUser from '../../components/DeleteUser';
import { User } from '../../../typings';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import Cookies from 'js-cookie';
import AdmimDashboardLayout from '../AdmimDashboardLayout';
import DataTable from '../snippets/DataTable';

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

  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [userSelected, setUserSelected] = useState<User | null>(null);

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

  // Función para actualizar la lista de usuarios al cambiar de página
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

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;

    router.push(`/admin/users?page=${page}`);
    fetchUsers(page);
  };

  // Función para abrir el modal de eliminación
  const openModalDelete = (user: User) => {
    setUserSelected(user);
    setIsOpenDelete(true);
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
  // Función para eliminar un usuario
  const deleteUser = async () => {
    if (userSelected) {
      const userId = userSelected._id;

      try {
        const res = await fetch(`/api/user/delete/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
          }),
        });

        const data = await res.json();
        if (res.status == 200 ) {
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

  // Definir columnas para la tabla
  const columns = [
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'rol', label: 'Rol', sortable: false },
    { key: 'createdAt', label: 'Creado', sortable: true },
  ] as const;

  return (
    <AdmimDashboardLayout>
      <div className="w-full h-auto min-h-screen">
        <h1 className="text-2xl mt-4 mb-4">Usuarios</h1>
        <DataTable
  columns={columns}
  data={users}
  total={totalUsers}
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  onSort={handleSort}
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
