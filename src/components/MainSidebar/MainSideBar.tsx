'use client'
import { useAuth } from '../../hooks/useAuth'
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import MainSideBarDash from './MainSideBarDash';
import { useSnapshot } from 'valtio';
import state from '../../valtio';
import LoginModal from '../PageComponent/Login/LoginModal';
import { routes } from '../../constants/routes';
import HeaderUnified from '../HeaderUnified';

interface Props {
  children: any;
  where: any;
  forceStandardHeader?: boolean;
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
  forceLightTheme?: boolean;
}

const MainSideBar = ({ children, where, forceStandardHeader = false, onMenuClick, sidebarOpen, forceLightTheme = false }: Props) => {  
  const auth = useAuth()
  const [showNav, setShowNav] = useState(false);
  const path = usePathname();
  const snap = useSnapshot(state);

  const toggleNav = () => {
    setShowNav(!showNav)
  }

  return (
    <div className={`absolute w-full h-full`}>
      <HeaderUnified
        user={auth.user}
        toggleNav={toggleNav}
        where={where}
        showNav={showNav}
        forceStandardHeader={forceStandardHeader}
        onMenuClick={onMenuClick}
        sidebarOpen={sidebarOpen}
        forceLightTheme={forceLightTheme}
      />
      {showNav ? (
        <MainSideBarDash showNav={showNav} where={where} toggleNav={toggleNav}/>
      ) : null}
      {snap.loginForm ? <LoginModal /> : null}
        {children}
        
    </div>
  )
}

export default MainSideBar