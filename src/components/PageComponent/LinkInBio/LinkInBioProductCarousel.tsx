'use client';

import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import { motion } from 'framer-motion';
import { useLayoutEffect, useRef } from 'react';
import type { LinkInBioProductCard } from '../../../lib/linkInBioProducts';

type Props = {
  products: LinkInBioProductCard[];
};

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
          <p className="font-montserrat text-[10px] uppercase tracking-[0.18em] text-palette-sage">
            {product.tipo === 'curso'
              ? 'Programa'
              : product.tipo === 'mentoria'
                ? 'Mentoría'
                : product.tipo === 'evento'
                  ? 'Evento'
                  : 'Producto'}
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

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const targetIndex = products.findIndex((p) => p.tipo === 'mentoria');
    if (targetIndex < 0) return;

    const target = container.querySelectorAll('li')[targetIndex] as HTMLElement | undefined;
    if (!target) return;

    const centerSecondCard = () => {
      const offset =
        target.offsetLeft - (container.clientWidth - target.offsetWidth) / 2;
      container.scrollLeft = Math.max(0, offset);
    };

    centerSecondCard();
    requestAnimationFrame(centerSecondCard);
  }, [products]);

  if (products.length === 0) {
    return (
      <p className="py-2 text-center font-montserrat text-xs text-palette-stone">
        Próximamente más programas.
      </p>
    );
  }

  return (
    <section className="w-full shrink-0 pb-1">
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
    </section>
  );
}
