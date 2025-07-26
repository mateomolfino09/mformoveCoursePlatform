'use client'
import IndexHeader from '../IndexHeader'
import { useAuth } from '../../hooks/useAuth'
import { User } from '../../../typings';
import AdminDashboardSideBar from '../AdminDashboardSideBar';
import AdminDashboardTopBar from '../AdminDashboardTopBar';
import { Transition } from '@headlessui/react';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import React, { Fragment, useEffect, useState } from 'react';
import MainSideBarDash from './MainSideBarDash';
import HeaderHome from '../HeaderHome';
import ProductHeader from '../PageComponent/Products/HeaderProduct';
import { useSnapshot } from 'valtio';
import state from '../../valtio';
import LoginModal from '../PageComponent/Login/LoginModal';
import { routes } from '../../constants/routes';
import UserHeader from '../UserHeader';
import MembershipHeader from '../MembershipHeader';

interface Props {
  children: any;
  where: any
}

const MainSideBar = ({ children, where }: Props) => {  
  const auth = useAuth()
  const [showNav, setShowNav] = useState(false);
  const path = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const cookies = parseCookies();
  const router = useRouter();
  const childRef = React.createRef();
  const snap = useSnapshot(state);

  const toggleNav = () => {
    setShowNav(!showNav)
  }

  return (
    <div className={`absolute w-full h-full`}>
      {(path == routes.navegation.membresiaHome || where === "productsHome") && (
        <HeaderHome user={auth.user} toggleNav={toggleNav} />
      )}
      {(path == routes.navegation.index  || path == routes.navegation.eventos || path.includes(routes.navegation.eventos) || path == routes.user.login || path == routes.user.forgetEmail || path == routes.user.forget || path == routes.user.register || path.includes(routes.navegation.payments)) && ( 
      <IndexHeader user={auth.user} toggleNav={toggleNav} where={where} showNav={showNav} />
      )}
      {(path == '/faq' || path == '/about' || path == '/privacy') && ( 
      <MembershipHeader user={auth.user} toggleNav={toggleNav} where={where} showNav={showNav} />
      )}
      {(path == routes.navegation.selectPlan || path == routes.navegation.mentorship) && ( 
      <MembershipHeader user={auth.user} toggleNav={toggleNav} where={where} showNav={showNav} />
      )}
      {(path == routes.user.perfil) && ( 
      <UserHeader user={auth.user} toggleNav={toggleNav} where={where} showNav={showNav} />
      )}
      {path === routes.navegation.products && ( 
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


