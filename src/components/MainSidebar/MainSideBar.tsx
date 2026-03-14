'use client'
import { useAuth } from '../../hooks/useAuth'
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import MainSideBarDash from './MainSideBarDash';
import { useSnapshot } from 'valtio';
import state from '../../valtio';
import LoginModal from '../PageComponent/Login/LoginModal';
import { routes } from '../../constants/routes';
import HeaderUnified from '../HeaderUnified';
import { MoveCrewNavProvider } from './MoveCrewNavContext';

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

  const hasAccess = auth.user && (auth.user.subscription?.active || auth.user.isVip || auth.user.rol === 'Admin');
  const isAnyMenuOpen = showNav || snap.weeklyPathNavOpen;

  useEffect(() => {
    state.systemNavOpen = showNav;
    return () => {
      state.systemNavOpen = false;
    };
  }, [showNav]);

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
      {where === 'move-crew' ? (
        <MoveCrewNavProvider value={{ toggleNav, showNav }}>
          {children}
        </MoveCrewNavProvider>
      ) : (
        children
      )}
    </div>
  )
}

export default MainSideBar