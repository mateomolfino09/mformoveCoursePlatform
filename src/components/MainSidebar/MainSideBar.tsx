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
import { IoCloseOutline } from 'react-icons/io5';

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
      {/* Barra móvil: un solo botón Menú (abre navegador Move Crew) */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[210] flex items-center justify-end md:hidden px-4 py-3 gap-2"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
      >
        {hasAccess && (
          <button
            type="button"
            data-tutorial-move-crew-target
            onClick={(e) => { 
              const tutorialActive = document.body.classList.contains('tutorial-active');
              if (tutorialActive) return;
              state.weeklyPathNavOpen = !snap.weeklyPathNavOpen; 
            }}
            className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 py-2 transition-all duration-200 inline-flex items-center justify-center gap-1.5 shrink-0 ${snap.weeklyPathNavOpen ? 'bg-white text-palette-ink border border-white hover:bg-palette-sage hover:border-palette-sage' : (where === 'library' || where === 'move-crew') ? 'bg-palette-cream text-palette-ink border border-palette-stone/40 hover:border-palette-ink hover:bg-palette-stone/10 shadow-sm' : 'bg-white/95 text-palette-ink border border-white/80 hover:bg-palette-cream shadow-sm'}`}
          >
            {snap.weeklyPathNavOpen ? (
              <>
                <IoCloseOutline className="h-5 w-5" aria-hidden />
                <span>Cerrar</span>
              </>
            ) : (
              <span>Menú</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default MainSideBar