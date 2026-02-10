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
      {/* Barra móvil: Move Crew y Menú abajo a la derecha (todo el sitio excepto Move Crew) */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[210] flex items-center justify-end md:hidden px-4 py-3 gap-2"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
        >
          {hasAccess && (
            <button
              type="button"
              data-tutorial-move-crew-target
              onClick={(e) => { 
                // Bloquear función natural cuando el tutorial está activo (excepto paso 1 donde se necesita el clic)
                const tutorialActive = document.body.classList.contains('tutorial-active');
                if (tutorialActive) {
                  // En el paso 1, permitir el clic para que el tutorial lo capture
                  // El tutorial manejará la transición al paso 2
                  return;
                }
                state.weeklyPathNavOpen = !snap.weeklyPathNavOpen; 
              }}
              className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 py-2 transition-all duration-200 inline-flex items-center justify-center gap-1.5 shrink-0 ${snap.weeklyPathNavOpen ? 'text-white border border-white/80 hover:bg-white hover:text-palette-ink hover:border-white' : (where === 'library' || where === 'move-crew') ? 'text-palette-ink border border-palette-stone/50 hover:border-palette-ink hover:bg-palette-stone/5' : 'text-white border border-white/40 hover:bg-white/20'}`}
            >
              {snap.weeklyPathNavOpen ? (
                <>
                  <IoCloseOutline className="h-5 w-5" aria-hidden />
                  <span>Cerrar</span>
                </>
              ) : (
                <span>Move Crew</span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={toggleNav}
            className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 py-2 transition-all duration-200 inline-flex items-center justify-center gap-1.5 shrink-0 ${showNav ? 'text-white border border-white/80 hover:bg-white hover:text-palette-ink hover:border-white' : (where === 'library' || where === 'move-crew') ? 'text-palette-ink border border-palette-stone/50 hover:border-palette-ink hover:bg-palette-stone/5' : 'text-white border border-white/40 hover:bg-white/20'}`}
          >
            {showNav ? (
              <>
                <IoCloseOutline className="h-5 w-5" aria-hidden />
                <span>Cerrar</span>
              </>
            ) : (
              <span>Menú</span>
            )}
          </button>
        </div>
    </div>
  )
}

export default MainSideBar