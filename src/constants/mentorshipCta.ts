import { routes } from './routes';
import type { MentorshipBillingInterval } from '../lib/mentorshipPricing';

/** CTA principal: aplicación / consulta (relación antes que transacción). */
export const MENTORSHIP_APPLY_CTA = {
  label: 'Aplicar a mentoría',
  href: routes.navegation.mentorshipConsulta,
} as const;

/** CTA de pago directo: solo planes y checkout para quien ya decidió. */
export const MENTORSHIP_START_CTA = {
  label: 'Empezar mentoría',
  href: (interval: MentorshipBillingInterval = 'mensual') =>
    `/mentoria/empezar?interval=${interval}`,
} as const;

export const MENTORSHIP_LANDING_CTA = {
  label: 'Conocer mentoría',
  href: routes.navegation.mentorship,
} as const;
