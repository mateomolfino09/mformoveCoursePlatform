'use client';

import { CldImage } from 'next-cloudinary';
import { LINK_IN_BIO_DESKTOP_BACKDROP_PUBLIC_ID } from '../../../constants/linkInBio';

/** Fondo full-screen: foto difuminada + manchas de color de la paleta. */
export default function LinkInBioColorfulBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-10 min-h-[100dvh] overflow-hidden bg-palette-ink"
    >
      <CldImage
        src={LINK_IN_BIO_DESKTOP_BACKDROP_PUBLIC_ID}
        alt=""
        fill
        sizes="100vw"
        className="scale-125 object-cover object-[center_20%] opacity-45 blur-[72px] saturate-[1.35]"
      />

      <div className="absolute -left-[18%] top-[8%] h-[min(70vw,520px)] w-[min(70vw,520px)] rounded-full bg-palette-teal opacity-70 blur-[88px]" />
      <div className="absolute -right-[12%] top-[18%] h-[min(65vw,480px)] w-[min(65vw,480px)] rounded-full bg-palette-sage opacity-75 blur-[96px]" />
      <div className="absolute bottom-[12%] left-[8%] h-[min(55vw,420px)] w-[min(55vw,420px)] rounded-full bg-palette-steel opacity-65 blur-[84px]" />
      <div className="absolute bottom-[8%] right-[5%] h-[min(50vw,380px)] w-[min(50vw,380px)] rounded-full bg-[#c4b896] opacity-55 blur-[80px]" />
      <div className="absolute left-1/2 top-1/2 h-[min(80vw,600px)] w-[min(80vw,600px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-palette-stone/40 opacity-50 blur-[100px]" />

      <div className="absolute inset-0 bg-gradient-to-br from-palette-ink/50 via-palette-teal/25 to-palette-sage/35" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(20,20,17,0.55)_100%)]" />
      {/* Velo ink a pantalla completa */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-palette-ink/25 to-transparent"
      />

      {/* Mobile: velo crema + sage → tono oliva en la parte superior */}
      <div aria-hidden className="pointer-events-none absolute inset-0 md:hidden">
        <div className="absolute inset-x-0 top-0 h-[min(72vh,520px)] bg-gradient-to-b from-palette-cream via-palette-cream/50 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-[min(80vh,560px)] bg-gradient-to-b from-palette-sage/20 via-palette-sage/10 to-transparent" />
      </div>
    </div>
  );
}
