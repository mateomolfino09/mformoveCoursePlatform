'use client';

import { CheckIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSnapshot } from 'valtio';
import imageLoader from '../../../../imageLoader';
import { useAuth } from '../../../hooks/useAuth';
import { useDetectedCountry } from '../../../hooks/useDetectedCountry';
import { toast } from '../../../hooks/useToast';
import state from '../../../valtio';
import { MentorshipPlanPagoOption } from '../../../types/mentorship';
import { MentorshipCheckoutPayload } from '../../../hooks/useMentorshipEmpezarBootstrap';
import {
  formatMentorshipAmount,
  mentorshipBillingShortLabel,
  mentorshipCommitmentSummary,
  mentorshipCurrencySymbol,
  mentorshipIntervalLabel,
  mentorshipMonthlyEquivalent,
  type MentorshipBillingInterval,
} from '../../../lib/mentorshipPricing';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import { saveMentorshipDlocalPending } from '../../../lib/mentorshipDlocalPendingStorage';
import { saveRedirectUrl } from '../../../utils/redirectQueue';
import type { DlocalLocalizedAmount } from '../../../lib/dlocalLocalCurrency';
import dynamic from 'next/dynamic';
import {
  resolveProveedoresHabilitados,
  type PaymentProveedor,
} from '../../../constants/paymentProveedores';
import { scrollMercadoPagoPanelIntoView } from '../../../lib/scrollMercadoPagoPanel';
import MentorshipAnnualGiftProductsList from './MentorshipAnnualGiftProductsList';
import MentorshipPlanIncludesList from './MentorshipPlanIncludesList';

const MercadoPagoPaymentBrick = dynamic(
  () => import('../Payments/MercadoPagoPaymentBrick'),
  { ssr: false }
);

type PaymentMethodId = 'stripe' | 'dlocalgo' | 'mercadopago';

type DlocalQuoteResponse = DlocalLocalizedAmount & {
  payerCountry?: string;
  localized?: boolean;
};

type MentorshipCheckoutStartProps = {
  payload: MentorshipCheckoutPayload;
};

