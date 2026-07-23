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

const SOCIAL = [
  {
    href: LINK_IN_BIO_SOCIAL.instagram,
    label: 'Instagram @mateo.move',
    Icon: CiInstagram,
    external: true,
  },
  {
    href: LINK_IN_BIO_SOCIAL.youtube,
    label: 'YouTube',
    Icon: CiYoutube,
    external: true,
  },
  {
    href: LINK_IN_BIO_SOCIAL.whatsapp,
    label: 'WhatsApp',
    Icon: FaWhatsapp,
    external: true,
  },
  {
    href: `mailto:${LINK_IN_BIO_SOCIAL.email}`,
    label: `Email ${LINK_IN_BIO_SOCIAL.email}`,
    Icon: CiMail,
    external: false,
  },
] as const;

const easeOut = [0.16, 1, 0.3, 1] as const;

function SocialLinks() {
  return (
    <div className="flex items-center justify-center gap-3.5 md:gap-4">
      {SOCIAL.map(({ href, label, Icon, external }, i) => (
        <motion.a
          key={label}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          aria-label={label}
          initial={{ opacity: 0, y: 16, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.55 + i * 0.09, ease: easeOut }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.94 }}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-palette-cream/35 bg-palette-ink/45 text-palette-cream shadow-[0_12px_28px_-10px_rgba(20,20,17,0.55)] backdrop-blur-md transition hover:border-palette-cream/60 hover:bg-palette-ink/60 md:h-[3.75rem] md:w-[3.75rem]"
        >
          <motion.span
            className="flex"
            animate={{ y: [0, -2, 0] }}
            transition={{
              duration: 2.8 + i * 0.35,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          >
            <Icon className="h-6 w-6 md:h-7 md:w-7" />
          </motion.span>
        </motion.a>
      ))}
    </div>
  );
}

export default function LinkInBioPage({ products }: Props) {
  return (
    <motion.div
      className="relative flex min-h-[100dvh] justify-center overflow-x-hidden bg-palette-ink font-montserrat md:min-h-[100vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <LinkInBioColorfulBackdrop />

      <div className="relative z-40 flex w-full min-w-0 max-w-[430px] flex-col overflow-x-hidden overflow-y-visible bg-palette-ink pb-[env(safe-area-inset-bottom)] shadow-[0_0_0_1px_rgba(250,248,244,0.06)] md:my-10 md:w-[520px] md:max-w-[520px] md:rounded-[1.75rem] md:shadow-[0_32px_90px_-28px_rgba(20,20,17,0.7)]">
        <div className="relative h-[clamp(22rem,68dvh,36rem)] w-full shrink-0 overflow-hidden md:h-[min(72vh,40rem)]">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.6, ease: easeOut }}
          >
            <motion.div
              className="absolute inset-[-6%]"
              animate={{ scale: [1, 1.06, 1], x: [0, -6, 0], y: [0, 4, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CldImage
                src={LINK_IN_BIO_HERO_PUBLIC_ID}
                alt="Mateo Molfino"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 520px"
                className="block object-cover object-top"
              />
            </motion.div>
          </motion.div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[88%] bg-[linear-gradient(to_top,#141411_0%,rgba(20,20,17,0.94)_14%,rgba(20,20,17,0.72)_36%,rgba(20,20,17,0.35)_58%,rgba(20,20,17,0.08)_78%,rgba(20,20,17,0)_100%)]"
          />

          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-[-20%] top-0 z-[2] h-px bg-gradient-to-r from-transparent via-palette-cream/50 to-transparent"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.7, 0], y: ['0%', '100%'] }}
            transition={{ duration: 3.2, delay: 0.4, ease: 'easeInOut' }}
          />

          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-8 text-center md:pb-9">
            <motion.h1
              className="font-montserrat text-[2.65rem] font-black leading-[1.08] tracking-[-0.02em] text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.35),0_8px_28px_rgba(0,0,0,0.45),0_0_40px_rgba(0,0,0,0.25)] md:text-[3.15rem]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.26, ease: easeOut }}
            >
              Mateo Molfino
            </motion.h1>

            <motion.div
              aria-hidden
              className="mt-4 h-px w-12 bg-white/55 shadow-[0_0_12px_rgba(255,255,255,0.35)]"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: easeOut }}
            />

            <motion.p
              className="mt-4 font-montserrat text-[12px] font-bold uppercase tracking-[0.28em] text-white/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.4),0_6px_20px_rgba(0,0,0,0.4)] md:text-[13px]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.44, ease: easeOut }}
            >
              Investigador de movimiento
            </motion.p>

            <motion.p
              className="mx-auto mt-4 max-w-[19rem] font-montserrat text-[15.5px] font-semibold leading-[1.65] tracking-[0.01em] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.45)] md:max-w-[22rem] md:text-[17px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.52, ease: easeOut }}
            >
              De no confiar en tu cuerpo a saber exactamente qué hacer con él.
            </motion.p>

            <div className="mt-7 md:mt-8">
              <SocialLinks />
            </div>
          </div>
        </div>

        <div className="relative z-10 -mt-px flex min-w-0 flex-1 flex-col bg-palette-ink px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1 md:px-5 md:pt-2">
          <div className="mb-4 flex items-center gap-3">
            <span aria-hidden className="h-px flex-1 bg-palette-cream/15" />
            <motion.h2
              className="shrink-0 font-montserrat text-[10px] font-semibold uppercase tracking-[0.26em] text-palette-cream/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.4 }}
            >
              Elegí tu camino
            </motion.h2>
            <span aria-hidden className="h-px flex-1 bg-palette-cream/15" />
          </div>

          <div className="min-w-0">
            <LinkInBioProductCarousel products={products} />
          </div>

          <footer className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.45 }}
            >
              <Link
                href="/"
                className="group flex w-full items-center justify-center gap-2 rounded-full border border-palette-cream/25 bg-palette-cream py-3.5 font-montserrat text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-ink transition hover:bg-white active:scale-[0.985]"
              >
                Ir a la web
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <p className="mt-3 text-center font-montserrat text-[10px] tracking-[0.08em] text-palette-cream/45">
                @mateo.move
              </p>
            </motion.div>
          </footer>
        </div>
      </div>
    </motion.div>
  );
}
