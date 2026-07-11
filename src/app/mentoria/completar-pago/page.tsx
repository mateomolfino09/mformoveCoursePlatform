'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MiniLoadingSpinner } from '../../../components/PageComponent/Products/MiniSpinner';
import {
  clearMentorshipDlocalPending,
  readMentorshipDlocalPending,
} from '../../../lib/mentorshipDlocalPendingStorage';

export default function MentorshipCompletarPagoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Verificando tu pago…');
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const fromUrl = {
      orderId: searchParams.get('order_id')?.trim() || undefined,
      paymentId: searchParams.get('payment_id')?.trim() || undefined,
      userId: searchParams.get('external_id')?.trim() || undefined,
      planId: searchParams.get('plan_id')?.trim() || undefined,
      interval: searchParams.get('interval')?.trim() || undefined,
    };

    if (fromUrl.orderId || fromUrl.paymentId) return fromUrl;

    return readMentorshipDlocalPending();
  }, [searchParams]);

  useEffect(() => {
    if (!query?.orderId && !query?.paymentId) {
      setError('No encontramos un pago pendiente. Volvé a empezar el checkout.');
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 45;

    const poll = async () => {
      attempts += 1;
      const params = new URLSearchParams();
      if (query.orderId) params.set('order_id', query.orderId);
      if (query.paymentId) params.set('payment_id', query.paymentId);
      if (query.userId) params.set('external_id', query.userId);

      try {
        const res = await fetch(`/api/payments/mentorship/dlocal-status?${params.toString()}`, {
          cache: 'no-store',
        });
        const data = await res.json().catch(() => ({}));

        if (cancelled) return;

        if (data.paid && data.redirectUrl) {
          setMessage('Pago confirmado. Redirigiendo…');
          try {
            clearMentorshipDlocalPending();
          } catch {
            /* ignore */
          }
          router.replace(data.redirectUrl);
          return;
        }

        if (data.status && !data.paid) {
          setMessage(`Estado del pago: ${data.status}. Esperando confirmación…`);
        } else {
          setMessage('Esperando confirmación del pago…');
        }

        if (attempts >= maxAttempts) {
          setError(
            'El pago puede estar procesado pero dLocal no redirigió. Si ves 3ds_status=success en la URL de dLocal, abrí el enlace de abajo.',
          );
          return;
        }

        window.setTimeout(poll, 2000);
      } catch {
        if (!cancelled && attempts < maxAttempts) {
          window.setTimeout(poll, 3000);
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [query, router]);

  const manualExitoHref =
    query?.planId && query?.interval
      ? `/mentoria/exito?plan_id=${encodeURIComponent(query.planId)}&interval=${encodeURIComponent(query.interval)}&provider=dlocalgo${query.userId ? `&external_id=${encodeURIComponent(query.userId)}` : ''}${query.orderId ? `&order_id=${encodeURIComponent(query.orderId)}` : ''}${query.paymentId ? `&payment_id=${encodeURIComponent(query.paymentId)}` : ''}`
      : null;

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-16 font-montserrat">
      <div className="w-full max-w-lg rounded-3xl border border-palette-stone/20 bg-palette-cream p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-palette-ink md:text-2xl">Completar mentoría</h1>
        <p className="mt-3 text-sm font-light leading-relaxed text-palette-stone">
          Si quedaste en la página de dLocal después del pago, acá verificamos el estado y te llevamos
          al éxito.
        </p>

        {!error ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-palette-stone">
            <MiniLoadingSpinner />
            <span>{message}</span>
          </div>
        ) : (
          <p className="mt-6 text-sm text-amber-900">{error}</p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {manualExitoHref ? (
            <Link
              href={manualExitoHref}
              className="inline-flex items-center justify-center rounded-full border-2 border-palette-ink bg-palette-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-palette-cream hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink"
            >
              Ir a página de éxito
            </Link>
          ) : null}
          <Link
            href="/mentoria/empezar?interval=mensual"
            className="text-sm font-medium text-palette-sage underline underline-offset-4"
          >
            Volver al checkout
          </Link>
        </div>
      </div>
    </section>
  );
}
