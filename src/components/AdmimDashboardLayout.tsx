import { User } from '../../typings';
import AdminDashboardSideBar from './AdminDashboardSideBar';
import AdminDashboardTopBar from './AdminDashboardTopBar';
import { Transition } from '@headlessui/react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { Fragment, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Props {
  children: any;
}

const AdmimDashboardLayout = ({ children }: Props) => {
  const [showNav, setShowNav] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const cookies = parseCookies();
  const router = useRouter();
  const auth = useAuth()

  function handleResize() {
    if (innerWidth <= 640) {
      setShowNav(false);
      setIsMobile(true);
    } else {
      setShowNav(true);
      setIsMobile(false);
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      addEventListener('resize', handleResize);
    }

    return () => {
      removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className=''>
      <AdminDashboardTopBar
        showNav={showNav}
        setShowNav={setShowNav}
        dbUser={auth.user}
      />
      <Transition
        as={Fragment}
        show={showNav}
        enter='transform transition duration-[400ms]'
        enterFrom='-translate-x-full'
        enterTo='translate-x-0'
        leave='transform duration-[400ms] transition ease-in-out'
        leaveFrom='translate-x-0'
        leaveTo='-translate-x-full'
      >
        <AdminDashboardSideBar />
      </Transition>
      <main
        className={`bg-gray-700 min-h-screen rounded-sm h-full pt-16 transition-all duration-[400ms] ${
          showNav && !isMobile ? 'pl-56' : ''
        }`}
      >
        <div className='flex flex-col justify-center items-center px-4 md:px-16 rounded-sm h-full w-full overflow-hidden pb-4'>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdmimDashboardLayout;