const formatPrice = (currency: string, amount: number) => {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

export default function MentorshipCheckoutStart({ payload }: MentorshipCheckoutStartProps) {
  const auth = useAuth();
  const router = useRouter();
  const snap = useSnapshot(state);
  const { dlocalCountryLabel: geoCountryLabel } = useDetectedCountry();
  const [loadingMethod, setLoadingMethod] = useState<PaymentMethodId | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId | null>(null);
  const [dlocalQuote, setDlocalQuote] = useState<DlocalQuoteResponse | null>(null);
  const [dlocalQuoteLoading, setDlocalQuoteLoading] = useState(false);
  const [mpPreferenceId, setMpPreferenceId] = useState<string | null>(null);
  const [mpBrickAmount, setMpBrickAmount] = useState<number | null>(null);
  const [mpBrickLoading, setMpBrickLoading] = useState(false);
  const mpPanelRef = useRef<HTMLDivElement | null>(null);

  const selectPaymentMethod = useCallback((methodId: PaymentMethodId) => {
    setSelectedMethod(methodId);
  }, []);

  useEffect(() => {
    if (selectedMethod !== 'mercadopago') return;
    // El panel se monta al seleccionar MP; scrollear cuando ya está en el DOM
    const id = window.setTimeout(() => {
      scrollMercadoPagoPanelIntoView(mpPanelRef.current);
    }, 50);
    return () => window.clearTimeout(id);
  }, [selectedMethod, mpBrickLoading]);

  const { plan, interval, availableIntervals, price, opcionesPago } = payload;
  const profileCountry = (auth.user as { country?: string } | null)?.country?.trim() || '';

  const stripePlan = opcionesPago.find((p) => p.proveedor === 'stripe');
  const dlocalPlan = opcionesPago.find((p) => p.proveedor === 'dlocalgo');
  const mercadoPagoPlan = opcionesPago.find((p) => p.proveedor === 'mercadopago');
  const displayPrice =
    stripePlan ||
    dlocalPlan ||
    mercadoPagoPlan ||
    opcionesPago[0] || {
      monto: price.price,
      moneda: price.currency,
    };
  const stripeCheckoutAvailable = Boolean(
    (stripePlan?.activo && stripePlan?.paymentLink) || price.stripePriceId,
  );
  const monthlyEquivalent = mentorshipMonthlyEquivalent(price.price, interval);
  const sym = mentorshipCurrencySymbol(price.currency);

  useEffect(() => {
    if (!displayPrice?.monto) {
      setDlocalQuote(null);
      return;
    }

    let cancelled = false;
    setDlocalQuoteLoading(true);
    const params = new URLSearchParams({
      amount: String(displayPrice.monto),
      currency: displayPrice.moneda || 'USD',
    });
    if (profileCountry) params.set('country', profileCountry);

    fetch(`/api/payments/course/dlocal-quote?${params.toString()}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DlocalQuoteResponse | null) => {
        if (!cancelled) setDlocalQuote(data?.localized ? data : null);
      })
      .catch(() => {
        if (!cancelled) setDlocalQuote(null);
      })
      .finally(() => {
        if (!cancelled) setDlocalQuoteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [displayPrice?.monto, displayPrice?.moneda, profileCountry]);

  const enabledProviders = useMemo(() => {
    if (plan.proveedoresHabilitados?.length) {
      return resolveProveedoresHabilitados(plan.proveedoresHabilitados);
    }
    // Planes nuevos con MP pero sin campo guardado: no mostrar dLocal residual.
    if (opcionesPago.some((o) => o.proveedor === 'mercadopago')) {
      return resolveProveedoresHabilitados(['stripe', 'mercadopago']);
    }
    return resolveProveedoresHabilitados(null);
  }, [opcionesPago, plan.proveedoresHabilitados]);

  const paymentMethods = useMemo(
    () =>
      (
        [
          {
            id: 'stripe' as const,
            title: 'Stripe',
            subtitle: 'Pagos internacionales',
            description:
              stripePlan?.descripcion ||
              'Suscripción con tarjetas internacionales, Apple Pay y Google Pay.',
            available: stripeCheckoutAvailable,
            plan: stripePlan,
          },
          {
            id: 'mercadopago' as const,
            title: 'Mercado Pago',
            subtitle: 'Checkout Bricks · Hasta 12 cuotas',
            description:
              mercadoPagoPlan?.descripcion ||
              'Completá el pago con Mercado Pago. Hasta 12 cuotas en tarjeta.',
            available: Boolean(mercadoPagoPlan && mercadoPagoPlan.activo !== false),
            plan: mercadoPagoPlan,
          },
          {
            id: 'dlocalgo' as const,
            title: 'dLocal GO',
            subtitle: 'Pagos locales · Hasta 12 cuotas',
            description:
              dlocalPlan?.descripcion ||
              'Pago del ciclo en moneda local con cuotas en tarjeta.',
            available: Boolean(dlocalPlan && dlocalPlan.activo !== false),
            plan: dlocalPlan,
          },
        ] as const
      ).filter(
        (method) =>
          enabledProviders.includes(method.id as PaymentProveedor) && method.available,
      ),
    [
      dlocalPlan,
      enabledProviders,
      mercadoPagoPlan,
      stripeCheckoutAvailable,
      stripePlan,
    ],
  );

  useEffect(() => {
    const first = paymentMethods.find((m) => m.available);
    if (first) setSelectedMethod(first.id);
  }, [paymentMethods]);

  useEffect(() => {
    if (!auth.user) auth.fetchUser();
  }, [auth.user, auth]);

  useEffect(() => {
    if (!snap.loginForm && loadingMethod && !auth.user) {
      setLoadingMethod(null);
    }
  }, [snap.loginForm, loadingMethod, auth.user]);

  const checkoutPriceLabel = useMemo(() => {
    if (selectedMethod === 'dlocalgo' && dlocalQuote?.localized) {
      return formatPrice(dlocalQuote.currency, dlocalQuote.amount);
    }
    if (selectedMethod === 'mercadopago' && mpBrickAmount) {
      const amount = formatMentorshipAmount(mpBrickAmount);
      if (interval === 'mensual') return `$ ${amount} UYU/mes`;
      if (interval === 'trimestral') return `$ ${amount} UYU cada 3 meses`;
      return `$ ${amount} UYU al año`;
    }
    return mentorshipBillingShortLabel(price.price, price.currency, interval);
  }, [
    dlocalQuote,
    interval,
    mpBrickAmount,
    price.currency,
    price.price,
    selectedMethod,
  ]);

  const executeDlocalCheckout = useCallback(async () => {
    setLoadingMethod('dlocalgo');
    try {
      const res = await fetch('/api/payments/mentorship/dlocal-checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan._id,
          interval,
          country: profileCountry || geoCountryLabel || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.redirectUrl) {
        throw new Error(data.error || 'No se pudo abrir el checkout de dLocal');
      }

      saveMentorshipDlocalPending({
        orderId: data.orderId,
        paymentId: data.paymentId,
        planId: plan._id,
        interval,
        userId: auth.user?._id != null ? String(auth.user._id) : undefined,
      });

      window.location.href = data.redirectUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al iniciar el pago');
      setLoadingMethod(null);
    }
  }, [auth.user, geoCountryLabel, interval, plan._id, profileCountry]);

  const executeMercadoPagoCheckout = useCallback(async () => {
    setMpBrickLoading(true);
    try {
      const res = await fetch('/api/payments/mentorship/mercadopago-checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan._id,
          interval,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.preferenceId) {
        throw new Error(data.error || 'No se pudo iniciar Mercado Pago');
      }
      setMpPreferenceId(String(data.preferenceId));
      setMpBrickAmount(Number(data.amount) > 0 ? Number(data.amount) : null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al iniciar el pago');
      setMpPreferenceId(null);
      setMpBrickAmount(null);
    } finally {
      setMpBrickLoading(false);
      setLoadingMethod(null);
    }
  }, [interval, plan._id]);

  useEffect(() => {
    if (selectedMethod !== 'mercadopago') {
      setMpPreferenceId(null);
      setMpBrickAmount(null);
      return;
    }
    if (!auth.user) return;
    executeMercadoPagoCheckout().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMethod, auth.user?._id, plan._id, interval]);

  const executeStripeCheckout = useCallback(async () => {
    setLoadingMethod('stripe');
    try {
      const res = await fetch('/api/mentorship/stripe/createCheckoutSession', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan._id,
          interval,
          userEmail: auth.user?.email,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'No se pudo abrir el checkout de Stripe');
      }
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al iniciar el pago');
      setLoadingMethod(null);
    }
  }, [auth.user?.email, interval, plan._id]);

  const executePaymentLink = useCallback(
    (methodId: PaymentMethodId, paymentLink?: string) => {
      if (methodId === 'dlocalgo') {
        executeDlocalCheckout();
        return;
      }
      if (methodId === 'mercadopago') {
        if (!auth.user) {
          if (typeof window !== 'undefined') {
            saveRedirectUrl(`${window.location.pathname}${window.location.search}`);
          }
          state.authModalMode = 'register';
          state.loginForm = true;
          return;
        }
        executeMercadoPagoCheckout();
        return;
      }
      const link = paymentLink || stripePlan?.paymentLink;
      if (!link) {
        if (price.stripePriceId) {
          executeStripeCheckout();
          return;
        }
        toast.error('Este plan no tiene link de pago disponible');
        setLoadingMethod(null);
        return;
      }
      setLoadingMethod(methodId);
      window.location.href = link;
    },
    [
      auth.user,
      executeDlocalCheckout,
      executeMercadoPagoCheckout,
      executeStripeCheckout,
      price.stripePriceId,
      stripePlan?.paymentLink,
    ],
  );

  const handleContinue = () => {
    if (!selectedMethod) {
      toast.error('Elegí un método de pago para continuar');
      return;
    }
    const method = paymentMethods.find((m) => m.id === selectedMethod);
    if (!method?.available) {
      toast.error('Este método de pago no está disponible');
      return;
    }

    setLoadingMethod(selectedMethod);

    if (!auth.user) {
      if (typeof window !== 'undefined') {
        saveRedirectUrl(`${window.location.pathname}${window.location.search}`);
      }
      state.authModalMode = 'register';
      state.loginForm = true;
      return;
    }

    executePaymentLink(selectedMethod, method.plan?.paymentLink);
  };

  const switchInterval = (next: MentorshipBillingInterval) => {
    router.push(`/mentoria/empezar?interval=${next}`);
  };

  return (
    <section className="relative min-h-screen bg-palette-cream font-montserrat text-palette-ink">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-8 px-0 pb-16 pt-28 md:grid-cols-2 md:items-start md:gap-12 md:px-10 md:pb-20 md:pt-32 lg:gap-16 lg:px-14">
        <div className="order-2 px-5 md:order-1 md:sticky md:top-28 md:self-start md:px-0">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-palette-stone">
            Mentoría 1:1
          </p>
          <h1 className="mb-4 font-montserrat text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em]">
            {plan.name}
          </h1>

          {availableIntervals.length > 1 ? (
            <div className="mb-6 inline-flex rounded-full border border-palette-stone/25 bg-white/60 p-1">
              {availableIntervals.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => switchInterval(item)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    interval === item
                      ? 'bg-palette-ink text-palette-cream shadow-md'
                      : 'text-palette-stone hover:text-palette-ink'
                  }`}
                >
                  {item === 'mensual' ? 'Mensual' : item === 'trimestral' ? 'Trimestral' : 'Anual'}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mb-6">
            <p className="text-lg font-semibold text-palette-ink md:text-xl">{checkoutPriceLabel}</p>
            {interval !== 'mensual' ? (
              <p className="mt-1 text-sm text-palette-stone">
                Equivale a ~{sym} {formatMentorshipAmount(monthlyEquivalent)}/mes
              </p>
            ) : (
              <p className="mt-1 text-sm text-palette-stone">{mentorshipCommitmentSummary(interval)}</p>
            )}
            {selectedMethod === 'dlocalgo' && dlocalQuoteLoading ? (
              <p className="mt-1 text-sm text-palette-stone">Calculando precio en moneda local…</p>
            ) : null}
          </div>

          <p className="mb-6 max-w-xl text-base leading-relaxed text-palette-stone">
            Elegí cómo querés pagar. Mercado Pago se completa acá mismo (hasta 12 cuotas). Stripe es
            para pagos internacionales; dLocal es opcional si está habilitado.
          </p>

          <div className="space-y-2" role="radiogroup" aria-label="Métodos de pago">
            {paymentMethods.map((method) => {
              const isSelected = selectedMethod === method.id;
              const isDisabled = !method.available;
              return (
                <label
                  key={method.id}
                  className={`block rounded-2xl border px-4 py-3 transition-colors ${
                    isDisabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer'
                  } ${
                    isSelected
                      ? 'border-palette-ink/30 bg-palette-ink/[0.06]'
                      : 'border-transparent hover:border-palette-stone/15'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="mentorship-payment"
                      value={method.id}
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => selectPaymentMethod(method.id)}
                      className="sr-only"
                    />
                    <span
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected ? 'border-palette-ink bg-palette-ink' : 'border-palette-stone/35'
                      }`}
                    >
                      {isSelected ? <CheckIcon className="h-3 w-3 text-palette-cream" /> : null}
                    </span>
                    <div>
                      <p className="font-semibold text-palette-ink">{method.title}</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-palette-stone">
                        {method.subtitle}
                      </p>
                      <p className="mt-1 text-sm text-palette-stone">{method.description}</p>
                      {isDisabled ? (
                        <p className="mt-1 text-xs text-red-600">No disponible en este momento</p>
                      ) : null}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {selectedMethod === 'mercadopago' && !auth.user ? (
            <button
              type="button"
              onClick={handleContinue}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-palette-ink bg-palette-ink px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-palette-cream transition-colors hover:bg-palette-stone hover:text-palette-ink md:w-auto"
            >
              Iniciar sesión para pagar
            </button>
          ) : selectedMethod !== 'mercadopago' ? (
            <button
              type="button"
              onClick={handleContinue}
              disabled={Boolean(loadingMethod)}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 bg-palette-ink px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-palette-cream transition-colors hover:bg-palette-sage hover:text-palette-ink disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
            >
              {loadingMethod ? (
                <>
                  <MiniLoadingSpinner />
                  Procesando…
                </>
              ) : (
                'Continuar al pago'
              )}
            </button>
          ) : null}

          {selectedMethod === 'dlocalgo' ? (
            <p className="mt-4 text-xs font-light leading-relaxed text-palette-stone">
              Si después del pago dLocal no te devuelve a la web, abrí{' '}
              <Link
                href="/mentoria/completar-pago"
                className="font-medium text-palette-ink underline underline-offset-2"
              >
                completar pago
              </Link>
              . El webhook puede activar la mentoría igual; esa página te lleva al éxito.
            </p>
          ) : null}
        </div>

        <div className="order-1 md:order-2">
          {selectedMethod === 'mercadopago' ? (
            <div
              ref={mpPanelRef}
              id="mercadopago-checkout-panel"
              className="scroll-mt-28 overflow-hidden rounded-none border-0 bg-white shadow-none md:rounded-3xl md:border md:border-palette-stone/20 md:shadow-[0_20px_50px_-24px_rgba(20,20,17,0.16)]"
            >
              <div className="border-b border-palette-stone/10 px-5 py-4 md:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-stone">
                  Mercado Pago
                </p>
                <h2 className="mt-1 text-lg font-semibold text-palette-ink">
                  Completá tu pago
                </h2>
                <p className="mt-1 text-sm text-palette-stone">
                  Hasta 12 cuotas · Checkout Bricks
                </p>
              </div>
              <div className="md:p-6">
                {!auth.user ? (
                  <p className="text-sm text-palette-stone">
                    Iniciá sesión a la izquierda para cargar el formulario de pago.
                  </p>
                ) : mpBrickLoading ? (
                  <div className="flex min-h-[16rem] items-center justify-center gap-2 text-sm text-palette-stone">
                    <MiniLoadingSpinner />
                    Preparando formulario…
                  </div>
                ) : mpPreferenceId && mpBrickAmount ? (
                  <MercadoPagoPaymentBrick
                    amount={mpBrickAmount}
                    preferenceId={mpPreferenceId}
                    payerEmail={auth.user?.email || null}
                    processUrl="/api/payments/mentorship/mercadopago-process"
                    processBody={{
                      planId: plan._id,
                      interval,
                    }}
                    onPaymentApproved={({ redirectUrl, paymentId }) => {
                      if (redirectUrl) {
                        window.location.href = redirectUrl;
                        return;
                      }
                      window.location.href = `/mentoria/exito?plan_id=${plan._id}&interval=${interval}&provider=mercadopago&payment_id=${paymentId}`;
                    }}
                  />
                ) : (
                  <p className="text-sm text-palette-stone">
                    No pudimos cargar el formulario. Probá de nuevo.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-none border-0 bg-white/70 shadow-none md:rounded-3xl md:border md:border-palette-stone/20 md:shadow-[0_20px_50px_-24px_rgba(20,20,17,0.16)]">
              <div className="relative aspect-[4/3] bg-palette-ink/5">
                <CldImage
                  src="my_uploads/plaza/DSC03350_vgjrrh"
                  alt="Mentoría con Mateo Molfino"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-[center_42%]"
                  loader={imageLoader}
                  preserveTransformations
                />
              </div>
              {interval === 'anual' ? (
                <div className="border-b border-palette-stone/10 px-6 py-5 md:px-8 md:py-6">
                  <p className="mb-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-stone">
                    Con el plan anual
                  </p>
                  <MentorshipAnnualGiftProductsList tone="light" />
                </div>
              ) : null}
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-semibold text-palette-ink">Qué incluye</h2>
                <div className="mt-4">
                  <MentorshipPlanIncludesList interval={interval} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
