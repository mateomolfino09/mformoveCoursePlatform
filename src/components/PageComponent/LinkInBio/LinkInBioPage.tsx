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

function SocialLinks() {
  const mailto = `mailto:${LINK_IN_BIO_SOCIAL.email}`;

  return (
    <div className="flex items-center justify-center gap-5">
      <a
        href={LINK_IN_BIO_SOCIAL.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram @mateo.move"
        className="text-palette-ink transition active:opacity-70"
      >
        <CiInstagram className="h-6 w-6 md:h-8 md:w-8" />
      </a>
      <a
        href={LINK_IN_BIO_SOCIAL.youtube}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
        className="text-palette-ink transition active:opacity-70"
      >
        <CiYoutube className="h-6 w-6 md:h-8 md:w-8" />
      </a>
      <a
        href={LINK_IN_BIO_SOCIAL.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="text-palette-ink transition active:opacity-70"
      >
        <FaWhatsapp className="h-[20px] w-[20px] md:h-[28px] md:w-[28px]" />
      </a>
      <a
        href={mailto}
        aria-label={`Email ${LINK_IN_BIO_SOCIAL.email}`}
        className="text-palette-ink transition active:opacity-70"
      >
        <CiMail className="h-6 w-6 md:h-8 md:w-8" />
      </a>
    </div>
  );
}

export default function LinkInBioPage({ products }: Props) {
  return (
    <motion.div className="relative flex min-h-[100dvh] md:min-h-[100vh] justify-center overflow-x-hidden bg-palette-cream/80 font-montserrat ">
      <LinkInBioColorfulBackdrop />
      <div className='absolute md:top-10 md:w-[60%] lg:w-[50%] w-0 h-full bg-palette-cream z-10 md:rounded-xl mx-auto md:min-h-[140vh]' />
      <div className='absolute md:top-10 md:w-[60%] lg:w-[50%] w-full h-full bg-[#EDECDB] md:bg-palette-sage/50 md:rounded-xl z-30 mx-auto md:min-h-[140vh]'  />

      <div className="relative z-40 flex w-full max-w-[430px] flex-col gap-0 bg-palette-cream/80 pb-[env(safe-area-inset-bottom)] md:top-20 md:min-h-[calc(100vh-5rem)] md:max-w-[520px] md:min-w-[520px] md:rounded-xl">
        <div className="relative h-[clamp(12.5rem,58dvh,28rem)] md:h-auto md:max-h-none md:flex-1 overflow-hidden w-full shrink-0 md:min-h-[40rem]">
          <CldImage
            src={LINK_IN_BIO_HERO_PUBLIC_ID}
            alt="Mateo Molfino"
            fill
            priority
            sizes="100vw"
            className="block object-cover object-top md:rounded-xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[35%] bg-gradient-to-t from-[#EDECDB] via-[#EDECDB]  to-transparent"
          />

          <motion.div
            className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-1 px-4 pb-4 text-center"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-montserrat text-3xl md:text-4xl font-bold tracking-tight text-palette-ink">
              Mateo Molfino
            </h1>
            <p className="font-montserrat text-[10px] md:text-sm tracking-[0.22em] text-palette-ink">
              Maestro de movimiento
            </p>
            <div className="mt-2">
              <SocialLinks />
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 -mt-2 flex shrink-0 flex-col px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] md:mt-0 md:pt-0 bg-[#EDECDB]">
          <div className='flex items-center justify-center mb-4'>
            <h1 className='font-montserrat text-sm md:text-lg font-bold tracking-tight text-palette-ink'>MÉTODO Y EVENTOS
            </h1>
          </div>
          <div className="overflow-x-hidden [-webkit-overflow-scrolling:touch]">
            <LinkInBioProductCarousel products={products} />
          </div>

          <footer className="mt-4 pt-2">
            <Link
              href="/"
              className="block w-full rounded-full border hover:bg-palette-ink/80  hover:border-palette-ink hover:text-palette-cream border-palette-sage bg-palette-sage py-3 text-center font-montserrat text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-ink transition active:scale-[0.98] active:opacity-90"
            >
              Ir al sitio
            </Link>
          </footer>
        </div>
      </div>
    </motion.div>
  );
}
