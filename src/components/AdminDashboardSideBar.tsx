import {
  BookOpenIcon,
  BuildingStorefrontIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import {
  CreditCardIcon,
  HomeIcon,
  PlusCircleIcon,
  TableCellsIcon,
  UserIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { forwardRef } from 'react';
import { routes } from '../constants/routes';

const AdminDashboardSideBar = forwardRef<HTMLInputElement>(
  ({ showNav }: any, ref) => {
    const router = useRouter();
    const pathname = usePathname();

    return (
      <div ref={ref} className='fixed w-56 h-full bg-gray-100 shadow-sm z-20'>
        <div className='flex justify-center mt-6 mb-14'>
          <Link href={routes.navegation.membresiaHome}>
            <picture>
              <img
                alt='icon image'
                src='/images/mformove_dark.png'
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
          <Link href={'/admin/classes'}>
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                pathname == '/admin/classes' ||
                pathname == '/admin/classes/createClass' ||
                pathname == '/admin/classes/allClasses' ||
                pathname == '/admin/classes/createClassType'
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
          <Link href={'/admin/memberships'}>
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                pathname == '/admin/memberships' ||
                pathname == '/admin/memberships/plans' ||
                pathname == '/admin/memberships/createPlans'
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
          <Link href={'/admin/mentorship'}>
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                pathname == '/admin/mentorship' ||
                pathname == '/admin/mentorship/plans' ||
                pathname == '/admin/mentorship/createPlan' ||
                pathname == '/admin/mentorship/analytics' ||
                pathname == '/admin/mentorship/solicitudes'
                  ? 'bg-orange-100 text-orange-500'
                  : 'text-gray-400 hover:bg-orange-100 hover:text-orange-500'
              }`}
            >
              <div className='mr-2'>
                <AcademicCapIcon className='h-5 w-5' />
              </div>
              <div>
                <p>Mentoría</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/products'}>
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                pathname == '/admin/products' ||
                pathname == '/admin/products/createProduct' ||
                pathname == '/admin/products/allProducts' ||
                pathname == '/admin/products/createFilters'
                  ? 'bg-orange-100 text-orange-500'
                  : 'text-gray-400 hover:bg-orange-100 hover:text-orange-500'
              }`}
            >
              <div className='mr-2'>
                <BuildingStorefrontIcon className='h-5 w-5' />
              </div>
              <div>
                <p>Productos</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/faq'}>
            <div
              className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${
                pathname == '/admin/faq'
                  ? 'bg-orange-100 text-orange-500'
                  : 'text-gray-400 hover:bg-orange-100 hover:text-orange-500'
              }`}
            >
              <div className='mr-2'>
                <BuildingStorefrontIcon className='h-5 w-5' />
              </div>
              <div>
                <p>FAQs</p>
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
