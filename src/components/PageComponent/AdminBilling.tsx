'use client';

import AdmimDashboardLayout from '../../components/AdmimDashboardLayout';
import { Bill } from '../../../typings';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Cookies from 'js-cookie';
import { AdminPage, AdminPageHeader, AdminEmptyState, AdminBadge } from '../admin';

interface Props {
  bills: Bill[];
}

const Billing = ({ bills }: Props) => {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');

    if (!cookies) {
      router.push('/iniciar-sesion');
    }

    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user.rol != 'Admin') router.push('/iniciar-sesion');
  }, [auth.user]);

  return (
    <AdmimDashboardLayout>
      <Head>
        <title>Facturación</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminPage wide>
        <AdminPageHeader title="Facturación" description="Pagos registrados en la plataforma." />
        {!bills || bills.length === 0 ? (
          <AdminEmptyState title="No hay facturas" description="Cuando haya pagos, van a aparecer acá." />
        ) : (
          <div className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--admin-border)]">
                    {['Usuario', 'Estado', 'ID pago', 'Tipo', 'Fecha'].map((label) => (
                      <th
                        key={label}
                        className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-[var(--admin-muted)]"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill: Bill) => (
                    <tr
                      key={+bill.merchant_order_id}
                      className="border-b border-[var(--admin-border)] last:border-b-0 hover:bg-[var(--admin-hover)]"
                    >
                      <td className="whitespace-nowrap px-3 py-2.5 text-[13px]">{bill.user.name}</td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <AdminBadge>{String(bill.status)}</AdminBadge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[12px] text-[var(--admin-muted)]">
                        {bill.payment_id.toString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[13px]">
                        {bill.payment_type.toString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] text-[var(--admin-muted)]">
                        {new Date(bill.createdAt).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AdminPage>
    </AdmimDashboardLayout>
  );
};

export default Billing;
