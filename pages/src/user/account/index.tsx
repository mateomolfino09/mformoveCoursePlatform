import Membership from '../../../../components/Membership'
import { useAppDispatch } from '../../../../hooks/useTypeSelector'
import { State } from '../../../../redux/reducers'
import { loadUser } from '../../../../redux/user/userAction'
import { CourseUser, CoursesDB, User } from '../../../../typings'
import { VideoCameraIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import cookie from 'js-cookie'
import { signOut, useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { parseCookies } from 'nookies'
import React, { useEffect, useState } from 'react'
import { AiOutlineUser } from 'react-icons/ai'
import { FaHistory } from 'react-icons/fa'
import { useSelector } from 'react-redux'

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Setiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

function Account() {
  const dispatch = useAppDispatch()
  const profile = useSelector((state: State) => state.profile)
  const [userDB, setUserDB] = useState<User | null>(null)
  const { dbUser } = profile
  const cookies = parseCookies()
  const { data: session } = useSession()
  const router = useRouter()
  const [userState, setUserState] = useState<any>(null)

  const user: User = dbUser
    ? dbUser
    : cookies?.user
    ? JSON.parse(cookies.user)
    : session?.user
    ? session?.user
    : ''

  useEffect(() => {
    session ? setUserState(session.user) : setUserState(user)

    const getUserDB = async () => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        }
        const email = user.email
        const { data } = await axios.post(
          '/api/user/getUser',
          { email },
          config
        )
        !userDB ? setUserDB(data) : null
        //eslint-disable-next-line react-hooks/exhaustive-deps
      } catch (error: any) {
        console.log(error.message)
      }
    }

    getUserDB()
  }, [router, session])

  const logoutHandler = async () => {
    if (session) signOut()
    cookie.remove('token')
    cookie.remove('user')

    router.push('/src/user/login')
  }

  const cantCourses = userDB?.courses.filter(
    (c: CourseUser) => c.purchased
  ).length

  return (
    <div>
      <Head>
        <title>Video Streaming</title>
        <meta name='description' content='Stream Video App' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <header className={`bg-[#141414]`}>
        <Link href='/src/home'>
          <img
            src='/images/logoWhite.png'
            width={120}
            height={120}
            className='cursor-pointer object-contain transition duration-500 hover:scale-105 opacity-80 hover:opacity-100'
          />
        </Link>
        <Link href='/src/user/account'>
          <AiOutlineUser className='h-6 w-6 cursor-pointer' />
        </Link>
      </header>

      <main className='mx-auto max-w-6xl pt-24 px-5 pb-12 transition-all md:px-10 '>
        <div className='flex flex-col gap-x-4 md:flex-row md:items-center'>
          <h1 className='text-3xl md:text-4xl'>Cuenta</h1>
          <div className='flex items-center gap-x-1.5'>
            <FaHistory className='h-4 w-4 ' />
            <p className='text-xs font-semibold text=[#5555]'>
              Miembro desde el{' '}
              {userDB?.createdAt &&
                new Date(userDB?.createdAt).getDate().toString()}{' '}
              de{' '}
              {userDB?.createdAt &&
                monthNames[new Date(userDB?.createdAt).getMonth()]}{' '}
              del{' '}
              {userDB?.createdAt &&
                new Date(userDB?.createdAt).getFullYear().toString()}{' '}
            </p>
          </div>
        </div>

        <Membership user={userDB} />
        <div className='mt-6 grid grid-cols-1 gap-x-4 border px-4 py-4 md:grid-cols-4 md:border-x-0 md:border-t md:border-b-0 md:px-0 md:pb-0'>
          <h4 className='text-lg text-[gray]'>Detalles del Plan</h4>
          {/* Find the current plan */}
          <div className='col-span-2 font-medium'>
            {/* {
              products.filter(
                (product) => product.id === subscription?.product
              )[0]?.name
            } */}
            Cuentas con una cantidad de {cantCourses} cursos
          </div>
          <Link href={'/src/user/account/myCourses'}>
            <p
              className='cursor-pointer text-blue-500 hover:underline md:text-right'
              // onClick={goToBillingPortal}
            >
              Detalles de Cursos
            </p>
          </Link>
        </div>

        <div className='mt-6 grid grid-cols-1 gap-x-4 border px-4 py-4 md:grid-cols-4 md:border-x-0 md:border-t md:border-b-0 md:px-0'>
          <h4 className='text-lg text-[gray]'>Ajustes</h4>
          <p
            className='col-span-3 cursor-pointer text-blue-500 hover:underline'
            onClick={() => logoutHandler()}
          >
            Salir de todos los dispositivos
          </p>
        </div>
      </main>
    </div>
  )
}

export default Account
