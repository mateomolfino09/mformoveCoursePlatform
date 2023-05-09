import AdmimDashboardLayout from '../../../components/AdmimDashboardLayout'
import DeleteUser from '../../../components/DeleteUser'
import { UserContext } from '../../../hooks/userContext'
import { Bill, CoursesDB, User } from '../../../typings'
import { getAllBills } from '../../api/admin/getAllBills'
import { getCourses } from '../../api/course/getCourses'
import { getUserFromBack } from '../../api/user/getUserFromBack'
import { loadUser } from '../../api/user/loadUser'
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

interface Props {
  bills: Bill[]
  user: User
}
const ShowUsers = ({ bills, user }: Props) => {
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

  useEffect(() => {
    if (user === null || user.rol != 'Admin') {
      router.push('/src/user/login')
    }
  }, [session, router])

  function openModal() {
    setIsOpen(true)
  }

  return (
    <UserContext.Provider value={providerValue}>
      <AdmimDashboardLayout>
        <>
          <Head>
            <title>Video Streaming</title>
            <meta name='description' content='Stream Video App' />
            <link rel='icon' href='/favicon.ico' />
          </Head>

          <div className='w-full px-4 py-4 lg:px-10 lg:py-6 min-h-screen'>
            <h1 className='text-2xl mb-8'>Facturación</h1>
            <table className='min-w-full text-sm  '>
              <thead>
                <tr>
                  <th className='border  text-xl '>Curso</th>
                  <th className='border  text-xl '>Usuario</th>
                  <th className='border  text-xl'>Precio</th>
                  <th className='border  text-xl'>Status</th>
                  <th className='border  text-xl'>Id Pago</th>
                  <th className='border  text-xl'>Tipo de Pago</th>
                  <th className='border  text-xl'>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {bills?.map((bill: Bill) => (
                  <tr key={user._id} ref={ref}>
                    <th className='border-solid border-transparent border border-collapse  bg-gray-900/70 text-base opacity-75'>
                      {bill.course.name}
                    </th>
                    <th className='border-solid border-transparent border border-collapse  bg-gray-900/70 text-base opacity-75'>
                      {bill.user.name}
                    </th>
                    <th className='border-solid border-transparent border border-collapse text-base bg-gray-900/70 opacity-75'>
                      {bill.course.currency} {bill.course.price}
                    </th>
                    <th className='border-solid border-transparent border border-collapse text-base bg-gray-900/70 opacity-75'>
                      {bill.status}
                    </th>
                    <th className='border-solid border-transparent border border-collapse text-base bg-gray-900/70 opacity-75'>
                      {bill.payment_id.toString()}
                    </th>
                    <th className='border-solid border-transparent border border-collapse text-base bg-gray-900/70 opacity-75'>
                      {bill.payment_type.toString()}
                    </th>
                    <th className='border-solid border-transparent border border-collapse text-base bg-gray-900/70 opacity-75'>
                      {new Date(bill.createdAt).toLocaleDateString('es-ES')}
                    </th>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      </AdmimDashboardLayout>
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
  const bills: any = await getAllBills()
  return { props: { bills, user } }
}

export default ShowUsers
