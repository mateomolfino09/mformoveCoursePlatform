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
          <Link href={routes.navegation.membership.library} className='cursor-pointer transition duration-500 hover:scale-105 opacity-90 hover:opacity-100 text-center'>
            <span className='text-xl font-bold tracking-[0.2em] text-white font-montserrat uppercase'>MMOVE DASHBOARD</span>
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
                <p className='truncate font-medium'>Library</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/usuarios'}>
            <div
              className={`pl-4 py-3 mx-2 rounded-xl cursor-pointer mb-2 flex items-center transition-all duration-300 ${
                pathname == '/admin/usuarios'
                  ? 'bg-white/10 text-white border-l-2 border-[#4F7CCF] shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <div className='mr-3 flex-shrink-0'>
                <UserIcon className={`h-5 w-5 ${pathname == '/admin/usuarios' ? 'text-[#4F7CCF]' : ''}`} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate font-medium'>Usuarios</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/membresias'}>
            <div
              className={`pl-4 py-3 mx-2 rounded-xl cursor-pointer mb-2 flex items-center transition-all duration-300 ${
                pathname == '/admin/membresias' ||
                pathname == '/admin/membresias/planes' ||
                pathname == '/admin/membresias/crear-plan' ||
                pathname == '/admin/membresias/clases' ||
                pathname == '/admin/membresias/clases/crear-clase' ||
                pathname == '/admin/membresias/clases/todas-las-clases' ||
                pathname == '/admin/membresias/clases/crear-tipo-clase' ||
                pathname == '/admin/membresias/modulos-clase' ||
                pathname?.startsWith('/admin/membresias/modulos-clase/') ||
                pathname == '/admin/membresias/submodulos' ||
                pathname?.startsWith('/admin/membresias/submodulos/') ||
                pathname == '/admin/membresias/bitacora' ||
                pathname?.startsWith('/admin/membresias/bitacora/')
                  ? 'bg-white/10 text-white border-l-2 border-[#4F7CCF] shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <div className='mr-3 flex-shrink-0'>
                <BuildingStorefrontIcon className={`h-5 w-5 ${
                  pathname == '/admin/membresias' ||
                  pathname == '/admin/membresias/planes' ||
                  pathname == '/admin/membresias/crear-plan' ||
                  pathname == '/admin/membresias/clases' ||
                    pathname == '/admin/membresias/clases/crear-clase' ||
                  pathname == '/admin/membresias/clases/todas-las-clases' ||
                  pathname == '/admin/membresias/clases/crear-tipo-clase' ||
                  pathname == '/admin/membresias/modulos-clase' ||
                  pathname?.startsWith('/admin/membresias/modulos-clase/') ||
                  pathname == '/admin/membresias/submodulos' ||
                  pathname?.startsWith('/admin/membresias/submodulos/') ||
                  pathname == '/admin/membresias/bitacora' ||
                  pathname?.startsWith('/admin/membresias/bitacora/')
                    ? 'text-[#4F7CCF]' : ''
                }`} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate font-medium'>Membresías</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/mentorias'}>
            <div
              className={`pl-4 py-3 mx-2 rounded-xl cursor-pointer mb-2 flex items-center transition-all duration-300 ${
                pathname == '/admin/mentorias' ||
                pathname == '/admin/mentorias/planes' ||
                pathname == '/admin/mentorias/crear-plan' ||
                pathname == '/admin/mentorias/analitica' ||
                pathname == '/admin/mentorias/solicitudes'
                  ? 'bg-white/10 text-white border-l-2 border-[#4F7CCF] shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <div className='mr-3 flex-shrink-0'>
                <AcademicCapIcon className={`h-5 w-5 ${
                  pathname == '/admin/mentorias' ||
                  pathname == '/admin/mentorias/planes' ||
                  pathname == '/admin/mentorias/crear-plan' ||
                  pathname == '/admin/mentorias/analitica' ||
                  pathname == '/admin/mentorias/solicitudes'
                    ? 'text-[#4F7CCF]' : ''
                }`} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate font-medium'>Mentoría</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/productos'}>
            <div
              className={`pl-4 py-3 mx-2 rounded-xl cursor-pointer mb-2 flex items-center transition-all duration-300 ${
                pathname == '/admin/productos' ||
                pathname == '/admin/productos/crear-producto' ||
                pathname == '/admin/productos/todos-productos' ||
                pathname == '/admin/productos/crear-filtros'
                  ? 'bg-white/10 text-white border-l-2 border-[#4F7CCF] shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <div className='mr-3 flex-shrink-0'>
                <ShoppingBagIcon className={`h-5 w-5 ${
                  pathname == '/admin/productos' ||
                  pathname == '/admin/productos/crear-producto' ||
                  pathname == '/admin/productos/todos-productos' ||
                  pathname == '/admin/productos/crear-filtros'
                    ? 'text-[#4F7CCF]' : ''
                }`} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate font-medium'>Productos</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/preguntas-frecuentes'}>
            <div
              className={`pl-4 py-3 mx-2 rounded-xl cursor-pointer mb-2 flex items-center transition-all duration-300 ${
                pathname == '/admin/preguntas-frecuentes'
                  ? 'bg-white/10 text-white border-l-2 border-[#4F7CCF] shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <div className='mr-3 flex-shrink-0'>
                <QuestionMarkCircleIcon className={`h-5 w-5 ${pathname == '/admin/preguntas-frecuentes' ? 'text-[#4F7CCF]' : ''}`} />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='truncate font-medium'>Preguntas Frecuentes</p>
              </div>
            </div>
          </Link>
          <Link href={'/admin/clases-presenciales'}>
            <div
              className={`pl-4 py-3 mx-2 rounded-xl cursor-pointer mb-2 flex items-center transition-all duration-300 ${
                pathname == '/admin/clases-presenciales' ||
                pathname == '/admin/clases-presenciales/crear' ||
                pathname == '/admin/clases-presenciales/todas' ||
                pathname?.startsWith('/admin/clases-presenciales/editar')
                  ? 'bg-white/10 text-white border-l-2 border-[#4F7CCF] shadow-lg'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <div className='mr-3 flex-shrink-0'>
                <CalendarDaysIcon className={`h-5 w-5 ${
                  pathname == '/admin/clases-presenciales' ||
                  pathname == '/admin/clases-presenciales/crear' ||
                  pathname == '/admin/clases-presenciales/todas' ||
                  pathname?.startsWith('/admin/clases-presenciales/editar')
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
