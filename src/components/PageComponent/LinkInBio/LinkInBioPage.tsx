'use client';

import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import { motion } from 'framer-motion';
import { CiInstagram, CiMail, CiYoutube } from 'react-icons/ci';
import { FaWhatsapp } from 'react-icons/fa';
import { LINK_IN_BIO_HERO_PUBLIC_ID, LINK_IN_BIO_SOCIAL } from '../../../constants/linkInBio';
import type { LinkInBioProductCard } from '../../../lib/linkInBioProducts';
import LinkInBioColorfulBackdrop from './LinkInBioColorfulBackdrop';
import LinkInBioProductCarousel from './LinkInBioProductCarousel';

type Props = {
  latestCursoSlug?: string | null;
  products: LinkInBioProductCard[];
};

/** Sombra ink corrida solo para el nombre sobre la foto */
const HERO_NAME_HALO = '[text-shadow:1.5px_1.5px_0_rgba(20,20,17,0.35)]';
function SocialLinks() {
  const mailto = `mailto:${LINK_IN_BIO_SOCIAL.email}`;

  return (
    <div className="flex items-center justify-center gap-4">
      <a
        href={LINK_IN_BIO_SOCIAL.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram @mateo.move"
        className="rounded-full bg-palette-ink/[0.06] p-2.5 text-palette-ink transition hover:bg-palette-ink/10 active:opacity-70"
      >
        <CiInstagram className="h-5 w-5 md:h-6 md:w-6" />
      </a>
      <a
        href={LINK_IN_BIO_SOCIAL.youtube}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
        className="rounded-full bg-palette-ink/[0.06] p-2.5 text-palette-ink transition hover:bg-palette-ink/10 active:opacity-70"
      >
        <CiYoutube className="h-5 w-5 md:h-6 md:w-6" />
      </a>
      <a
        href={LINK_IN_BIO_SOCIAL.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="rounded-full bg-palette-ink/[0.06] p-2.5 text-palette-ink transition hover:bg-palette-ink/10 active:opacity-70"
      >
        <FaWhatsapp className="h-[18px] w-[18px] md:h-5 md:w-5" />
      </a>
      <a
        href={mailto}
        aria-label={`Email ${LINK_IN_BIO_SOCIAL.email}`}
        className="rounded-full bg-palette-ink/[0.06] p-2.5 text-palette-ink transition hover:bg-palette-ink/10 active:opacity-70"
      >
        <CiMail className="h-5 w-5 md:h-6 md:w-6" />
      </a>
    </div>
  );
}

export default function LinkInBioPage({ products }: Props) {
  return (
    <motion.div className="relative flex min-h-[100dvh] justify-center overflow-x-hidden bg-palette-cream/80 font-montserrat md:min-h-[100vh]">
      <LinkInBioColorfulBackdrop />
      <div className="absolute mx-auto h-full w-0 bg-palette-cream md:top-10 md:min-h-[140vh] md:w-[60%] md:rounded-xl lg:w-[50%]" />
      <div className="absolute z-10 mx-auto h-full w-full bg-[#EDECDB] md:top-10 md:min-h-[140vh] md:w-[60%] md:rounded-xl md:bg-palette-sage/50 lg:w-[50%]" />

      <div className="relative z-40 flex w-full min-w-0 max-w-[430px] flex-col gap-0 bg-palette-cream/80 pb-[env(safe-area-inset-bottom)] md:top-20 md:min-h-[calc(100vh-5rem)] md:w-[520px] md:max-w-[520px] md:rounded-xl md:shadow-[0_24px_80px_rgba(20,20,17,0.18)]">
        <div className="relative h-[clamp(12.5rem,58dvh,28rem)] w-full shrink-0 overflow-hidden md:h-auto md:max-h-none md:min-h-[40rem] md:flex-1">
          <CldImage
            src={LINK_IN_BIO_HERO_PUBLIC_ID}
            alt="Mateo Molfino"
            fill
            priority
            sizes="100vw"
            className="block object-cover object-top md:rounded-t-xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[42%] bg-gradient-to-t from-[#EDECDB] via-[#EDECDB]/85 to-transparent"
          />

          <motion.div
            className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-1 px-4 pb-5 text-center"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className={`font-montserrat text-3xl font-bold tracking-tight text-white md:text-4xl ${HERO_NAME_HALO}`}>
              Mateo Molfino
            </h1>
            <p className="mx-auto max-w-[17rem] font-medium font-montserrat text-[12px] leading-relaxed text-palette-ink md:max-w-xs md:text-sm">
            <span className={` block text-palette-cream  tracking-[0.14em] ${HERO_NAME_HALO} relative bottom-2`}>Educador de movimiento</span>

              De no confiar en tu cuerpo a saber exactamente qué hacer con él.
            </p>
            <div className="mt-3">
              <SocialLinks />
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 -mt-2 flex min-w-0 shrink-0 flex-col bg-[#EDECDB] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 md:mt-0 md:rounded-b-xl md:pt-0">
          <div className="mb-5 flex items-center gap-3">
            <span aria-hidden className="h-px flex-1 bg-palette-ink/10" />
            <h2 className="shrink-0 font-montserrat text-xs font-bold tracking-[0.24em] text-palette-ink md:text-sm">
              MÉTODO Y EVENTOS
            </h2>
            <span aria-hidden className="h-px flex-1 bg-palette-ink/10" />
          </div>

          <div className="overflow-x-hidden [-webkit-overflow-scrolling:touch]">
            <LinkInBioProductCarousel products={products} />
          </div>

          <footer className="mt-5 pt-1">
            <Link
              href="/"
              className="block w-full rounded-full border border-palette-sage bg-palette-sage py-3 text-center font-montserrat text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-ink shadow-[0_8px_24px_rgba(172,174,137,0.28)] transition hover:border-palette-ink hover:bg-palette-ink/80 hover:text-palette-cream active:scale-[0.98] active:opacity-90"
            >
              Deslizarme a la web
            </Link>
          </footer>
        </div>
      </div>
    </motion.div>
  );
}
