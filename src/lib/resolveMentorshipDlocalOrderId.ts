const MENTORSHIP_ORDER_PREFIX = 'mentoria-';

export function buildMentorshipDlocalOrderId(
  planId: string,
  interval: string,
  suffix?: string | null,
): string {
  const base = `${MENTORSHIP_ORDER_PREFIX}${planId}-${interval}`;
  if (!suffix?.trim()) return base;
  return `${base}-r${suffix.trim()}`;
}

export function resolveMentorshipPlanFromDlocalOrderId(orderId?: string | null): {
  planId: string | null;
  interval: string | null;
} {
  if (!orderId?.startsWith(MENTORSHIP_ORDER_PREFIX)) {
    return { planId: null, interval: null };
  }

  const rest = orderId.slice(MENTORSHIP_ORDER_PREFIX.length);
  const match = rest.match(/^([a-f0-9]{24})-(mensual|trimestral|anual)/i);
  if (!match) return { planId: null, interval: null };

  return {
    planId: match[1],
    interval: match[2].toLowerCase(),
  };
}
