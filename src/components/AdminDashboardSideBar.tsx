import { BookOpenIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import {
  CreditCardIcon,
  HomeIcon,
  PlusCircleIcon,
  TableCellsIcon,
  UserIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { forwardRef } from 'react';

const AdminDashboardSideBar = forwardRef<HTMLInputElement>(
  ({ showNav }: any, ref) => {
    const router = useRouter();
    const pathname = usePathname();

    return (
      <div ref={ref} className='fixed w-56 h-full bg-gray-100 shadow-sm z-20'>
        <div className='flex justify-center mt-6 mb-14'>
          <Link href={'/home'}>
            <picture>
              <img
                alt='icon image'
                src='/images/logo.png'
                className='cursor-pointer object-contain w-32 h-auto transition duration-500 hover:scale-105'
              />
            </picture>
          </Link>
        </div>

        <div className='flex flex-col'>
          <Link href={'/admin'}>
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                pathname == '/admin'
                  ? 'bg-orange-100 text-orange-500'
                  : 'text-gray-400 hover:bg-orange-100 hover:text-orange-500'
              }`}
            >
              <div className='mr-2'>
                <HomeIcon className='h-5 w-5' />
              </div>
              <div>
                <p>Home</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/users'}>
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                pathname == '/admin/users'
                  ? 'bg-orange-100 text-orange-500'
                  : 'text-gray-400 hover:bg-orange-100 hover:text-orange-500'
              }`}
            >
              <div className='mr-2'>
                <UserIcon className='h-5 w-5' />
              </div>
              <div>
                <p>Usuarios</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/courses'}>
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                pathname == '/admin/courses' || pathname == '/admin/courses/createCourse' || pathname == '/admin/courses/allCourses'
                  ? 'bg-orange-100 text-orange-500'
                  : 'text-gray-400 hover:bg-orange-100 hover:text-orange-500'
              }`}
            >
              <div className='mr-2'>
                <TableCellsIcon className='h-5 w-5' />
              </div>
              <div>
                <p>Cursos</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/classes'}>
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                pathname == '/admin/classes' || pathname == '/admin/classes/createClass' || pathname == '/admin/classes/allClasses' || pathname == '/admin/classes/createClassType'
                  ? 'bg-orange-100 text-orange-500'
                  : 'text-gray-400 hover:bg-orange-100 hover:text-orange-500'
              }`}
            >
              <div className='mr-2'>
                <BookOpenIcon className='h-5 w-5' />
              </div>
              <div>
                <p>Clases</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/billing'}>
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                pathname == '/admin/billing'
                  ? 'bg-orange-100 text-orange-500'
                  : 'text-gray-400 hover:bg-orange-100 hover:text-orange-500'
              }`}
            >
              <div className='mr-2'>
                <CreditCardIcon className='h-5 w-5' />
              </div>
              <div>
                <p>Facturación</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/emailmarketing'}>
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                pathname == '/admin/emailmarketing'
                  ? 'bg-orange-100 text-orange-500'
                  : 'text-gray-400 hover:bg-orange-100 hover:text-orange-500'
              }`}
            >
              <div className='mr-2'>
                <HomeIcon className='h-5 w-5' />
              </div>
              <div>
                <p>Email Marketing</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/memberships'}>
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                pathname == '/admin/memberships' || pathname == '/admin/memberships/plans' || pathname == '/admin/memberships/createPlans'
                  ? 'bg-orange-100 text-orange-500'
                  : 'text-gray-400 hover:bg-orange-100 hover:text-orange-500'
              }`}
            >
              <div className='mr-2'>
                <BuildingStorefrontIcon className='h-5 w-5' />
              </div>
              <div>
                <p>Memberships</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  }
);

AdminDashboardSideBar.displayName = 'AdminDashboardSideBar';

export default AdminDashboardSideBar;
