'use client';
import Link from 'next/link';
import { IoCloseOutline } from 'react-icons/io5';
import { useCourseNav } from '../../MainSidebar/CourseNavContext';
import { useCursoLanding } from './CursoLandingContext';

/** Botones Empezar Camino + Menú para reutilizar en barra flotante o en PromocionFooter */
export const CourseBottomBarButtons = () => {
  const nav = useCourseNav();
  const { cursoConfig, landingPath, plansSectionId } = useCursoLanding();
  if (!nav) return null;
  const { toggleNav, showNav } = nav;
  const ctaBarraMovil = cursoConfig.navegacion.ctaBarraMovil;
  return (
    <>
      <Link
        href={`${landingPath}#${plansSectionId}`}
        className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 py-2 transition-all duration-200 shrink-0 ${showNav ? 'text-white border border-white/80 hover:bg-white hover:text-palette-ink hover:border-white' : 'bg-black text-white border border-black hover:bg-palette-steel hover:border-palette-steel hover:text-palette-ink'}`}
      >
        {ctaBarraMovil}
      </Link>
      <button
        type="button"
        onClick={toggleNav}
        className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full px-4 py-2 transition-all duration-200 shrink-0 inline-flex items-center justify-center gap-1 ${
          showNav
            ? 'bg-white text-palette-ink border border-white hover:bg-palette-steel hover:border-palette-steel hover:text-palette-ink'
            : 'bg-white text-palette-ink border border-white/80 hover:bg-palette-cream hover:border-white'
        }`}
      >
        {showNav ? <IoCloseOutline className="h-5 w-5" /> : <span>Menú</span>}
      </button>
    </>
  );
};

/**
 * Barra fija inferior en móvil para Cuerpo autónomo: Empezar Camino + Menú.
 * Se muestra solo en móvil cuando no hay barra de descuento (PromocionFooter).
 */
const CourseMobileBottomBar = () => {
  const nav = useCourseNav();
  if (!nav) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[210] flex items-center justify-end md:hidden px-4 py-3"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
    >
      <div className="flex items-center justify-center gap-3">
        <CourseBottomBarButtons />
      </div>
    </div>
  );
};

export default CourseMobileBottomBar;
