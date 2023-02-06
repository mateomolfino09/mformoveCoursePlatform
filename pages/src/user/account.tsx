import { signOut, useSession } from 'next-auth/react';
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { State } from '../../../redux/reducers';
import { loadUser } from '../../../redux/user/userAction';
import cookie from "js-cookie";
import axios from 'axios';
import { User } from '../../../typings';
import Membership from '../../../components/Membership';

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"
];

function Account() {


    const dispatch = useAppDispatch()
    const profile = useSelector((state: State) => state.profile)
    const [userDB, setUserDB] = useState<User | null>(null)  
    const { dbUser } = profile
    const cookies = parseCookies();
    const { data: session } = useSession();
    const router = useRouter();
    const [userState, setUserState] = useState<any>(null);
    
    const user: User = dbUser
      ? dbUser
      : cookies?.user
      ? JSON.parse(cookies.user)
      : session?.user
      ? session?.user
      : "";

    useEffect(() => {
        session ? setUserState(session.user) : setUserState(user);
  
    const getUserDB = async () => {
        try {
          const config = {
              headers: {
                "Content-Type": "application/json",
              },
            }
          const email = user.email
          const { data } = await axios.post('/api/user/getUser', { email }, config)
          !userDB ? setUserDB(data) : null
          //eslint-disable-next-line react-hooks/exhaustive-deps
        ;
        } catch (error: any) {
            console.log(error.message)
        }
    }
  
    getUserDB()
      }, [router, session]);
    
    const logoutHandler = async () => {
    if (session) signOut();
    cookie.remove("token");
    cookie.remove("user");

    router.push("/src/user/login");
    };

  return (
    <div>
        <Head>
        <title>Video Streaming</title>
        <meta name="description" content="Stream Video App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={`bg-[#141414]`}>
        <Link href="/">
          <img
            src="https://rb.gy/ulxxee"
            width={120}
            height={120}
            className="cursor-pointer object-contain"
          />
        </Link>
        <Link href="/src/user/account">
          <img
            src="https://rb.gy/g1pwyx"
            alt=""
            className="cursor-pointer rounded"
            // onClick={() => logoutHandler()}
          />
        </Link>
      </header>

      <main className='mx-auto max-w-6xl pt-24 px-5 pb-12 transition-all md:px-10 '>
        <div className='flex flex-col gap-x-4 md:flex-row md:items-center'>
            <h1 className='text-3xl md:text-4xl'>Account</h1>
            <div className='-ml-0.5 flex items-center gap-x-1.5'>
                <img src="https://rb.gy/4vfk4r" alt="" className='h-7 w-7'/>
                <p className='text-xs font-semibold text=[#5555]'>Miembro desde el {userDB?.createdAt && new Date(userDB?.createdAt).getDate().toString()} de  {userDB?.createdAt && monthNames[new Date(userDB?.createdAt).getMonth()]} del {userDB?.createdAt && new Date(userDB?.createdAt).getFullYear().toString()} </p>

            </div>
        </div>

        <Membership user ={userDB}/>
        <div className="mt-6 grid grid-cols-1 gap-x-4 border px-4 py-4 md:grid-cols-4 md:border-x-0 md:border-t md:border-b-0 md:px-0 md:pb-0">
          <h4 className="text-lg text-[gray]">Plan Details</h4>
          {/* Find the current plan */}
          <div className="col-span-2 font-medium">
            {/* {
              products.filter(
                (product) => product.id === subscription?.product
              )[0]?.name
            } */}
            Basic
          </div>
          <p
            className="cursor-pointer text-blue-500 hover:underline md:text-right"
            // onClick={goToBillingPortal}
          >
            Change plan
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-4 border px-4 py-4 md:grid-cols-4 md:border-x-0 md:border-t md:border-b-0 md:px-0">
          <h4 className="text-lg text-[gray]">Settings</h4>
          <p
            className="col-span-3 cursor-pointer text-blue-500 hover:underline"
            onClick={() => logoutHandler()}
          >
            Sign out of all devices
          </p>
        </div>
      </main>
    </div>
  )
}

export default Account