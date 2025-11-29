import {
  BookOpenIcon,
  BuildingStorefrontIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ShoppingBagIcon,
  QuestionMarkCircleIcon
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
      <div ref={ref} className='fixed w-56 h-full bg-black/80 backdrop-blur-md border-r border-white/10 shadow-2xl z-20 font-montserrat'>
        {/* Gradient accent line at top */}
        <div className='h-1 w-full bg-gradient-to-r from-[#234C8C] via-[#4F7CCF] to-[#A6C8F5]' />
        
        <div className='flex justify-center mt-8 mb-12'>
          <Link href={routes.navegation.membresiaHome}>
            <picture>
              <img
                alt='icon image'
                src='/images/MFORMOVE_blanco.png'
                className='cursor-pointer object-contain w-28 h-auto transition duration-500 hover:scale-105 opacity-90 hover:opacity-100'
              />
            </picture>
          </Link>
        </div>

        <div className='flex flex-col px-4'>
          <Link href={'/admin'}>
            <div
              className={`pl-4 py-3 mx-2 rounded-xl cursor-pointer mb-2 flex items-center transition-all duration-300 ${
                pathname == '/admin'
                  ? 'bg-white/10 text-white border-l-2 border-[#4F7CCF] shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <div className='mr-3 flex-shrink-0'>
                <HomeIcon className={`h-5 w-5 ${pathname == '/admin' ? 'text-[#4F7CCF]' : ''}`} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate font-medium'>Home</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/users'}>
            <div
              className={`pl-4 py-3 mx-2 rounded-xl cursor-pointer mb-2 flex items-center transition-all duration-300 ${
                pathname == '/admin/users'
                  ? 'bg-white/10 text-white border-l-2 border-[#4F7CCF] shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <div className='mr-3 flex-shrink-0'>
                <UserIcon className={`h-5 w-5 ${pathname == '/admin/users' ? 'text-[#4F7CCF]' : ''}`} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate font-medium'>Usuarios</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/memberships'}>
            <div
              className={`pl-4 py-3 mx-2 rounded-xl cursor-pointer mb-2 flex items-center transition-all duration-300 ${
                pathname == '/admin/memberships' ||
                pathname == '/admin/memberships/plans' ||
                pathname == '/admin/memberships/createPlan' ||
                pathname == '/admin/memberships/classes' ||
                pathname == '/admin/memberships/classes/createClass' ||
                pathname == '/admin/memberships/classes/allClasses' ||
                pathname == '/admin/memberships/classes/createClassType'
                  ? 'bg-white/10 text-white border-l-2 border-[#4F7CCF] shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <div className='mr-3 flex-shrink-0'>
                <BuildingStorefrontIcon className={`h-5 w-5 ${
                  pathname == '/admin/memberships' ||
                  pathname == '/admin/memberships/plans' ||
                  pathname == '/admin/memberships/createPlan' ||
                  pathname == '/admin/memberships/classes' ||
                  pathname == '/admin/memberships/classes/createClass' ||
                  pathname == '/admin/memberships/classes/allClasses' ||
                  pathname == '/admin/memberships/classes/createClassType'
                    ? 'text-[#4F7CCF]' : ''
                }`} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate font-medium'>Membresías</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/mentorship'}>
            <div
              className={`pl-4 py-3 mx-2 rounded-xl cursor-pointer mb-2 flex items-center transition-all duration-300 ${
                pathname == '/admin/mentorship' ||
                pathname == '/admin/mentorship/plans' ||
                pathname == '/admin/mentorship/createPlan' ||
                pathname == '/admin/mentorship/analytics' ||
                pathname == '/admin/mentorship/solicitudes'
                  ? 'bg-white/10 text-white border-l-2 border-[#4F7CCF] shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <div className='mr-3 flex-shrink-0'>
                <AcademicCapIcon className={`h-5 w-5 ${
                  pathname == '/admin/mentorship' ||
                  pathname == '/admin/mentorship/plans' ||
                  pathname == '/admin/mentorship/createPlan' ||
                  pathname == '/admin/mentorship/analytics' ||
                  pathname == '/admin/mentorship/solicitudes'
                    ? 'text-[#4F7CCF]' : ''
                }`} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate font-medium'>Mentoría</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/products'}>
            <div
              className={`pl-4 py-3 mx-2 rounded-xl cursor-pointer mb-2 flex items-center transition-all duration-300 ${
                pathname == '/admin/products' ||
                pathname == '/admin/products/createProduct' ||
                pathname == '/admin/products/allProducts' ||
                pathname == '/admin/products/createFilters'
                  ? 'bg-white/10 text-white border-l-2 border-[#4F7CCF] shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <div className='mr-3 flex-shrink-0'>
                <ShoppingBagIcon className={`h-5 w-5 ${
                  pathname == '/admin/products' ||
                  pathname == '/admin/products/createProduct' ||
                  pathname == '/admin/products/allProducts' ||
                  pathname == '/admin/products/createFilters'
                    ? 'text-[#4F7CCF]' : ''
                }`} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate font-medium'>Productos</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/faq'}>
            <div
              className={`pl-4 py-3 mx-2 rounded-xl cursor-pointer mb-2 flex items-center transition-all duration-300 ${
                pathname == '/admin/faq'
                  ? 'bg-white/10 text-white border-l-2 border-[#4F7CCF] shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <div className='mr-3 flex-shrink-0'>
                <QuestionMarkCircleIcon className={`h-5 w-5 ${pathname == '/admin/faq' ? 'text-[#4F7CCF]' : ''}`} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate font-medium'>Preguntas Frecuentes</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/in-person-classes'}>
            <div
              className={`pl-4 py-3 mx-2 rounded-xl cursor-pointer mb-2 flex items-center transition-all duration-300 ${
                pathname == '/admin/in-person-classes' ||
                pathname == '/admin/in-person-classes/create' ||
                pathname == '/admin/in-person-classes/all' ||
                pathname?.startsWith('/admin/in-person-classes/edit')
                  ? 'bg-white/10 text-white border-l-2 border-[#4F7CCF] shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <div className='mr-3 flex-shrink-0'>
                <CalendarDaysIcon className={`h-5 w-5 ${
                  pathname == '/admin/in-person-classes' ||
                  pathname == '/admin/in-person-classes/create' ||
                  pathname == '/admin/in-person-classes/all' ||
                  pathname?.startsWith('/admin/in-person-classes/edit')
                    ? 'text-[#4F7CCF]' : ''
                }`} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate font-medium'>Horarios</p>
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
