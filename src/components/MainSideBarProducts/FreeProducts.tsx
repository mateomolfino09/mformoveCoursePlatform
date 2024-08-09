'use client'
import IndexHeader from '../IndexHeader'
import { useAuth } from '../../hooks/useAuth'
import { User } from '../../../typings';
import AdminDashboardSideBar from './../AdminDashboardSideBar';
import AdminDashboardTopBar from './../AdminDashboardTopBar';
import { Transition } from '@headlessui/react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { Fragment, useEffect, useState } from 'react';
import MainSideBarDash from './../MainSideBarDash';
import HeaderHome from '../HeaderHome';
import Footer from '../Footer';
import FreeProductMainSideBarDash from './FreeProductDash';
import FreeProductHeader from './FreeProductHeader';

interface Props {
  children: any;
}

const FreeProductsSideBar = ({ children }: Props) => {  
  const auth = useAuth()
  const [showNav, setShowNav] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cookies = parseCookies();
  const router = useRouter();
  const childRef = React.createRef();
  
  function handleResize() {
    if (innerWidth <= 640) {
      setShowNav(false);
      setIsMobile(true);
    } else {
      setShowNav(true);
      setIsMobile(false);
    }
  }

  const toggleNav = () => {
    setShowNav(!showNav)
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
    <div className='absolute w-full h-full '>

        <FreeProductHeader user={auth.user} toggleNav={toggleNav} />

        {showNav ? (
          <FreeProductMainSideBarDash showNav={showNav} />
        ) : (
          <>
          </>
        )}
          {children}
          {/* {where === "home" ? (
        
            <>
            </>
            ) : (
              <Footer/>


          )} */}

        
    </div>
  )
}

export default FreeProductsSideBar



interface Props {
  children: any;
}



