'use client';

import { CheckIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { CldImage } from 'next-cloudinary';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import imageLoader from '../../../../imageLoader';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from '../../../hooks/useToast';
import state from '../../../valtio';
import { CursoClaseContenido, CursoPlanPago } from '../../../types/cursoLanding';
import { formatTitleCaseWords } from '../../../lib/formatDisplayTitle';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import { useCursoLanding } from './CursoLandingContext';
import {
  getAndClearCourseCheckoutIntent,
  saveCourseCheckoutIntent,
  saveRedirectUrl,
  type CourseCheckoutIntent,
} from '../../../utils/redirectQueue';
import { savePendingPreventaRedemption } from '../../../utils/cursoPreventaCheckoutStorage';

type CourseCheckoutStartProps = {
  checkoutPlans: CursoPlanPago[];
  checkoutImagePublicId?: string;
  productId?: string;
  pricingModo?: 'preventa' | 'lanzamiento';
  preventaTierIndex?: number | null;
};

type PaymentMethodId = 'stripe' | 'dlocalgo' | 'transferencia';

const TRANSFER_EMAIL_COOLDOWN_MS = 30_000;

function transferCooldownStorageKey(slug: string) {
  return `course-transfer-email-until:${slug}`;
}

function readStoredTransferCooldown(slug: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = sessionStorage.getItem(transferCooldownStorageKey(slug));
    const until = Number(raw);
    return Number.isFinite(until) && until > Date.now() ? until : 0;
  } catch {
    return 0;
  }
}

function writeStoredTransferCooldown(slug: string, untilMs: number) {
  try {
    sessionStorage.setItem(transferCooldownStorageKey(slug), String(untilMs));
  } catch {
    /* ignore quota / private mode */
  }
}

function clearStoredTransferCooldown(slug: string) {
  try {
    sessionStorage.removeItem(transferCooldownStorageKey(slug));
  } catch {
    /* ignore */
  }
}

type PaymentMethodOption = {
  id: PaymentMethodId;
  title: string;
  subtitle: string;
  description: string;
  methods: string[];
  plan?: CursoPlanPago;
  available: boolean;
  unavailableLabel: string;
};

const getClaseDisplayName = (clase: CursoClaseContenido) =>
  String(clase.name || clase.titulo || '').trim() || 'Clase sin título';

const formatClaseDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return null;
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min`;
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

const StripeLogo = () => (
  <Image
    src="/images/stripelogo.png"
    alt="Stripe"
    width={72}
    height={28}
    className="block h-7 w-auto object-contain object-left"
    loader={imageLoader}
  />
);

const DlocalLogo = () => (
  <Image
    src="/images/dlocalGoLogo.svg"
    alt="dLocal GO"
    width={88}
    height={28}
    className="block h-7 w-auto object-contain object-left"
    loader={imageLoader}
  />
);

const BankIcon = () => (
  <motion.div
    className="flex h-10 w-10 items-center justify-center rounded-xl bg-palette-ink text-palette-cream"
    aria-hidden
  >
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zm6 0v7h3v-7h-3zM2 4h20v4H2V4z" />
    </svg>
  </motion.div>
);

const MethodBadges = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => (
      <span
        key={item}
        className="rounded-full border border-palette-stone/20 bg-palette-cloud/80 px-2.5 py-1 font-montserrat text-[0.68rem] font-medium uppercase tracking-[0.08em] text-palette-stone"
      >
        {item}
      </span>
    ))}
  </div>
);

const MethodRadioControl = ({
  checked,
  disabled,
}: {
  checked: boolean;
  disabled: boolean;
}) => (
  <span
    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
      disabled
        ? 'border-palette-stone/25 bg-palette-cloud/50'
        : checked
          ? 'border-palette-sage bg-palette-sage'
          : 'border-palette-stone/35 bg-transparent'
    }`}
    aria-hidden
  >
    <AnimatePresence>
      {checked ? (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          <CheckIcon className="h-3 w-3 text-palette-cream" strokeWidth={3} />
        </motion.span>
      ) : null}
    </AnimatePresence>
  </span>
);

