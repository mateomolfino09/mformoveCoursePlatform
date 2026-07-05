import type { MentorshipBillingInterval } from './mentorshipPricing';
import { mentorshipIntervalLabel } from './mentorshipPricing';

export type UserMentorship = {
  active?: boolean;
  planId?: string;
  planName?: string;
  planLevel?: string;
  interval?: MentorshipBillingInterval;
  provider?: 'stripe' | 'dlocalgo';
  subscriptionId?: string;
  startDate?: string | Date;
  lastPaymentDate?: string | Date;
  status?: string;
  amount?: number;
  moneda?: string;
};

export function hasActiveMentorship(
  user: { mentorship?: UserMentorship | null } | null | undefined,
): boolean {
  const m = user?.mentorship;
  if (!m?.active) return false;
  const status = String(m.status || 'active').toLowerCase();
  return status !== 'canceled' && status !== 'cancelled';
}

export function hasMentorshipRecord(
  user: { mentorship?: UserMentorship | null } | null | undefined,
): boolean {
  return Boolean(user?.mentorship?.planId || user?.mentorship?.planName);
}

export function mentorshipStatusLabel(status?: string): string {
  const s = String(status || 'active').toLowerCase();
  if (s === 'cancel_at_period_end') return 'Cancelación al fin del período';
  if (s === 'canceled' || s === 'cancelled') return 'Cancelada';
  if (s === 'active') return 'Activa';
  return status || 'Activa';
}

export function mentorshipProviderLabel(provider?: string): string {
  if (provider === 'stripe') return 'Stripe (tarjeta internacional)';
  if (provider === 'dlocalgo') return 'dLocal GO (pago local)';
  return provider || '—';
}

export function mentorshipIntervalDisplay(interval?: MentorshipBillingInterval): string {
  if (!interval) return '—';
  return mentorshipIntervalLabel(interval);
}

export function getUserAvatarInitial(user: {
  nombre?: string;
  name?: string;
  email?: string;
}): string {
  const source = user.nombre || user.name || user.email || 'U';
  return source.charAt(0).toUpperCase();
}

/** Borde sage más vivo: claro sobre ink, más saturado sobre fondo sage. */
export function getMentorshipAvatarRingClass(onDarkHeader = false): string {
  return onDarkHeader
    ? 'ring-2 ring-[#c9db6b]'
    : 'ring-2 ring-[#8fad3a]';
}

export function getUserAvatarShellClass(
  isMentorshipActive: boolean,
  ringClassName = 'ring-palette-stone/30',
  onDarkHeader = false,
): string {
  if (isMentorshipActive && !onDarkHeader) {
    return `bg-gradient-to-br from-palette-sage via-[#d2d3b4] to-[#c5c6a6] ${getMentorshipAvatarRingClass(false)}`;
  }
  if (isMentorshipActive && onDarkHeader) {
    return `bg-palette-ink/80 ${getMentorshipAvatarRingClass(true)}`;
  }
  return `bg-palette-ink/80 ring-2 ${ringClassName}`;
}

/** Cream sobre header oscuro / ink sobre sage en header claro (p. ej. perfil). */
export function getUserAvatarTextClass(
  isMentorshipActive: boolean,
  onDarkHeader = false,
): string {
  if (!isMentorshipActive) return 'text-palette-cream';
  return onDarkHeader ? 'text-palette-cream' : 'text-palette-ink';
}

export function canCancelMentorshipStripe(mentorship?: UserMentorship | null): boolean {
  if (!mentorship?.active) return false;
  if (mentorship.provider !== 'stripe') return false;
  const status = String(mentorship.status || '').toLowerCase();
  if (status === 'cancel_at_period_end' || status === 'canceled' || status === 'cancelled') {
    return false;
  }
  const id = mentorship.subscriptionId || '';
  return id.startsWith('sub_');
}

export function canRenewMentorship(mentorship?: UserMentorship | null): boolean {
  if (!mentorship) return false;
  if (!mentorship.active) return true;
  if (mentorship.provider === 'dlocalgo') return true;
  const status = String(mentorship.status || '').toLowerCase();
  return status === 'cancel_at_period_end';
}

export function mentorshipRenewPath(interval?: MentorshipBillingInterval): string {
  const resolved = interval || 'mensual';
  return `/mentoria/empezar?interval=${encodeURIComponent(resolved)}`;
}
