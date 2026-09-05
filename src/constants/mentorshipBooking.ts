/** Cal.com — consulta inicial de mentoría (30 min). */
export const MENTORSHIP_BOOKING_URL = 'https://cal.com/mateo-move/30min';

/** URL de agendamiento; permite override opcional por env. */
export function resolveMentorshipBookingUrl(): string {
  return process.env.NEXT_PUBLIC_MENTORSHIP_BOOKING_URL || MENTORSHIP_BOOKING_URL;
}
