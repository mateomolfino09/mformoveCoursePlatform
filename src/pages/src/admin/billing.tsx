import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout';
import { UserContext } from '../../../hooks/userContext';
import { Bill, User } from '../../../../typings';
import { getAllBills } from '../../api/admin/getAllBills';
import { getUserFromBack } from '../../api/user/getUserFromBack';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Cookies from 'js-cookie';

interface Props {
  bills: Bill[];
}
const ShowUsers = ({ bills }: Props) => {
  const router = useRouter();
  let [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);


  const auth = useAuth()

  useEffect(() => {

    const cookies: any = Cookies.get('userToken')
    
    if (!cookies ) {
      router.push('/src/user/login');
    }
    
    if(!auth.user) {
      auth.fetchUser()
    }
    else if(auth.user.rol != 'Admin') router.push('/src/user/login');


  }, [auth.user]);

  return (
      <AdmimDashboardLayout>
        <>
          <Head>
            <title>Video Streaming</title>
            <meta name='description' content='Stream Video App' />
            <link rel='icon' href='/favicon.ico' />
          </Head>
          <div className='w-full h-[100vh]'>
            <div className='flex flex-col'>
              <div className='overflow-x-auto sm:-mx-6 lg:-mx-8'>
                <div className='inline-block min-w-full py-2 sm:px-6 lg:px-8'>
                  <div className='overflow-hidden'>
                    <h1 className='text-2xl mt-4 mb-4'>Facturación</h1>
                    <table className='min-w-full text-left text-sm font-light'>
                      <thead className='border-b font-medium dark:border-neutral-500'>
                        <tr>
                          <th scope='col' className='px-6 py-4'>
                            Curso
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Usuario
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Precio
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Estado
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            ID Pago
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Tipo de Pago
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Fecha
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bills?.map((bill: Bill) => (
                          <tr
                            key={+bill.merchant_order_id}
                            ref={ref}
                            className='border-b dark:border-neutral-500'
                          >
                            <td className='whitespace-nowrap px-6 py-4 font-medium'>
                              {bill.course.name}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {bill.user.name}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {bill.course.currency} {bill.course.price}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {bill.status}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {bill.payment_id.toString()}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {bill.payment_type.toString()}
                            </td>
                            <td className='whitespace-nowrap px-6 py-4'>
                              {new Date(bill.createdAt).toLocaleDateString(
                                'es-ES'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </AdmimDashboardLayout>
  );
};
export async function getServerSideProps(context: any) {
  const bills: any = await getAllBills();
  return { props: { bills } };
}

export default ShowUsers;
