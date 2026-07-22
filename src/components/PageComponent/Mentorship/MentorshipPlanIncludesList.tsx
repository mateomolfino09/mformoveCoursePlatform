'use client';

import { CheckIcon } from '@heroicons/react/24/solid';
import { useEffect, useMemo, useState } from 'react';
import {
  buildMentorshipAnualBonusItems,
  MENTORSHIP_ANUAL_INCLUDES,
  MENTORSHIP_TRIMESTRAL_INCLUDES,
} from '../../../constants/mentorshipIncludes';
import type { LinkInBioProductCard } from '../../../lib/linkInBioProducts';
import type { MentorshipBillingInterval } from '../../../lib/mentorshipPricing';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';

type Props = {
  interval: MentorshipBillingInterval;
  className?: string;
};

function courseNamesFromProducts(products: LinkInBioProductCard[]): string[] {
  const fromCursos = products
    .filter((p) => p.tipo === 'curso' || p.tipo === 'programa_transformacional' || p.tipo === 'bundle')
    .map((p) => p.title.trim())
    .filter(Boolean);
  if (fromCursos.length > 0) return fromCursos;
  return products.map((p) => p.title.trim()).filter(Boolean);
}

/** Misma lista de “Qué incluye” que en la landing de planes. */
export default function MentorshipPlanIncludesList({ interval, className = '' }: Props) {
  const [products, setProducts] = useState<LinkInBioProductCard[]>([]);
  const [loading, setLoading] = useState(interval === 'anual');

  useEffect(() => {
    if (interval !== 'anual') {
      setProducts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
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
  }, [interval]);

  const items = useMemo(() => {
    if (interval === 'anual') {
      return {
        kind: 'anual' as const,
        bonuses: buildMentorshipAnualBonusItems(courseNamesFromProducts(products)),
      };
    }
    return {
      kind: 'trimestral' as const,
      items: [...MENTORSHIP_TRIMESTRAL_INCLUDES],
    };
  }, [interval, products]);

  if (interval === 'anual' && loading) {
    return (
      <div className={`flex justify-center py-4 ${className}`}>
        <MiniLoadingSpinner />
      </div>
    );
  }

  if (items.kind === 'anual') {
    return (
      <div className={`space-y-5 ${className}`}>
        <ul className="space-y-3">
          {MENTORSHIP_ANUAL_INCLUDES.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-palette-stone md:text-[15px]">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-palette-stone" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div>
          <p className="mb-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-stone">
            Además
          </p>
          <ul className="space-y-3">
            {items.bonuses.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-palette-stone md:text-[15px]">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-palette-stone" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <ul className={`space-y-3 ${className}`}>
      {items.items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-palette-stone md:text-[15px]">
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-palette-stone" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
