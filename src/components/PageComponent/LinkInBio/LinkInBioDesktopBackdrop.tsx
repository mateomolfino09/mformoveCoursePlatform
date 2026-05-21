'use client';

import { CldImage } from 'next-cloudinary';
import { LINK_IN_BIO_DESKTOP_BACKDROP_PUBLIC_ID } from '../../../constants/linkInBio';

/** Laterales en desktop: negro + imagen difuminada (solo md+). */
export default function LinkInBioDesktopBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hidden bg-palette-ink md:block">
      <CldImage
        src={LINK_IN_BIO_DESKTOP_BACKDROP_PUBLIC_ID}
        alt=""
        fill
        priority={false}
        sizes="100vw"
        className="scale-110 object-cover object-center opacity-50 blur-3xl"
      />
      <div className="absolute inset-0 bg-palette-ink/75" />
    </div>
  );
}
