'use client';

import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  LINK_IN_BIO_CAROUSEL_INITIAL_INDEX,
  type LinkInBioProductCard,
} from '../../../lib/linkInBioProducts';

type Props = {
  products: LinkInBioProductCard[];
};

const CARD_WIDTH_CLASS = 'w-[min(72vw,260px)]';

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function typeEyebrow(product: LinkInBioProductCard): string {
  const id = (product.id || '').toLowerCase();
  if (product.tipo === 'curso') return 'Programa';
  if (product.tipo === 'evento') return 'Evento';
  if (product.tipo === 'mentoria') {
    if (id.includes('anual')) return 'Mentoría · Anual';
    if (id.includes('trimestral')) return 'Mentoría · Trimestral';
    return 'Mentoría';
  }
  return 'Producto';
}

function displayTitle(product: LinkInBioProductCard): string {
  if (product.tipo !== 'mentoria') return product.title;
  return (
    product.title
      .replace(/\s*[·•]\s*(Anual|Trimestral)\s*$/i, '')
      .replace(/\s+(Anual|Trimestral)\s*$/i, '')
      .trim() || product.title
  );
}

function ProductCard({
  product,
  index,
  isActive,
}: {
  product: LinkInBioProductCard;
  index: number;
  isActive: boolean;
}) {
  return (
    <motion.li
      className={`${CARD_WIDTH_CLASS} shrink-0 snap-center`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={product.href}
        aria-label={`${typeEyebrow(product)}: ${product.title}`}
        aria-current={isActive ? 'true' : undefined}
        className={`group relative block aspect-[3/4] overflow-hidden rounded-[1.35rem] bg-palette-cream/5 transition duration-500 ease-out active:scale-[0.985] ${
          isActive
            ? 'scale-[1.01] ring-2 ring-palette-cream/30 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)]'
            : 'ring-1 ring-palette-cream/10 opacity-90'
        }`}
      >
        <CldImage
          src={product.imageSrc}
          alt={product.title}
          fill
          sizes="260px"
          className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.04]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[42%] bg-[linear-gradient(to_top,rgba(20,20,17)_0%,rgba(20,20,17,0.55)_35%,rgba(20,20,17,0.18)_70%,rgba(20,20,17,0)_100%)]"
        />
        <div className="absolute inset-x-0 bottom-0 z-[2] flex flex-col gap-1.5 p-4 pb-4 pt-12 text-left">
          <span className="w-fit rounded-full bg-palette-cream/15 px-2.5 py-0.5 font-montserrat text-[9px] font-semibold uppercase tracking-[0.16em] text-palette-sage backdrop-blur-[2px]">
            {typeEyebrow(product)}
          </span>
          <p className="font-montserrat text-[15px] font-semibold leading-snug text-palette-cream md:text-base">
            {displayTitle(product)}
          </p>
          {product.subtitle ? (
            <p className="line-clamp-2 font-montserrat text-[11px] font-light leading-relaxed text-palette-cream/70 md:text-xs">
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
  const [activeIndex, setActiveIndex] = useState(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrame = useRef<number | null>(null);
  const isAnimating = useRef(false);

  const getClosestIndex = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return 0;
    const cards = container.querySelectorAll('li');
    if (cards.length === 0) return 0;
    const center = container.scrollLeft + container.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const el = card as HTMLElement;
      const mid = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(mid - center);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  }, []);

  const animateScrollTo = useCallback((targetLeft: number, duration = 520) => {
    const container = scrollRef.current;
    if (!container) return;

    if (animFrame.current) cancelAnimationFrame(animFrame.current);

    const start = container.scrollLeft;
    const delta = targetLeft - start;
    if (Math.abs(delta) < 1) {
      container.scrollLeft = targetLeft;
      return;
    }

    isAnimating.current = true;
    const startTime = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = easeInOutCubic(t);
      container.scrollLeft = start + delta * eased;
      if (t < 1) {
        animFrame.current = requestAnimationFrame(tick);
      } else {
        isAnimating.current = false;
        animFrame.current = null;
      }
    };

    animFrame.current = requestAnimationFrame(tick);
  }, []);

  const scrollToIndex = useCallback(
    (index: number, instant = false) => {
      const container = scrollRef.current;
      if (!container) return;
      const target = container.querySelectorAll('li')[index] as HTMLElement | undefined;
      if (!target) return;
      const offset = target.offsetLeft - (container.clientWidth - target.offsetWidth) / 2;
      const left = Math.max(0, offset);
      if (instant) {
        container.scrollLeft = left;
        return;
      }
      animateScrollTo(left, 560);
    },
    [animateScrollTo]
  );

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const maxScroll = container.scrollWidth - container.clientWidth;
    setCanScrollLeft(container.scrollLeft > 4);
    setCanScrollRight(container.scrollLeft < maxScroll - 4);
    if (!isAnimating.current) {
      setActiveIndex(getClosestIndex());
    }
  }, [getClosestIndex]);

  const settleToCenter = useCallback(() => {
    if (isAnimating.current) return;
    const closest = getClosestIndex();
    setActiveIndex(closest);
    scrollToIndex(closest);
  }, [getClosestIndex, scrollToIndex]);

  const scrollByCard = (direction: 'left' | 'right') => {
    const next =
      direction === 'left'
        ? Math.max(0, activeIndex - 1)
        : Math.min(products.length - 1, activeIndex + 1);
    setActiveIndex(next);
    scrollToIndex(next);
  };

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const startIndex = Math.min(
      Math.max(0, LINK_IN_BIO_CAROUSEL_INITIAL_INDEX),
      Math.max(0, products.length - 1)
    );

    const alignStart = () => {
      scrollToIndex(startIndex, true);
      setActiveIndex(startIndex);
      updateScrollState();
    };

    alignStart();
    requestAnimationFrame(alignStart);

    const onScroll = () => {
      updateScrollState();
      if (isAnimating.current) return;
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => {
        settleToCenter();
      }, 120);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', alignStart);

    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', alignStart);
      if (settleTimer.current) clearTimeout(settleTimer.current);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [products, scrollToIndex, settleToCenter, updateScrollState]);

  if (products.length === 0) {
    return (
      <p className="py-6 text-center font-montserrat text-sm text-palette-cream/55">
        Próximamente más caminos.
      </p>
    );
  }

  return (
    <section className="relative w-full shrink-0">
      <div
        ref={scrollRef}
        className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollBehavior: 'auto' }}
      >
        <ul className="flex w-max snap-x snap-proximity gap-3.5 py-1 pl-[max(0px,calc(50%-min(36vw,130px)))] pr-[max(0px,calc(50%-min(36vw,130px)))]">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              isActive={index === activeIndex}
            />
          ))}
        </ul>
      </div>

      {products.length > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              aria-label={`Ir a ${product.title}`}
              aria-current={index === activeIndex}
              onClick={() => {
                setActiveIndex(index);
                scrollToIndex(index);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'w-5 bg-palette-cream'
                  : 'w-1.5 bg-palette-cream/25 hover:bg-palette-cream/45'
              }`}
            />
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => scrollByCard('left')}
        disabled={!canScrollLeft}
        aria-label="Ver anterior"
        className="absolute left-0.5 top-[38%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-palette-cream/15 bg-palette-ink/70 text-palette-cream/80 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.45)] backdrop-blur-md transition active:scale-95 disabled:pointer-events-none disabled:opacity-0 md:left-0 md:h-10 md:w-10 md:border-palette-cream/20 md:bg-palette-ink/85 md:text-palette-cream md:hover:bg-palette-ink"
      >
        <ChevronLeftIcon className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard('right')}
        disabled={!canScrollRight}
        aria-label="Ver siguiente"
        className="absolute right-0.5 top-[38%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-palette-cream/15 bg-palette-ink/70 text-palette-cream/80 shadow-[0_4px_12px_-6px_rgba(0,0,0,0.45)] backdrop-blur-md transition active:scale-95 disabled:pointer-events-none disabled:opacity-0 md:right-0 md:h-10 md:w-10 md:border-palette-cream/20 md:bg-palette-ink/85 md:text-palette-cream md:hover:bg-palette-ink"
      >
        <ChevronRightIcon className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2} />
      </button>
    </section>
  );
}
