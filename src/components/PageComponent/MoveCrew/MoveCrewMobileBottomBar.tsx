'use client';
import Link from 'next/link';
import { IoCloseOutline } from 'react-icons/io5';
import { useMoveCrewNav } from '../../MainSidebar/MoveCrewNavContext';

/** Botones Empezar Camino + Menú para reutilizar en barra flotante o en PromocionFooter */
export const MoveCrewBottomBarButtons = () => {
  const nav = useMoveCrewNav();
  if (!nav) return null;
  const { toggleNav, showNav } = nav;
  return (
    <>
      <Link
        href="/move-crew#move-crew-plans"
        className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 py-2 transition-all duration-200 shrink-0 ${showNav ? 'text-white border border-white/80 hover:bg-white hover:text-palette-ink hover:border-white' : 'bg-black text-white border border-black hover:bg-palette-sage hover:border-palette-sage'}`}
      >
        Empezar Camino
      </Link>
      <button
        type="button"
        onClick={toggleNav}
        className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 py-2 transition-all duration-200 shrink-0 inline-flex items-center justify-center gap-1 ${showNav ? 'text-white border border-white/80 hover:bg-white hover:text-palette-ink hover:border-white' : 'text-black/90 border border-white/40 hover:bg-white/20'}`}
      >
        {showNav ? <IoCloseOutline className="h-5 w-5" /> : <span>Menú</span>}
      </button>
    </>
  );
};

/**
 * Barra fija inferior en móvil para Move Crew: Empezar Camino + Menú.
 * Se muestra solo en móvil cuando no hay barra de descuento (PromocionFooter).
 */
const MoveCrewMobileBottomBar = () => {
  const nav = useMoveCrewNav();
  if (!nav) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[210] flex items-center justify-end md:hidden px-4 py-3"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
    >
      <div className="flex items-center justify-center gap-3">
        <MoveCrewBottomBarButtons />
      </div>
    </div>
  );
};

export default MoveCrewMobileBottomBar;
