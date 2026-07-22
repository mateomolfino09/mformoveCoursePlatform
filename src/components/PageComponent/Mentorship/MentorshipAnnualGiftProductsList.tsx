'use client';

import { CldImage } from 'next-cloudinary';
import { useEffect, useState } from 'react';
import {
  formatMentorshipAmount,
  mentorshipCurrencySymbol,
} from '../../../lib/mentorshipPricing';
import type { LinkInBioProductCard } from '../../../lib/linkInBioProducts';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';

function formatGiftListPrice(price: number, currency: string | null | undefined): string {
  const code = (currency || 'USD').toUpperCase();
  const sym = code === 'USD' ? 'U$S' : mentorshipCurrencySymbol(code);
  return `${sym} ${formatMentorshipAmount(price)}`;
}

type MentorshipAnnualGiftProductsListProps = {
  /** Estilo sobre fondo claro (checkout) o oscuro (landing). */
  tone?: 'light' | 'dark';
  className?: string;
};

/** Listado de productos de regalo del plan anual (misma fuente que /bio). */
export default function MentorshipAnnualGiftProductsList({
  tone = 'light',
  className = '',
}: MentorshipAnnualGiftProductsListProps) {
  const [products, setProducts] = useState<LinkInBioProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/link-in-bio/products', { cache: 'no-store' });
        const data = (await res.json()) as { products?: LinkInBioProductCard[] };
        if (cancelled) return;
        const list = Array.isArray(data.products) ? data.products : [];
        setProducts(list.filter((p) => p.tipo !== 'mentoria'));
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className={`flex justify-center py-6 ${className}`}>
        <MiniLoadingSpinner />
      </div>
    );
  }

  if (products.length === 0) return null;

  const isDark = tone === 'dark';
  const titleClass = isDark
    ? 'text-palette-cream'
    : 'text-palette-ink';
  const strikeClass = isDark
    ? 'text-palette-cream/45'
    : 'text-palette-stone/70';
  const giftClass = isDark ? 'text-palette-stone' : 'text-palette-stone';
  const deRegaloClass = isDark ? 'text-palette-cream/55' : 'text-palette-stone';
  const divideClass = isDark ? 'divide-palette-cream/10' : 'divide-palette-stone/15';
  const thumbClass = isDark ? 'bg-palette-cream/10' : 'bg-palette-ink/5';

  return (
    <ul className={`${divideClass} divide-y ${className}`}>
      {products.map((product) => {
        const hasPrice =
          typeof product.price === 'number' &&
          Number.isFinite(product.price) &&
          product.price > 0;

        return (
          <li
            key={product.id}
            className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 md:gap-4 md:py-4"
          >
            <div
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl md:h-16 md:w-16 ${thumbClass}`}
            >
              <CldImage
                src={product.imageSrc}
                alt={product.title}
                fill
                sizes="64px"
                className="object-cover object-center"
              />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className={`truncate font-montserrat text-sm font-semibold md:text-base ${titleClass}`}>
                {product.title}
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                {hasPrice ? (
                  <span className={`font-raleway text-xs line-through md:text-sm ${strikeClass}`}>
                    {formatGiftListPrice(product.price!, product.currency)}
                  </span>
                ) : null}
                <span
                  className={`font-montserrat text-xs font-semibold uppercase tracking-[0.12em] md:text-sm ${giftClass}`}
                >
                  Ahora U$S 0
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
