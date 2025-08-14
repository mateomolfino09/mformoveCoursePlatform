'use client'
import { Bill, User } from '../../../typings';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { parseCookies } from 'nookies';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import Cookies from 'js-cookie';
import { useAuth } from '../../hooks/useAuth';
import MainSideBar from '../MainSidebar/MainSideBar';

interface Props {
  bills: Bill[];
}
const Billing = ({ bills }: Props) => {
  const cookies = parseCookies();
  const router = useRouter();
  let [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const auth = useAuth()

  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }


  }, [auth.user]);

  function openModal() {
    setIsOpen(true);
  }

  return (
      <>
        <Head>
          <title>Video Streaming</title>
          <meta name='description' content='Stream Video App' />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <MainSideBar where={'home'}>
          <div className='w-full px-4 py-4 lg:px-10 lg:py-6 min-h-screen mt-24 font-montserrat'>
            <h1 className='text-2xl mb-8'>Detalles Facturación</h1>
            <table className='min-w-full text-sm  '>
              <thead>
                <tr>
                  <th className='border  text-xl px-1'>Status</th>
                  <th className='border  text-xl px-1'>Id Pago</th>
                  <th className='border  text-xl px-1'>Tipo de Pago</th>
                  <th className='border rounded-md  text-xl px-1'>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill: Bill) => (
                  <tr key={bill ? +bill.payment_id : 0} ref={ref}>
                    <th className='border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1'>
                      {bill.status}
                    </th>
                    <th className='border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1'>
                      {bill.payment_id.toString()}
                    </th>
                    <th className='border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1'>
                      {bill.payment_type.toString()}
                    </th>
                    <th className='border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1'>
                      {new Date(bill.createdAt).toLocaleDateString('es-ES')}
                    </th>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </MainSideBar>
      </>
  );
};

export default Billing;
