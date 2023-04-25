import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { parseCookies } from 'nookies'
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout'  
import { UserContext } from '../../../hooks/userContext'
import { State } from '../../../redux/reducers'
import { User } from '../../../typings'
import { getUserFromBack } from '../../api/user/getUserFromBack'
import { HomeIcon, CreditCardIcon, UserIcon, PlusCircleIcon,TableCellsIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'


interface Props {
  user: User;
}

const Index = ({ user }: Props) => {
  const [userCtx, setUserCtx] = useState<User>(user);
  const router = useRouter();

  const providerValue = useMemo(
    () => ({ userCtx, setUserCtx }),
    [userCtx, setUserCtx]
  );

  if (user === null || user.rol != "Admin") {
    router.push("/src/user/login");
  }

  return (
    <UserContext.Provider value={providerValue}>
      <AdmimDashboardLayout>
        <div className='bg-gray-700 w-full md:h-[100vh]'>
          <p className="text-white text-3xl my-12 font-bold">Bienvenido al Dashboard</p>

          <div className="grid lg:grid-cols-3 gap-5 mb-16">
            <Link href={'/src/admin/users'} >
            <div className="rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer">
              <UserIcon className='w-24'/>
              <p>Usuarios</p>
            </div>
            </Link>
            <Link href={'/src/admin/courses'} >
            <div className="rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer">
              <TableCellsIcon className='w-24'/>
              <p>Cursos</p>
            </div>
            </Link>
            <Link href={'/src/admin/billing'} >
            <div className="rounded bg-gray-500 h-40 shadow-sm flex justify-center items-center flex-col hover:scale-105 transition duration-500 cursor-pointer">
              <CreditCardIcon className='w-24'/>
              <p>Facturación</p>
            </div>
            </Link>
          </div>
          <div className="grid col-1 bg-gray-500 h-96 shadow-sm"></div>
        </div>
      </AdmimDashboardLayout>
    </UserContext.Provider>
  );
};

export async function getServerSideProps(context: any) {
  const { params, query, req, res } = context;
  const session = await getSession({ req });
  // Get a cookie
  const cookies = parseCookies(context);
  const userCookie = cookies?.user ? JSON.parse(cookies.user) : session?.user;
  const email = userCookie.email;

  const user = await getUserFromBack(email);

  return {
    props: { user },
  };
}

export default Index;
