'use client';

import { useEffect, useState } from 'react';
import { isDlocalLocalCurrencyCountry } from '../constants/dlocalCountries';

const STORAGE_KEY = 'mformove-detected-country';

export type DetectedCountryState = {
  countryCode: string;
  countryLabel: string;
  source: 'vercel' | 'cloudflare' | null;
};

function readCached(): DetectedCountryState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DetectedCountryState;
    if (parsed?.countryLabel && parsed?.countryCode) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache(entry: DetectedCountryState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    /* ignore */
  }
}

/** País detectado por IP (Vercel/Cloudflare). Cacheado en sessionStorage. */
export function useDetectedCountry() {
  const [detected, setDetected] = useState<DetectedCountryState | null>(() => readCached());
  const [loading, setLoading] = useState(() => !readCached());

  useEffect(() => {
    if (detected) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch('/api/geo/country', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.countryCode) return;

        const entry: DetectedCountryState = {
          countryCode: data.countryCode,
          countryLabel: data.countryLabel || data.countryCode,
          source: data.source ?? null,
        };

        setDetected(entry);
        writeCache(entry);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [detected]);

  const dlocalCountryLabel =
    detected && isDlocalLocalCurrencyCountry(detected.countryCode)
      ? detected.countryLabel
      : null;

  return { detected, dlocalCountryLabel, loading };
}
