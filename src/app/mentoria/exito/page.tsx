'use client'
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import imageLoader from '../../../../imageLoader';
import { useAuth } from '../../../hooks/useAuth';

const EXITO_BG = 'my_uploads/plaza/DSC03350_vgjrrh';

function ExitoBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <CldImage
        src={EXITO_BG}
        alt=""
        fill
        sizes="100vw"
        priority
        className="object-cover object-[center_42%]"
        loader={imageLoader}
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-palette-cream/88 via-palette-cream/72 to-palette-ink/35"
        aria-hidden
      />
      <div className="absolute inset-0 bg-palette-cream/20" aria-hidden />
    </div>
  );
}

export default function MentorshipSuccessPage() {
  const searchParams = useSearchParams();
  const auth = useAuth();
  const fulfillRequested = useRef(false);
  const planId = searchParams.get('plan_id');
  const interval = searchParams.get('interval');
  const provider = searchParams.get('provider');
  const externalId = searchParams.get('external_id');
  const paymentId =
    searchParams.get('payment_id')?.trim() ||
    searchParams.get('collection_id')?.trim() ||
    searchParams.get('paymentId')?.trim() ||
    searchParams.get('id')?.trim() ||
    undefined;
  const orderIdParam = searchParams.get('order_id')?.trim() || undefined;
  const sessionId = searchParams.get('session_id')?.trim() || undefined;
  const [planDetails, setPlanDetails] = useState<any>(null);

  useEffect(() => {
    if (!auth.user) auth.fetchUser();
  }, [auth.user, auth]);

  useEffect(() => {
    if (!planId || !interval || !provider || fulfillRequested.current) return;

    const isDlocal = provider === 'dlocalgo';
    const isMercadoPago = provider === 'mercadopago';
    const isStripe = provider === 'stripe';

    if (isStripe && !sessionId) return;
    if (isMercadoPago && !paymentId) return;

    const dedupeKey = `mentorship-complete:${planId}:${interval}:${provider}:${paymentId || sessionId || externalId || 'pending'}`;
    try {
      if (sessionStorage.getItem(dedupeKey)) return;
    } catch {
      /* ignore */
    }

    fulfillRequested.current = true;

    const userId =
      externalId?.trim() ||
      (auth.user?._id != null ? String(auth.user._id) : undefined);

    const resolvedProvider = isDlocal
      ? 'dlocalgo'
      : isMercadoPago
        ? 'mercadopago'
        : 'stripe';

    fetch('/api/payments/mentorship/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        provider: resolvedProvider,
        planId,
        interval,
        ...(userId ? { userId } : {}),
        ...(paymentId ? { paymentId } : {}),
        ...(orderIdParam ? { orderId: orderIdParam } : {}),
        ...(sessionId ? { sessionId } : {}),
        ...(searchParams.get('external_reference')
          ? { externalReference: searchParams.get('external_reference') }
          : {}),
      }),
    })
      .then(async (res) => {
        if (res.ok || res.status === 409) {
          try {
            sessionStorage.setItem(dedupeKey, '1');
          } catch {
            /* ignore */
          }
          if (auth.user) auth.fetchUser();
        } else {
          fulfillRequested.current = false;
        }
      })
      .catch(() => {
        fulfillRequested.current = false;
      });
  }, [auth.user?._id, externalId, interval, orderIdParam, paymentId, planId, provider, sessionId]);

  useEffect(() => {
    if (planId) {
      fetchPlanDetails(planId);
    }
  }, [planId]);

  const fetchPlanDetails = async (planId: string) => {
    try {
      const response = await fetch(`/api/payments/plans/${planId}?type=mentorship`);
      if (response.ok) {
        const data = await response.json();
        setPlanDetails(data);
      }
    } catch (error) {
      console.error('Error fetching plan details:', error);
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'explorer':
        return 'Explorador';
      case 'practitioner':
        return 'Practicante';
      case 'student':
        return 'Estudiante';
      default:
        return 'Básico';
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 font-montserrat">
      <ExitoBackdrop />
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 max-w-2xl w-full"
      >
        <div className="relative overflow-hidden rounded-3xl border border-palette-stone/20 bg-palette-cream p-8 text-center shadow-[0_10px_40px_rgba(20,20,17,0.12)]">
          <div className="pointer-events-none absolute -top-24 -right-16 h-48 w-48 rounded-full bg-palette-stone/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-palette-sage/10 blur-3xl" />
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-palette-sage/90 text-palette-cream shadow-[0_8px_28px_rgba(20,20,17,0.12)] ring-2 ring-palette-sage/35"
          >
            <CheckCircleIcon className="h-12 w-12" />
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative text-3xl font-semibold tracking-tight text-palette-ink md:text-4xl"
          >
            ¡Bienvenido a tu mentoría!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="relative mt-4 text-base font-light leading-relaxed text-palette-stone md:text-lg"
          >
            Tu pago se procesó correctamente. En las próximas horas vas a recibir los siguientes pasos por correo.
          </motion.p>

          {/* Plan Details */}
          {planDetails && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              className="relative mt-8 rounded-2xl border border-palette-stone/15 bg-white p-6 text-left"
            >
              <p className="text-xs font-montserrat uppercase tracking-[0.22em] text-palette-stone/75">Tu plan</p>
              <h3 className="mt-2 text-xl font-semibold text-palette-ink md:text-2xl">
                Plan {getLevelLabel(planDetails.level)}
              </h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-palette-stone">{planDetails.description}</p>
              <div className="mt-5 text-2xl font-semibold tracking-tight text-palette-ink md:text-3xl">
                ${planDetails.price}
                <span className="text-base font-light text-palette-stone">/{planDetails.interval}</span>
              </div>
            </motion.div>
          )}

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44 }}
            className="relative mt-8 space-y-4 text-left"
          >
            <h3 className="text-lg font-semibold text-palette-ink md:text-xl">Próximos pasos</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-palette-ink text-xs font-semibold text-palette-cream">
                  1
                </div>
                <p className="text-sm font-light leading-relaxed text-palette-stone md:text-base">
                  Vas a recibir un email de bienvenida con los detalles en las próximas 24 horas.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-palette-ink text-xs font-semibold text-palette-cream">
                  2
                </div>
                <p className="text-sm font-light leading-relaxed text-palette-stone md:text-base">
                  Coordinamos tu primera sesión para alinear objetivos y seguimiento.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-palette-ink text-xs font-semibold text-palette-cream">
                  3
                </div>
                <p className="text-sm font-light leading-relaxed text-palette-stone md:text-base">
                  Explorá el contenido exclusivo desde tu cuenta cuando quieras.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52 }}
            className="relative mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              href="/cuenta"
              className="inline-flex items-center justify-center rounded-full border-2 border-palette-ink bg-palette-ink px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-palette-cream transition-all duration-200 hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink"
            >
              Ir a mi cuenta
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-palette-stone/25 bg-white px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-palette-ink transition-all duration-200 hover:border-palette-stone/45 hover:bg-palette-cream"
            >
              Volver al inicio
            </Link>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="relative mt-8 border-t border-palette-stone/20 pt-8"
          >
            <p className="text-sm font-light text-palette-stone">
              ¿Dudas? Escribinos a{' '}
              <a href="mailto:soporte@mateomove.com" className="font-medium text-palette-sage underline decoration-palette-sage/40 underline-offset-4 hover:text-palette-ink">
                soporte@mateomove.com
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 