export default function CourseCheckoutStart({
  checkoutPlans,
  checkoutImagePublicId,
  productId,
  pricingModo,
  preventaTierIndex,
}: CourseCheckoutStartProps) {
  const auth = useAuth();
  const { cursoConfig, productName } = useCursoLanding();
  const [loadingMethod, setLoadingMethod] = useState<PaymentMethodId | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId | null>(null);
  const [transferCooldownUntilMs, setTransferCooldownUntilMs] = useState(0);
  const [transferCooldownTick, setTransferCooldownTick] = useState(0);
  const pendingCheckoutRan = useRef(false);

  const stripePlan = checkoutPlans.find((plan) => plan.proveedor === 'stripe');
  const dlocalPlan = checkoutPlans.find((plan) => plan.proveedor === 'dlocalgo');

  const displayPrice = stripePlan || dlocalPlan || checkoutPlans[0];
  const transferEmail = cursoConfig.planes.emailSinPlanes || 'info@mateomove.com';

  const paymentMethods = useMemo<PaymentMethodOption[]>(
    () => [
      {
        id: 'stripe',
        title: 'Stripe',
        subtitle: 'Pagos internacionales / International Payments',
        description:
          stripePlan?.descripcion ||
          'Pago internacional en USD con tarjetas, Apple Pay y Google Pay.',
        methods: ['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Google Pay'],
        plan: stripePlan,
        available: Boolean(stripePlan?.activo && stripePlan?.paymentLink),
        unavailableLabel: 'No disponible para este curso en este momento',
      },
      {
        id: 'dlocalgo',
        title: 'dLocal GO',
        subtitle: 'Pagos locales / Local Payments',
        description:
          dlocalPlan?.descripcion ||
          'Pago en moneda local para Uruguay y Latinoamérica, con cuotas en tarjeta.',
        methods: ['Tarjetas locales', 'Débito', 'Crédito', 'Hasta 12 cuotas'],
        plan: dlocalPlan,
        available: Boolean(dlocalPlan?.activo && dlocalPlan?.paymentLink),
        unavailableLabel: 'No disponible para este curso en este momento',
      },
      {
        id: 'transferencia',
        title: 'Transferencia bancaria',
        subtitle: 'Transferencia local / Local bank transfer',
        description:
          'Tocá el botón de abajo y te enviamos los datos bancarios a tu email. Después transferís y nos mandás el comprobante.',
        methods: ['Itaú Uruguay', 'Pesos y dólares', 'Datos por email'],
        available: true,
        unavailableLabel: '',
      },
    ],
    [dlocalPlan, stripePlan]
  );

  const heroImagePublicId =
    checkoutImagePublicId ||
    cursoConfig.imagenCheckoutPublicId ||
    cursoConfig.introHighlights.imagenDesktopPublicId ||
    cursoConfig.introHighlights.imagenMobilePublicId;

  const modulosContenido = useMemo(() => {
    const landingModulos = cursoConfig.queIncluye?.modulos || [];
    const highlightItems = cursoConfig.highlights?.items || [];
    const fallbackImagen =
      cursoConfig.highlights?.ctaImagenPublicId?.trim() || 'my_uploads/fondos/DSC01753_qdv9o0';

    return [...(cursoConfig.contenidoModulos || [])]
      .sort((a, b) => a.timelineIndex - b.timelineIndex)
      .map((modulo) => {
        const tituloRaw = modulo.titulo?.trim() || '';
        const tituloFormatted =
          formatTitleCaseWords(tituloRaw) || `Módulo ${modulo.timelineIndex + 1}`;
        const landingMod =
          landingModulos[modulo.timelineIndex] ||
          landingModulos.find(
            (m) =>
              m.titulo?.trim().toLowerCase() === tituloRaw.toLowerCase() ||
              formatTitleCaseWords(m.titulo).toLowerCase() === tituloFormatted.toLowerCase()
          );
        const highlight = highlightItems[modulo.timelineIndex];
        const imagenPublicId =
          highlight?.imagenPublicId?.trim() ||
          landingMod?.imagenPublicId?.trim() ||
          fallbackImagen;

        return {
          ...modulo,
          titulo: tituloFormatted,
          imagenPublicId,
          clases: [...(modulo.clases || [])].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          ),
        };
      });
  }, [
    cursoConfig.contenidoModulos,
    cursoConfig.highlights?.ctaImagenPublicId,
    cursoConfig.highlights?.items,
    cursoConfig.queIncluye?.modulos,
  ]);

  const totalClases = useMemo(
    () => modulosContenido.reduce((acc, mod) => acc + mod.clases.length, 0),
    [modulosContenido]
  );

  const transferCooldownRemainingSec = useMemo(() => {
    if (!transferCooldownUntilMs || transferCooldownUntilMs <= Date.now()) return 0;
    return Math.max(0, Math.ceil((transferCooldownUntilMs - Date.now()) / 1000));
  }, [transferCooldownUntilMs, transferCooldownTick]);

  useEffect(() => {
    setTransferCooldownUntilMs(readStoredTransferCooldown(cursoConfig.slug));
  }, [cursoConfig.slug]);

  useEffect(() => {
    if (!transferCooldownUntilMs || transferCooldownUntilMs <= Date.now()) {
      return;
    }
    const id = window.setInterval(() => {
      setTransferCooldownTick((t) => t + 1);
      if (Date.now() >= transferCooldownUntilMs) {
        clearStoredTransferCooldown(cursoConfig.slug);
        setTransferCooldownUntilMs(0);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [transferCooldownUntilMs, cursoConfig.slug]);

  useEffect(() => {
    if (!auth.user) {
      auth.fetchUser();
    }
  }, [auth.user, auth]);

  useEffect(() => {
    const firstAvailable = paymentMethods.find((method) => method.available);
    if (firstAvailable) {
      setSelectedMethod(firstAvailable.id);
    }
  }, [paymentMethods]);

  const queueAuthForCheckout = (methodId: PaymentMethodId, paymentLink?: string) => {
    if (typeof window !== 'undefined') {
      saveRedirectUrl(`${window.location.pathname}${window.location.search}`);
    }
    saveCourseCheckoutIntent({
      courseSlug: cursoConfig.slug,
      selectedMethod: methodId,
      paymentLink,
    });
    state.loginForm = true;
  };

  const executeTransferencia = useCallback(async () => {
    setLoadingMethod('transferencia');
    try {
      const res = await fetch('/api/payments/course/request-transfer-details', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName: productName,
          courseSlug: cursoConfig.slug,
          amount: displayPrice?.monto,
          currency: displayPrice?.moneda,
          supportEmail: transferEmail,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'No pudimos enviar el email');
      }
      toast.success(data.message || 'Revisá tu bandeja de entrada');
      const until = Date.now() + TRANSFER_EMAIL_COOLDOWN_MS;
      writeStoredTransferCooldown(cursoConfig.slug, until);
      setTransferCooldownUntilMs(until);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al enviar los datos';
      toast.error(message);
    } finally {
      setLoadingMethod(null);
    }
  }, [
    cursoConfig.slug,
    displayPrice?.moneda,
    displayPrice?.monto,
    productName,
    transferEmail,
  ]);

  const executePaymentLink = useCallback(
    (methodId: PaymentMethodId, paymentLink?: string) => {
      const link =
        paymentLink ||
        checkoutPlans.find((plan) => plan.proveedor === methodId && plan.activo && plan.paymentLink)
          ?.paymentLink;

      if (!link) {
        toast.error('Este plan no tiene link de pago disponible');
        return;
      }

      if (
        pricingModo === 'preventa' &&
        productId &&
        typeof preventaTierIndex === 'number' &&
        preventaTierIndex >= 0
      ) {
        savePendingPreventaRedemption({
          productId,
          preventaTierIndex,
          createdAt: Date.now(),
        });
      }

      setLoadingMethod(methodId);
      window.location.href = link;
    },
    [checkoutPlans, pricingModo, productId, preventaTierIndex]
  );

  const resumePendingCheckout = useCallback(
    async (intent: CourseCheckoutIntent) => {
      if (intent.selectedMethod === 'transferencia') {
        await executeTransferencia();
        return;
      }
      executePaymentLink(intent.selectedMethod, intent.paymentLink);
    },
    [executePaymentLink, executeTransferencia]
  );

  useEffect(() => {
    if (!auth.user || pendingCheckoutRan.current) return;

    const intent = getAndClearCourseCheckoutIntent();
    if (!intent || intent.courseSlug !== cursoConfig.slug) return;

    pendingCheckoutRan.current = true;
    setSelectedMethod(intent.selectedMethod);
    resumePendingCheckout(intent).catch(() => {
      toast.error('No pudimos continuar con el pago. Intentá de nuevo.');
    });
  }, [auth.user, cursoConfig.slug, resumePendingCheckout]);

  const handleContinue = () => {
    if (!selectedMethod) {
      toast.error('Elegí un método de pago para continuar');
      return;
    }

    const method = paymentMethods.find((item) => item.id === selectedMethod);
    if (!method?.available) {
      toast.error('Este método de pago no está disponible');
      return;
    }

    if (!auth.user) {
      queueAuthForCheckout(selectedMethod, method.plan?.paymentLink);
      return;
    }

    if (selectedMethod === 'transferencia') {
      if (transferCooldownRemainingSec > 0) {
        toast.error(`Podés pedir otro email en ${transferCooldownRemainingSec}s`);
        return;
      }
      executeTransferencia().catch(() => {
        toast.error('Error al enviar los datos');
      });
      return;
    }

    executePaymentLink(selectedMethod, method.plan?.paymentLink);
  };

  const renderLogo = (id: PaymentMethodId) => {
    if (id === 'stripe') return <StripeLogo />;
    if (id === 'dlocalgo') return <DlocalLogo />;
    return <BankIcon />;
  };

  return (
    <>
      <section className="relative min-h-screen bg-palette-cream font-montserrat text-palette-ink">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-10 px-5 pb-16 pt-28 md:grid-cols-2 md:items-start md:gap-12 md:px-10 md:pb-20 md:pt-32 lg:gap-16 lg:px-14"
        >
          <div className="order-2 md:order-1 md:sticky md:top-28 md:self-start">
            <h1 className="mb-2 font-montserrat text-[clamp(2rem,5vw,3.35rem)] font-bold leading-[1.02] tracking-[-0.03em] text-palette-ink">
              {productName}
            </h1>
            {displayPrice ? (
              <p className="mb-8 font-montserrat text-lg font-semibold text-palette-ink md:text-xl">
                {formatPrice(displayPrice.moneda, displayPrice.monto)}
              </p>
            ) : null}
            <p className="mb-6 max-w-xl font-raleway text-base leading-relaxed text-palette-stone md:text-lg">
              Elegí un método de pago. Podes pagar con tarjetas internacionales, transferencia bancaria o en moneda local hasta 12 cuotas. 
            </p>

            <div className="space-y-1" role="radiogroup" aria-label="Métodos de pago">
              {paymentMethods.map((method) => {
                const isSelected = selectedMethod === method.id;
                const isDisabled = !method.available;

                return (
                  <label
                    key={method.id}
                    className={`block rounded-2xl border px-4 py-3 text-left transition-colors duration-200 md:px-5 md:py-3.5 ${
                      isDisabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer'
                    } ${
                      isSelected
                        ? isDisabled
                          ? 'border-palette-stone/20 bg-palette-cloud/30'
                          : 'border-palette-sage/35 bg-white/50'
                        : 'border-transparent'
                    }`}
                  >
                    <motion.div
                      layout
                      animate={{ scale: isSelected ? 1.012 : 1 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 32 }}
                      className="origin-left"
                    >
                      <div className="flex items-start gap-3.5">
                        <input
                          type="radio"
                          name="payment-method"
                          value={method.id}
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => {
                            if (!isDisabled) setSelectedMethod(method.id);
                          }}
                          className="sr-only"
                          aria-label={`Seleccionar ${method.id === 'transferencia' ? method.title : method.subtitle}`}
                        />
                        <MethodRadioControl checked={isSelected} disabled={isDisabled} />
                        <motion.div className="min-w-0 flex-1 text-left">
                          {method.id === 'transferencia' ? (
                            <motion.div className="flex min-w-0 items-start gap-3">
                              {renderLogo(method.id)}
                              <motion.div className="min-w-0">
                                <h2
                                  className={`text-left font-montserrat text-lg font-semibold md:text-xl ${
                                    isDisabled ? 'text-palette-stone' : 'text-palette-ink'
                                  }`}
                                >
                                  {method.title}
                                </h2>
                                <p
                                  className={`mt-0.5 text-left font-montserrat text-xs leading-snug md:text-[0.8rem] ${
                                    isDisabled ? 'text-palette-stone/80' : 'text-palette-stone'
                                  }`}
                                >
                                  {method.subtitle}
                                </p>
                                {isDisabled ? (
                                  <p className="mt-1 text-left font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-palette-stone">
                                    No disponible
                                  </p>
                                ) : null}
                              </motion.div>
                            </motion.div>
                          ) : (
                            <motion.div className="flex w-full min-w-0 flex-col items-start gap-1.5">
                              <motion.div className="flex h-7 w-full items-center justify-start">
                                {renderLogo(method.id)}
                              </motion.div>
                              <p
                                className={`text-left font-montserrat text-xs leading-snug md:text-[0.8rem] ${
                                  isDisabled ? 'text-palette-stone/80' : 'text-palette-stone'
                                }`}
                              >
                                {method.subtitle}
                              </p>
                              {isDisabled ? (
                                <p className="text-left font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-palette-stone">
                                  No disponible
                                </p>
                              ) : null}
                            </motion.div>
                          )}

                          <AnimatePresence initial={false}>
                            {isSelected ? (
                              <motion.div
                                key={`${method.id}-details`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                              >
                                <motion.div className="pt-3 text-left">
                                  <p className="mb-3 text-left font-raleway text-sm leading-relaxed text-palette-stone md:text-base">
                                    {method.description}
                                  </p>

                                  <MethodBadges items={method.methods} />

                                  {isDisabled ? (
                                    <p className="mt-3 text-left font-raleway text-sm text-palette-stone">
                                      {method.unavailableLabel}
                                    </p>
                                  ) : null}

                                </motion.div>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    </motion.div>
                  </label>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={
                !selectedMethod ||
                loadingMethod !== null ||
                (selectedMethod === 'transferencia' && transferCooldownRemainingSec > 0)
              }
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full border-2 border-palette-ink bg-palette-ink px-8 py-3.5 font-montserrat text-sm font-semibold uppercase tracking-[0.14em] text-palette-cream transition-all duration-200 hover:bg-palette-sage hover:border-palette-sage hover:text-palette-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMethod ? (
                <>
                  <MiniLoadingSpinner />
                  <span>Procesando...</span>
                </>
              ) : selectedMethod === 'transferencia' && transferCooldownRemainingSec > 0 ? (
                <span>Reenviar en {transferCooldownRemainingSec}s</span>
              ) : selectedMethod === 'transferencia' ? (
                <span>Recibir datos por email</span>
              ) : (
                <span>Empezar AHORA</span>
              )}
            </button>
          </div>

          <div className="order-1 md:order-2">
            <motion.div className="relative mx-auto aspect-[4/5] w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-palette-stone/20 bg-palette-stone/10 shadow-[0_24px_64px_-28px_rgba(20,20,17,0.28)] md:aspect-[3/4] md:max-w-none">
              {heroImagePublicId ? (
                <CldImage
                  src={heroImagePublicId}
                  alt={productName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, 42vw"
                  loader={imageLoader}
                  priority
                />
              ) : (
                <motion.div className="flex h-full items-center justify-center px-6 text-center font-raleway text-palette-stone">
                  Imagen del curso no disponible.
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="border-t border-palette-stone/15 bg-palette-cream py-14 font-montserrat text-palette-ink md:py-18 lg:py-20">
        <motion.div className="mx-auto w-[92%] max-w-[96rem] px-2 sm:px-4 md:px-8 lg:px-12">
          <motion.div className="mb-10 text-center md:mb-12">
            <h2 className="mc-text-depth-light-title font-montserrat text-[clamp(1.85rem,4.5vw,3rem)] font-bold leading-[1.06] tracking-[-0.03em] text-palette-ink">
              Contenido del curso
            </h2>
            {modulosContenido.length > 0 ? (
              <p className="mt-3 font-raleway text-base text-palette-stone md:text-lg">
                {modulosContenido.length} módulo{modulosContenido.length === 1 ? '' : 's'}
                {totalClases > 0
                  ? ` · ${totalClases} clase${totalClases === 1 ? '' : 's'}`
                  : ''}
              </p>
            ) : null}
          </motion.div>

          {modulosContenido.length === 0 ? (
            <p className="text-center font-raleway text-lg text-palette-stone md:text-xl">
              El temario se publicará pronto.
            </p>
          ) : (
            <ol className="space-y-10 md:space-y-12 lg:space-y-14">
              {modulosContenido.map((modulo, index) => (
                <motion.li
                  key={`modulo-${modulo.timelineIndex}-${index}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  viewport={{ once: true, margin: '-48px' }}
                  className="border-b border-palette-stone/15 pb-10 last:border-b-0 last:pb-0 md:pb-12"
                >
                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start md:mb-6 md:gap-5">
                    {modulo.imagenPublicId ? (
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-[5.5rem] sm:w-[5.5rem] md:h-24 md:w-24">
                        <CldImage
                          src={modulo.imagenPublicId}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="96px"
                          loader={imageLoader}
                        />
                      </div>
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-montserrat text-xl font-bold tabular-nums text-palette-deep-teal/30 md:text-2xl">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <h3 className="mc-text-depth-light-title font-montserrat text-[clamp(1.35rem,3.2vw,2.1rem)] font-bold leading-[1.1] tracking-[-0.02em] text-palette-ink">
                          {modulo.titulo}
                        </h3>
                      </div>
                      <p className="mt-1.5 font-montserrat text-xs font-medium uppercase tracking-[0.18em] text-palette-sage md:text-sm">
                        {modulo.clases.length} clase{modulo.clases.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>

                  {modulo.clases.length === 0 ? (
                    <p className="font-raleway text-base text-palette-stone md:text-lg">
                      Sin clases cargadas en este módulo.
                    </p>
                  ) : (
                    <ul className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2 md:gap-y-5 lg:gap-x-12">
                      {modulo.clases.map((clase, claseIndex) => {
                        const durationLabel = formatClaseDuration(clase.duration);
                        return (
                          <li
                            key={`${modulo.timelineIndex}-clase-${claseIndex}-${clase.courseClassId || clase.name || claseIndex}`}
                            className="flex items-start gap-3 md:gap-4"
                          >
                            <span
                              className="shrink-0 font-montserrat text-base font-bold tabular-nums leading-none text-palette-sage/65 md:text-lg"
                              aria-hidden
                            >
                              {(claseIndex + 1).toString().padStart(2, '0')}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-montserrat text-[clamp(1.02rem,2vw,1.35rem)] font-semibold leading-snug text-palette-ink">
                                {formatTitleCaseWords(getClaseDisplayName(clase))}
                              </p>
                              {durationLabel ? (
                                <p className="mt-1 font-montserrat text-xs font-medium uppercase tracking-[0.12em] text-palette-stone md:text-sm">
                                  {durationLabel}
                                </p>
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </motion.li>
              ))}
            </ol>
          )}
        </motion.div>
      </section>
    </>
  );
}
