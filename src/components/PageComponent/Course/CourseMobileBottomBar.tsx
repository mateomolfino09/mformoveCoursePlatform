'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoCloseOutline } from 'react-icons/io5';
import { useMembershipNav } from '../../MainSidebar/MembershipNavContext';
import { useCursoLanding } from './CursoLandingContext';
import { useAuth } from '../../../hooks/useAuth';
import { userHasPurchasedCourseBySlug } from '../../../lib/clientCourseAccess';
import { cursoCheckoutApplyCtaLabel } from '../../../constants/cursoSalesCall';

/** Botones de conversión + Menú para reutilizar en barra flotante. */
export const CourseBottomBarButtons = () => {
  const router = useRouter();
  const auth = useAuth();
  const nav = useMembershipNav();
  const { cursoConfig, slug, checkoutStartPath, productName } = useCursoLanding();
  const [applyPressed, setApplyPressed] = useState(false);
  if (!nav) return null;
  const { toggleNav, showNav } = nav;
  const yaEsAlumno = userHasPurchasedCourseBySlug(auth.user, slug);

  const handleApply = () => {
    if (yaEsAlumno) {
      router.push(cursoConfig.hero.rutaUsuarioSuscriptor || '/biblioteca');
      return;
    }
    router.push(checkoutStartPath);
  };

  const ctaClass = `max-w-[16.5rem] whitespace-normal text-center font-montserrat font-light text-[11px] leading-snug tracking-[0.06em] uppercase rounded-full border px-3.5 py-2 transition-colors duration-100 active:border-palette-sage active:bg-palette-sage active:text-palette-ink ${
    applyPressed
      ? 'border-palette-sage bg-palette-sage text-palette-ink'
      : showNav
        ? 'border-white/80 text-white hover:border-white hover:bg-white hover:text-palette-ink'
        : 'border-black bg-black text-white hover:border-palette-steel hover:bg-palette-steel hover:text-palette-ink'
  }`;

  return (
    <>
      <button
        type="button"
        onClick={handleApply}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          setApplyPressed(true);
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* Si el puntero ya no está activo, el color sage igual queda aplicado. */
          }
        }}
        onPointerUp={() => setApplyPressed(false)}
        onPointerCancel={() => setApplyPressed(false)}
        className={ctaClass}
      >
        {cursoCheckoutApplyCtaLabel(productName)}
        <span aria-hidden> →</span>
      </button>
      <button
        type="button"
        onClick={toggleNav}
        className={`font-montserrat font-light text-xs tracking-[0.12em] uppercase rounded-full border px-4 py-2 transition-all duration-200 shrink-0 inline-flex items-center justify-center gap-1 active:border-palette-sage active:bg-palette-sage active:text-palette-ink ${
          showNav
            ? 'border-palette-sage bg-palette-sage text-palette-ink'
            : 'border-white/80 bg-white text-palette-ink hover:border-white hover:bg-palette-cream'
        }`}
      >
        {showNav ? <IoCloseOutline className="h-5 w-5" /> : <span>Menú</span>}
      </button>
    </>
  );
};

/**
 * Barra fija inferior en móvil. Se muestra solo en móvil cuando no hay barra de
 * descuento (PromocionFooter).
 */
const CourseMobileBottomBar = () => {
  const nav = useMembershipNav();
  if (!nav) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[210] flex w-full items-center justify-center  px-4 py-3 backdrop-blur-[2px] md:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0))' }}
    >
      <div className="flex items-center justify-center gap-3">
        <CourseBottomBarButtons />
      </div>
    </div>
  );
};

export default CourseMobileBottomBar;
