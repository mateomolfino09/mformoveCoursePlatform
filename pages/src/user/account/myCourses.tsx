import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout'
import DeleteUser from '../../../../components/DeleteUser'
import { UserContext } from '../../../../hooks/userContext'
import { Bill, ClassesDB, CoursesDB, User } from '../../../../typings'
import { getUserCourses } from '../../../api/user/course/getUserCourses'
import { getUserFromBack } from '../../../api/user/getUserFromBack'
import { loadUser } from '../../../api/user/loadUser'
import {
  PencilIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/solid'
import { getSession, useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { parseCookies } from 'nookies'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AiOutlineUser } from 'react-icons/ai'

interface Props {
  courses: CoursesDB[]
  user: User
}
const MyCourses = ({ courses, user }: Props) => {
  const cookies = parseCookies()
  const { data: session } = useSession()
  const router = useRouter()
  let [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)
  const [userCtx, setUserCtx] = useState<User>(user)

  const providerValue = useMemo(
    () => ({ userCtx, setUserCtx }),
    [userCtx, setUserCtx]
  )

  console.log(
    courses[0].classes
      .map((c: ClassesDB) => c.totalTime)
      .reduce((prev, next) => prev + next)
  )

  useEffect(() => {
    if (user === null) {
      router.push('/src/user/login')
    }
  }, [session, router])

  function openModal() {
    setIsOpen(true)
  }

  return (
    <UserContext.Provider value={providerValue}>
      <>
        <Head>
          <title>Mis Cursos</title>
          <meta name='description' content='Cursos del Usuario' />
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
        <div className='w-full px-4 py-4 lg:px-10 lg:py-6 min-h-screen mt-24'>
          <h1 className='text-2xl mb-8'>Detalles Cursos</h1>
          <table className='min-w-full text-sm  '>
            <thead>
              <tr>
                <th className='border rounded-md text-xl px-1'>Nombre</th>
                <th className='border  text-xl px-1'>Cantidad de Clases</th>
                <th className='border  text-xl px-1'>Duración</th>
                <th className='border  text-xl px-1'>Precio</th>
                <th className='border rounded-md  text-xl px-1'>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course: CoursesDB) => (
                <tr key={course ? +course._id : 0} ref={ref}>
                  <th className='border-solid border border-collapse  bg-gray-900/70 text-base opacity-75'>
                    {course.name}
                  </th>
                  <th className='border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1'>
                    {course.classes.length}
                  </th>
                  <th className='border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1'>
                    {Math.floor(
                      course.classes
                        .map((c) => c.totalTime)
                        .reduce((prev, current) => prev + current) /
                        60 /
                        60
                    )}{' '}
                    hrs{' '}
                    {Math.floor(
                      (course.classes
                        .map((c) => c.totalTime)
                        .reduce((prev, current) => prev + current) /
                        60) %
                        60
                    )}{' '}
                    min{' '}
                    {Math.round(
                      course.classes
                        .map((c) => c.totalTime)
                        .reduce((prev, current) => prev + current) % 60
                    )}{' '}
                    seg
                  </th>
                  <th className='border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1'>
                    {course.currency} {course.price}
                  </th>
                  <th className='border-solid border border-collapse text-base bg-gray-900/70 opacity-75 px-1'>
                    {new Date(course.createdAt).toLocaleDateString('es-ES')}
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    </UserContext.Provider>
  )
}
export async function getServerSideProps(context: any) {
  const { params, query, req, res } = context
  const session = await getSession({ req })
  const cookies = parseCookies(context)
  const userCookie = cookies?.user ? JSON.parse(cookies.user) : session?.user
  const email = userCookie.email
  const user = await getUserFromBack(email)
  const userId = user._id
  const courses: any = await getUserCourses(userId)

  return { props: { courses, user } }
}

export default MyCourses
