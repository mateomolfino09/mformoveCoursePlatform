'use client'
import IndexHeader from '../IndexHeader'
import { useAuth } from '../../hooks/useAuth'
import { User } from '../../../typings';
import AdminDashboardSideBar from '../AdminDashboardSideBar';
import AdminDashboardTopBar from '../AdminDashboardTopBar';
import { Transition } from '@headlessui/react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { Fragment, useEffect, useState } from 'react';
import MainSideBarDash from './MainSideBarDash';
import HeaderHome from '../HeaderHome';
import Footer from '../Footer';
import ProductHeader from '../PageComponent/Products/HeaderProduct';
import LoginForm from '../PageComponent/Login/LoginForm';
import { useSnapshot } from 'valtio';
import state from '../../valtio';
import LoginModal from '../PageComponent/Login/LoginModal';

interface Props {
  children: any;
  where: any
}

const MainSideBar = ({ children, where }: Props) => {  
  const auth = useAuth()
  const [showNav, setShowNav] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cookies = parseCookies();
  const router = useRouter();
  const childRef = React.createRef();
  const snap = useSnapshot(state);

  const toggleNav = () => {
    setShowNav(!showNav)
  }

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     addEventListener('resize', handleResize);
  //   }

  //   return () => {
  //     removeEventListener('resize', handleResize);
  //   };
  // }, []);
  return (
    <div className='absolute w-full h-full '>
      {where === "home" || where === "productsHome" && (
        <HeaderHome user={auth.user} toggleNav={toggleNav} />
      )}
      {where === "index" && ( 
      <IndexHeader user={auth.user} toggleNav={toggleNav} where={where} />
      )}
      {where === "product" && ( 
      <ProductHeader user={auth.user} toggleNav={toggleNav} />
      )}
      {showNav ? (
        <MainSideBarDash showNav={showNav} where={where} toggleNav={toggleNav}/>
      ) : (
        <>
        </>
      )}
      {snap.loginForm ? (
        <LoginModal />
      ) : (
        <>
        </>
      )}
        {children}
        
    </div>
  )
}

export default MainSideBar



interface Props {
  children: any;
}


