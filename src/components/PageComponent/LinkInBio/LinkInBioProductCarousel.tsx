'use client';

import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { LinkInBioProductCard } from '../../../lib/linkInBioProducts';

type Props = {
  products: LinkInBioProductCard[];
};

function cardLabel(product: LinkInBioProductCard): string {
  if (product.tipo === 'curso') return product.title;
  if (product.tipo === 'mentoria') return 'Mentoría';
  if (product.tipo === 'evento') return 'Evento';
  return 'Producto';
}

function ProductCard({ product, index }: { product: LinkInBioProductCard; index: number }) {
  return (
    <motion.li
      className="w-[min(72vw,260px)] shrink-0 snap-center"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.05 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={product.href}
        aria-label={product.title}
        className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-palette-ink/10 transition-transform active:scale-[0.98]"
      >
        <CldImage
          src={product.imageSrc}
          alt={product.title}
          fill
          sizes="260px"
          className="object-cover object-center transition duration-500 group-active:scale-105"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[55%] bg-gradient-to-t from-palette-ink via-palette-ink/75 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 z-[2] p-4 pt-10 text-left">
          <p
            className={`font-montserrat text-palette-sage ${
              product.tipo === 'curso'
                ? 'text-xs font-semibold normal-case leading-snug text-palette-cream'
                : 'text-[10px] uppercase tracking-[0.18em]'
            }`}
          >
            {cardLabel(product)}
          </p>
          {product.subtitle ? (
            <p className="mt-1 line-clamp-2 font-montserrat text-xs leading-snug text-palette-cream/70">
              {product.subtitle}
            </p>
          ) : null}
        </div>
      </Link>
    </motion.li>
  );
}

export default function LinkInBioProductCarousel({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const maxScroll = container.scrollWidth - container.clientWidth;
    setCanScrollLeft(container.scrollLeft > 4);
    setCanScrollRight(container.scrollLeft < maxScroll - 4);
  }, []);

  const scrollByCard = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const firstCard = container.querySelector('li') as HTMLElement | null;
    const gap = 12;
    const step = (firstCard?.offsetWidth ?? 260) + gap;
    container.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  };

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const targetIndex = products.findIndex((p) => p.tipo === 'mentoria');
    if (targetIndex >= 0) {
      const target = container.querySelectorAll('li')[targetIndex] as HTMLElement | undefined;
      if (target) {
        const centerSecondCard = () => {
          const offset = target.offsetLeft - (container.clientWidth - target.offsetWidth) / 2;
          container.scrollLeft = Math.max(0, offset);
        };

        centerSecondCard();
        requestAnimationFrame(centerSecondCard);
      }
    }

    updateScrollState();
    container.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      container.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [products, updateScrollState]);

  if (products.length === 0) {
    return (
      <p className="py-2 text-center font-montserrat text-xs text-palette-stone">
        Próximamente más programas.
      </p>
    );
  }

  return (
    <section className="relative w-full shrink-0 pb-1">
      <div
        ref={scrollRef}
        className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex w-max snap-x snap-mandatory gap-3">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => scrollByCard('left')}
        disabled={!canScrollLeft}
        aria-label="Ver anterior"
        className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-palette-ink/10 bg-palette-cream/95 text-palette-ink shadow-sm transition hover:bg-palette-cream disabled:pointer-events-none disabled:opacity-0 md:flex"
      >
        <ChevronLeftIcon className="h-5 w-5" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard('right')}
        disabled={!canScrollRight}
        aria-label="Ver siguiente"
        className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-palette-ink/10 bg-palette-cream/95 text-palette-ink shadow-sm transition hover:bg-palette-cream disabled:pointer-events-none disabled:opacity-0 md:flex"
      >
        <ChevronRightIcon className="h-5 w-5" strokeWidth={2} />
      </button>
    </section>
  );
}
