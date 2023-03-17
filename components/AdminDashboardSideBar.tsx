import React, { forwardRef  } from 'react'
import Link from 'next/link'
import { HomeIcon, CreditCardIcon, UserIcon, PlusCircleIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/router'

const AdminDashboardSideBar = forwardRef<HTMLInputElement>(({ showNav }: any, ref) => {
  const router = useRouter()

  return (
    <div ref={ref} className='fixed w-56 h-full bg-gray-100 shadow-sm'>
      <div className='flex justify-center mt-6 mb-14'>
        <Link href={'/src/home'}>
          <picture>
            <img
              alt='icon image'
              src="/images/logo.png"
              className="cursor-pointer object-contain w-32 h-auto transition duration-500 hover:scale-105"
            />
          </picture>
        </Link>

      </div>

      <div className='flex flex-col'>
        <Link href={'/src/admin'}>
            <div className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
              router.pathname == "/src/admin" ? 'bg-orange-100 text-orange-500' : 'text-gray-400 hover:bg-orange-100 hover:text-orange-500'
            }`}>
                <div className="mr-2">
                  <HomeIcon className='h-5 w-5' />
                </div>
                <div>
                  <p>Home</p>
                </div>
            </div>
        </Link>
        <Link href={'/src/admin/createCourse'}>
            <div className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
              router.pathname == "/src/admin/createCourse" ? 'bg-orange-100 text-orange-500' : 'text-gray-400 hover:bg-orange-100 hover:text-orange-500'
            }`}>
                <div className="mr-2">
                  <PlusCircleIcon className='h-5 w-5' />
                </div>
                <div>
                  <p>Crear Curso</p>
                </div>
            </div>
        </Link>
        <Link href={'/src/admin/users'}>
            <div className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
              router.pathname == "/src/admin/users" ? 'bg-orange-100 text-orange-500' : 'text-gray-400 hover:bg-orange-100 hover:text-orange-500'
            }`}>
                <div className="mr-2">
                  <UserIcon className='h-5 w-5' />
                </div>
                <div>
                  <p>Usuarios</p>
                </div>
            </div>
        </Link>
        <Link href={'/src/admin/billing'}>
            <div className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
              router.pathname == "/src/admin/billing" ? 'bg-orange-100 text-orange-500' : 'text-gray-400 hover:bg-orange-100 hover:text-orange-500'
            }`}>
                <div className="mr-2">
                  <CreditCardIcon className='h-5 w-5' />
                </div>
                <div>
                  <p>Facturación</p>
                </div>
            </div>
        </Link>
      </div>
    </div>
  )
})

AdminDashboardSideBar.displayName = 'AdminDashboardSideBar'

export default AdminDashboardSideBar