'use client';

import { User } from '../../../typings';
import DeleteUser from '../../components/DeleteUser';
import { useAuth } from '../../hooks/useAuth';
import AdmimDashboardLayout from '../AdmimDashboardLayout';
import DataTable from '../snippets/DataTable/DataTable';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from '../../hooks/useToast';
import { AdminPage, AdminPageHeader, AdminButton, AdminBadge } from '../admin';

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
      router.push('/iniciar-sesion');
    }

    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol !== 'Admin') {
      router.push('/iniciar-sesion');
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
      <AdminPage wide>
        <AdminPageHeader
          title="Usuarios"
          description="Cuentas, roles y estado VIP."
        />

        <div className="mb-4">
          <label htmlFor="filter-select" className="mb-1.5 block text-[12px] font-medium text-[var(--admin-fg)]">
            Filtrar
          </label>
          <select
            id="filter-select"
            value={filter}
            onChange={(e) => {
              const selectedFilter = e.target.value as 'ALL' | 'VIP' | 'NON_VIP';
              setFilter(selectedFilter);
              fetchUsers(1, selectedFilter);
            }}
            className="h-8 w-full max-w-xs rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-white px-2.5 text-[13px] text-gray-900"
          >
            <option value="ALL">Todos</option>
            <option value="VIP">Solo VIP</option>
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
          customRenderers={{
            subscription: (value) =>
              value ? <AdminBadge variant="success">VIP</AdminBadge> : <AdminBadge>No</AdminBadge>,
            removeVIP: (_, user) =>
              user.subscription ? (
                <AdminButton
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setUserSelected(user);
                    setIsOpenRemoveVIP(true);
                  }}
                >
                  Quitar VIP
                </AdminButton>
              ) : null,
            actions: (_, user) => (
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/actualizar-usuario/${user._id}`}
                  className="text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
                  aria-label="Editar usuario"
                >
                  <PencilIcon className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => openModalDelete(user)}
                  className="text-[var(--admin-muted)] hover:text-[var(--admin-destructive)]"
                  aria-label="Eliminar usuario"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ),
          }}
        />

        <DeleteUser
          deleteUser={() => {}}
          isOpen={isOpenDelete}
          setIsOpen={setIsOpenDelete}
          user={userSelected}
        />

        {isOpenRemoveVIP ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-md rounded-[var(--admin-radius-lg)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-[var(--admin-shadow-float)]"
            >
              <h2 className="text-[15px] font-medium">Quitar VIP</h2>
              <p className="mt-2 text-[13px] text-[var(--admin-muted)]">
                ¿Quitar la suscripción VIP a <span className="text-[var(--admin-fg)]">{userSelected?.name}</span>?
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <AdminButton onClick={() => setIsOpenRemoveVIP(false)}>Cancelar</AdminButton>
                <AdminButton variant="destructive" onClick={removeVIP}>
                  Confirmar
                </AdminButton>
              </div>
            </div>
          </div>
        ) : null}
      </AdminPage>
    </AdmimDashboardLayout>
  );
};

export default AdminUsers;
