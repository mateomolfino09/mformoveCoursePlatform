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
      router.push('/user/login');
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
        <header className={`bg-[#141414]`}>
          <Link href='/home'>
            <img
              src='/images/logoWhite.png'
              width={120}
              height={120}
              className='cursor-pointer object-contain transition duration-500 hover:scale-105 opacity-80 hover:opacity-100'
            />
          </Link>
          <Link href='/user/account'>
            <AiOutlineUser className='h-6 w-6 cursor-pointer' />
          </Link>
        </header>
        <div className='w-full px-4 py-4 lg:px-10 lg:py-6 min-h-screen mt-24'>
          <h1 className='text-2xl mb-8'>Detalles Facturación</h1>
          <table className='min-w-full text-sm  '>
            <thead>
              <tr>
                <th className='border rounded-md text-xl px-1'>Curso</th>
                <th className='border  text-xl px-1'>Precio</th>
                <th className='border  text-xl px-1'>Status</th>
                <th className='border  text-xl px-1'>Id Pago</th>
                <th className='border  text-xl px-1'>Tipo de Pago</th>
                <th className='border rounded-md  text-xl px-1'>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill: Bill) => (
                <tr key={bill ? +bill.payment_id : 0} ref={ref}>
                  <th className='border-solid border border-collapse  bg-gray-900/70 text-base opacity-75'>
                    {bill.course.name}
                  </th>
                  <th className='border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1'>
                    {bill.course.currency} {bill.course.price}
                  </th>
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
      </>
  );
};

export default Billing;
