'use client';

import { Notification, User } from '../../typings';
import { Menu, Popover, Transition } from '@headlessui/react';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Bars3Icon, ChevronDownIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';
import { findAdminNavItem } from './admin/adminNav';
import { AdminLogo } from './admin/AdminLogo';
import { AdminThemeToggle } from './admin/AdminThemeToggle';
import type { AdminTheme } from './admin/useAdminTheme';

interface Props {
  showNav: boolean;
  setShowNav: (value: boolean | ((prev: boolean) => boolean)) => void;
  isMobile?: boolean;
  dbUser: User | null;
  theme: AdminTheme;
  onThemeChange: (theme: AdminTheme) => void;
}

const AdminDashboardTopBar = ({ showNav, setShowNav, theme, onThemeChange }: Props) => {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';
  const current = findAdminNavItem(pathname);
  const [notificationList, setNotificationList] = useState<Notification[] | null>(null);

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');

    if (!cookies) {
      router.push('/iniciar-sesion');
    }

    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol != 'Admin') {
      router.push('/iniciar-sesion');
    } else {
      setNotificationList(
        auth.user.notifications.filter((x: Notification) => !x.read).slice(-5).reverse()
      );
    }
  }, [auth.user]);

  const checkReadNotis = async () => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const userId = auth.user?._id;
    try {
      const { data } = await axios.put('/api/user/notifications/checkAsRead', { userId }, config);
      auth.setUserBack(data);
      setNotificationList(
        data.notifications.filter((x: Notification) => !x.read).slice(-5).reverse()
      );
    } catch (error) {}
  };

  const unreadCount = notificationList?.length || 0;

  return (
    <header
      className="fixed top-0 z-40 box-border flex h-[var(--admin-topbar)] w-full items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-surface)] !px-3 !py-0 md:!px-4"
    >
      <div className="flex min-w-0 items-center gap-2">
        <AdminLogo />
        <button
          type="button"
          aria-label={showNav ? 'Ocultar menú' : 'Mostrar menú'}
          onClick={() => setShowNav((v) => !v)}
          className="rounded-[var(--admin-radius)] p-1.5 text-[var(--admin-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <p className="truncate text-[13px] text-[var(--admin-muted)]">
          {current?.label || 'Admin'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <AdminThemeToggle theme={theme} onChange={onThemeChange} />
        <Popover className="relative">
          <Popover.Button className="relative rounded-[var(--admin-radius)] p-1.5 text-[var(--admin-muted)] outline-none hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]">
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--admin-destructive)]" />
            ) : null}
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-50 mt-2 w-80 rounded-[var(--admin-radius-lg)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow-float)]">
              <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-3 py-2">
                <p className="text-[13px] font-medium">Notificaciones</p>
                <button
                  type="button"
                  className="text-[12px] text-[var(--admin-muted)] hover:text-[var(--admin-fg)]"
                  onClick={checkReadNotis}
                >
                  Marcar como leídas
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {notificationList && notificationList.length > 0 ? (
                  notificationList.map((notification: Notification) => (
                    <div
                      className="flex items-start gap-2 rounded-[var(--admin-radius)] px-2 py-2"
                      key={notification.title}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          notification.status === 'green'
                            ? 'bg-[var(--admin-success-bg)]'
                            : notification.status === 'red'
                              ? 'bg-[var(--admin-destructive-bg)]'
                              : 'bg-[var(--admin-warning-bg)]'
                        }`}
                      >
                        <CheckIcon
                          className={`h-3 w-3 ${
                            notification.status === 'green'
                              ? 'text-[var(--admin-success)]'
                              : notification.status === 'red'
                                ? 'text-[var(--admin-destructive)]'
                                : 'text-[var(--admin-warning)]'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium">{notification.title}</p>
                        <p className="mt-0.5 text-[12px] text-[var(--admin-muted)]">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="px-2 py-6 text-center text-[12px] text-[var(--admin-muted)]">
                    No hay notificaciones
                  </p>
                )}
              </div>
            </Popover.Panel>
          </Transition>
        </Popover>

        <Menu as="div" className="relative">
          <Menu.Button className="inline-flex items-center gap-1.5 rounded-[var(--admin-radius)] px-1.5 py-1 text-[13px] text-[var(--admin-fg)] hover:bg-[var(--admin-hover)]">
            <span className="hidden max-w-[140px] truncate md:block">{auth.user?.name}</span>
            <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--admin-muted)]" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-[var(--admin-radius-lg)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1 shadow-[var(--admin-shadow-float)]">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/admin/facturacion"
                    className={`block rounded-[var(--admin-radius)] px-2 py-1.5 text-[13px] ${
                      active ? 'bg-[var(--admin-hover)]' : ''
                    }`}
                  >
                    Facturas
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/cuenta"
                    className={`block rounded-[var(--admin-radius)] px-2 py-1.5 text-[13px] ${
                      active ? 'bg-[var(--admin-hover)]' : ''
                    }`}
                  >
                    Cuenta
                  </Link>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};

export default AdminDashboardTopBar;
