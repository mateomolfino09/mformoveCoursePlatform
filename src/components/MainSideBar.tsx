import IndexHeader from './IndexHeader';
import HeaderHome from './HeaderHome';
import ProductHeader from './PageComponent/Products/HeaderProduct';
import { useAuth } from '../hooks/useAuth';
import { useSnapshot } from 'valtio';
import state from '../valtio';
import LoginModal from './PageComponent/Login/LoginModal';
import MainSideBarDash from './MainSideBarDash';
import { parseCookies } from 'nookies';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface Props {
  children: any;
  where: any;
}

const MainSideBar = ({ children, where }: Props) => {
  const auth = useAuth();
  const [showNav, setShowNav] = useState(false);
  const snap = useSnapshot(state);

  const toggleNav = () => {
    setShowNav(!showNav);
  };

  return (
    <div className='w-full h-full'>
      {where === 'home' && <HeaderHome user={auth.user} toggleNav={toggleNav} />}
      {where === 'index' && (
        <IndexHeader user={auth.user} toggleNav={toggleNav} where={where} />
      )}
      {where === 'product' && (
        <ProductHeader user={auth.user} toggleNav={toggleNav} />
      )}
      {showNav && <MainSideBarDash showNav={showNav} where={where} toggleNav={toggleNav} />}
      {snap.loginForm && <LoginModal />}
      {children}
    </div>
  );
  
};

export default MainSideBar;
