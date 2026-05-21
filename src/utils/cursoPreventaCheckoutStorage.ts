const STORAGE_KEY = 'curso-pending-preventa-redemption';

export type PendingPreventaRedemption = {
  productId: string;
  preventaTierIndex: number;
  createdAt: number;
};

export function savePendingPreventaRedemption(payload: PendingPreventaRedemption) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function getAndClearPendingPreventaRedemption(): PendingPreventaRedemption | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPreventaRedemption;
    if (!parsed?.productId || typeof parsed.preventaTierIndex !== 'number') return null;
    if (Date.now() - parsed.createdAt > 48 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}
