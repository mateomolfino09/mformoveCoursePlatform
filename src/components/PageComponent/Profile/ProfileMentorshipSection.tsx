'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from '../../../hooks/useToast';
import {
  canCancelMentorshipStripe,
  canRenewMentorship,
  hasActiveMentorship,
  hasMentorshipRecord,
  mentorshipIntervalDisplay,
  mentorshipProviderLabel,
  mentorshipRenewPath,
  mentorshipStatusLabel,
  type UserMentorship,
} from '../../../lib/mentorshipUser';
import { formatMentorshipAmount, mentorshipCurrencySymbol } from '../../../lib/mentorshipPricing';

function formatDate(value?: string | Date) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatAmount(mentorship: UserMentorship) {
  if (mentorship.amount == null) return '—';
  const sym = mentorshipCurrencySymbol(mentorship.moneda || 'USD');
  return `${sym} ${formatMentorshipAmount(mentorship.amount)}`;
}

export default function ProfileMentorshipSection({
  itemVariants,
}: {
  itemVariants: Variants;
}) {
  const auth = useAuth();
  const mentorship = auth.user?.mentorship as UserMentorship | undefined;
  const [cancelLoading, setCancelLoading] = useState(false);

  if (!hasMentorshipRecord(auth.user)) {
    return null;
  }

  const active = hasActiveMentorship(auth.user);
  const showCancel = canCancelMentorshipStripe(mentorship);
  const showRenew = canRenewMentorship(mentorship);
  const renewHref = mentorshipRenewPath(mentorship?.interval);

  const handleCancel = async () => {
    const confirmed = window.confirm(
      '¿Cancelar la renovación automática? Vas a mantener la mentoría hasta el fin del período que ya pagaste.',
    );
    if (!confirmed) return;

    setCancelLoading(true);
    try {
      const res = await fetch('/api/payments/mentorship/cancel', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo cancelar la mentoría');
      }
      toast.success(data.message || 'Cancelación programada');
      await auth.fetchUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cancelar');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <motion.div
      id="mentoria"
      variants={itemVariants}
      className="bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(20,20,17,0.06)] transition-shadow duration-300 hover:border-palette-stone/40"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2.5 bg-palette-sage/15 border border-palette-stone/30 rounded-xl">
          <SparklesIcon className="h-6 w-6 text-palette-sage" />
        </div>
        <div>
          <h2 className="font-montserrat text-xl font-semibold tracking-tight text-palette-ink md:text-2xl">
            Mentoría 1:1
          </h2>
          <p className="text-sm font-light text-palette-stone">
            {active ? 'Acompañamiento activo' : 'Historial de mentoría'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone">Plan</p>
            <p className="mt-1 text-base font-medium text-palette-ink">
              {mentorship?.planName || 'Mentoría'}
            </p>
          </div>
          <div>
            <p className="font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone">Estado</p>
            <p className="mt-1 text-base font-medium text-palette-ink">
              {mentorshipStatusLabel(mentorship?.status)}
            </p>
          </div>
          <div>
            <p className="font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone">Modalidad</p>
            <p className="mt-1 text-base font-light text-palette-ink">
              {mentorshipIntervalDisplay(mentorship?.interval)}
            </p>
          </div>
          <div>
            <p className="font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone">Pago</p>
            <p className="mt-1 text-base font-light text-palette-ink">
              {formatAmount(mentorship || {})}
              {mentorship?.moneda ? ` · ${mentorshipProviderLabel(mentorship.provider)}` : ''}
            </p>
          </div>
          <div>
            <p className="font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone">Inicio</p>
            <p className="mt-1 text-base font-light text-palette-ink">
              {formatDate(mentorship?.startDate)}
            </p>
          </div>
          <div>
            <p className="font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone">
              Último cobro
            </p>
            <p className="mt-1 text-base font-light text-palette-ink">
              {formatDate(mentorship?.lastPaymentDate)}
            </p>
          </div>
        </div>

        {mentorship?.provider === 'dlocalgo' && active ? (
          <p className="rounded-xl border border-palette-stone/20 bg-white/50 px-4 py-3 text-sm font-light leading-relaxed text-palette-stone">
            Con dLocal cada ciclo se abona por separado. Para el próximo mes o ciclo, usá{' '}
            <strong className="font-medium text-palette-ink">Renovar plan</strong> cuando corresponda.
          </p>
        ) : null}

        {String(mentorship?.status || '').toLowerCase() === 'cancel_at_period_end' ? (
          <p className="rounded-xl border border-palette-stone/20 bg-palette-sage/10 px-4 py-3 text-sm font-light leading-relaxed text-palette-stone">
            Cancelaste la renovación automática. La mentoría sigue activa hasta el fin del período pagado.
          </p>
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
          {showRenew ? (
            <Link
              href={renewHref}
              className="inline-flex items-center justify-center rounded-full border-2 border-palette-sage bg-palette-sage px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-palette-ink transition-colors hover:border-palette-steel hover:bg-palette-steel"
            >
              {active ? 'Renovar plan' : 'Volver a contratar mentoría'}
            </Link>
          ) : null}

          {showCancel ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelLoading}
              className="inline-flex items-center justify-center rounded-full border border-palette-stone/35 bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-palette-ink transition-colors hover:border-red-300 hover:text-red-700 disabled:opacity-60"
            >
              {cancelLoading ? 'Cancelando…' : 'Cancelar renovación (Stripe)'}
            </button>
          ) : null}

          <Link
            href="/mentoria"
            className="inline-flex items-center justify-center text-sm font-medium text-palette-ink underline underline-offset-2 hover:text-palette-ink/75"
          >
            Ver landing de mentoría
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
