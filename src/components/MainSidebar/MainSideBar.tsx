'use client'
import { useAuth } from '../../hooks/useAuth'
import React, { useEffect, useState } from 'react';
import MainSideBarDash from './MainSideBarDash';
import { useSnapshot } from 'valtio';
import state from '../../valtio';
import LoginModal from '../PageComponent/Login/LoginModal';
import HeaderUnified from '../HeaderUnified';
import { MembershipNavProvider } from './MembershipNavContext';

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
  const snap = useSnapshot(state);

  const toggleNav = () => {
    setShowNav(!showNav)
  }

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
      {where === 'membership' ? (
        <MembershipNavProvider value={{ toggleNav, showNav }}>
          {children}
        </MembershipNavProvider>
      ) : (
        children
      )}
    </div>
  )
}

export default MainSideBar