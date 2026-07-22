const MENTORSHIP_MP_PREFIX = 'mentoria-mp-';

/** external_reference: mentoria-mp-{planId}-{interval}[-r{suffix}] */
export function buildMentorshipMercadoPagoExternalRef(
  planId: string,
  interval: string,
  suffix?: string | null
): string {
  const base = `${MENTORSHIP_MP_PREFIX}${planId}-${interval}`;
  if (!suffix?.trim()) return base;
  return `${base}-r${suffix.trim()}`;
}

export function resolveMentorshipPlanFromMercadoPagoExternalRef(
  externalReference?: string | null
): { planId: string | null; interval: string | null } {
  if (!externalReference?.startsWith(MENTORSHIP_MP_PREFIX)) {
    return { planId: null, interval: null };
  }

  const rest = externalReference.slice(MENTORSHIP_MP_PREFIX.length);
  // planId (24 hex) - interval - optional -r suffix
  const match = rest.match(/^([a-f0-9]{24})-(mensual|anual|trimestral)(?:-r.+)?$/i);
  if (!match) return { planId: null, interval: null };

  return {
    planId: match[1],
    interval: match[2].toLowerCase(),
  };
}
