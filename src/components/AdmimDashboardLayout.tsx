'use client';

import AdminDashboardSideBar from './AdminDashboardSideBar';
import AdminDashboardTopBar from './AdminDashboardTopBar';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAdminTheme } from './admin/useAdminTheme';

interface Props {
  children: React.ReactNode;
}

const AdmimDashboardLayout = ({ children }: Props) => {
  const [showNav, setShowNav] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const auth = useAuth();
  const { theme, setTheme } = useAdminTheme();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowNav(!mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-admin-active', 'true');
    root.setAttribute('data-admin-theme', theme);
    return () => {
      root.removeAttribute('data-admin-active');
      root.removeAttribute('data-admin-theme');
    };
  }, [theme]);

  const closeIfMobile = () => {
    if (isMobile) setShowNav(false);
  };

  return (
    <div
      data-admin-shell
      data-admin-theme={theme}
      className="min-h-screen bg-[var(--admin-bg)] text-[var(--admin-fg)]"
    >
      <AdminDashboardTopBar
        showNav={showNav}
        setShowNav={setShowNav}
        isMobile={isMobile}
        dbUser={auth.user}
        theme={theme}
        onThemeChange={setTheme}
      />
      {showNav && isMobile ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-20 bg-black/30"
          onClick={() => setShowNav(false)}
        />
      ) : null}
      <AdminDashboardSideBar
        showNav={showNav}
        isMobile={isMobile}
        onNavigate={closeIfMobile}
      />
      <main
        className={`admin-main min-h-screen transition-[padding] duration-[var(--admin-ease)] ${
          showNav && !isMobile ? 'pl-[var(--admin-sidebar)]' : ''
        }`}
      >
        <div className="w-full px-4 pb-16 md:px-8">{children}</div>
      </main>
    </div>
  );
};

export default AdmimDashboardLayout;
