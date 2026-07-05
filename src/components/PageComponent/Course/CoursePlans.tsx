'use client'
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plan } from '../../../../typings';
import { CursoPlanPago } from '../../../types/cursoLanding';
import { useAuth } from '../../../hooks/useAuth';
import state from '../../../valtio';
import endpoints from '../../../services/api';
import Cookies from 'js-cookie';
import { toast } from '../../../hooks/useToast';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import { savePlanIntent } from '../../../utils/redirectQueue';
import { fetchOwnedCursoRedirectPath } from '../../../lib/resolveOwnedCursoRedirect';
import imageLoader from '../../../../imageLoader';
import { useCursoLanding } from './CursoLandingContext';
import {
  landingCtaPrimary,
  landingEyebrow,
  landingFadeUp,
  landingHeaderBlock,
  landingSectionBody,
  landingSectionContainer,
  landingSectionShell,
  landingSectionTitle,
  landingPlanCard,
  landingPlanCardSide,
} from '../../../constants/landingSectionDesign';
import {
  formatCursoFechaConHora,
  formatCursoFechaLargo,
  splitCountdownUnits,
  useCountdownTo,
  useCursoPreventaPricing,
} from '../../../hooks/useCursoPreventaPricing';
import { resolveCursoLanzamientoMonto } from '../../../lib/cursoPricing';

interface Promocion {
  _id: string;
  nombre: string;
  descripcion?: string;
  porcentajeDescuento: number;
  frecuenciasAplicables: string[];
  fechaFin: string;
  codigoPromocional?: string;
}

interface CoursePlansProps {
  plans?: Plan[];
  promociones?: Promocion[];
  checkoutPlans?: CursoPlanPago[];
}

const formatPrice = (currency: string, amount: number) => {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    return `${amount} ${currency}`;
  }
};

/** Copy de valor por encima del bloque de planes. */
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const CoursePlans = ({ plans = [], promociones = [], checkoutPlans = [] }: CoursePlansProps) => {
  const router = useRouter();
  const auth = useAuth();
  const { cursoConfig, plansSectionId, checkoutStartPath, slug } = useCursoLanding();
  const { planes } = cursoConfig;
  const preventaPricing = useCursoPreventaPricing(cursoConfig);
  const lanzamientoMonto = resolveCursoLanzamientoMonto(cursoConfig);
  const planesTitulo =
    preventaPricing.enPreventa && preventaPricing.fechaLanzamiento
      ? `Accedé a todo el método el ${formatCursoFechaLargo(preventaPricing.fechaLanzamiento)}`
      : planes.titulo;
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [isNavigatingToCheckout, setIsNavigatingToCheckout] = useState(false);

  const handleGoToCheckout = useCallback(async () => {
    if (isNavigatingToCheckout) return;
    setIsNavigatingToCheckout(true);
    try {
      const ownedPath = await fetchOwnedCursoRedirectPath({ slug });
      if (ownedPath) {
        router.push(ownedPath);
        return;
      }
      router.push(checkoutStartPath);
    } catch {
      setIsNavigatingToCheckout(false);
      toast.error('No pudimos abrir el checkout. Intentá de nuevo.');
    }
  }, [checkoutStartPath, isNavigatingToCheckout, router, slug]);
  const activeCheckoutPlans = checkoutPlans.filter((plan) => plan.activo && plan.paymentLink);
  const activePlans = plans.filter((plan) => plan.active);
  const monthlyPlan = activePlans.find(
    (p) =>
      (p.frequency_type || '').toLowerCase().includes('month') ||
      (p.frequency_label || '').toLowerCase().includes('mensual')
  );
  const annualPlan = activePlans.find(
    (p) =>
      (p.frequency_type || '').toLowerCase().includes('year') ||
      (p.frequency_label || '').toLowerCase().includes('anual')
  );
  /** Un solo plan en pantalla: preferimos anual si existe; si no, mensual o el primero activo. */
  const displayPlan = annualPlan ?? monthlyPlan ?? activePlans[0] ?? null;

  // Función para obtener la promoción aplicable a un plan
  const getPromocionAplicable = (plan: Plan, promos: Promocion[] = promociones): Promocion | null => {
    if (!promos || promos.length === 0) return null;
    
    const ahora = new Date();
    const promocionesValidas = promos.filter((p: Promocion) => {
      const fechaFin = new Date(p.fechaFin);
      return fechaFin > ahora;
    });

    // Mapear frequency_label y frequency_type a frecuencias de promoción
    const frecuenciaPlan = plan.frequency_label?.toLowerCase() || '';
    const frequencyType = plan.frequency_type?.toLowerCase() || '';
    let frecuenciaPromocion = '';
    
    if (frecuenciaPlan.includes('mensual') || 
        frequencyType === 'month' || 
        frequencyType === 'monthly' ||
        frequencyType === 'mensual') {
      frecuenciaPromocion = 'mensual';
    } else if (frecuenciaPlan.includes('trimestral') || 
               frequencyType === 'quarter' || 
               frequencyType === 'quarterly' ||
               frequencyType === 'trimestral') {
      frecuenciaPromocion = 'trimestral';
    } else if (frecuenciaPlan.includes('anual') || 
               frequencyType === 'year' || 
               frequencyType === 'yearly' ||
               frequencyType === 'anual') {
      // Los planes anuales pueden aplicar a promociones trimestrales o ambas
      frecuenciaPromocion = 'trimestral';
    }

    // Buscar promoción que aplique a esta frecuencia
    const promocionAplicable = promocionesValidas.find((p: Promocion) => {
      return p.frecuenciasAplicables.includes(frecuenciaPromocion) || 
             p.frecuenciasAplicables.includes('ambas');
    });

    return promocionAplicable || null;
  };

  useEffect(() => {
    if (!auth.user) {
      auth.fetchUser();
    }
  }, [auth.user]);

  const handleSelect = async (plan: Plan) => {
    // Si el usuario no está logueado, guardar la intención del plan y abrir el modal de login
    if (!auth.user) {
      if (typeof window !== 'undefined' && plan) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        savePlanIntent({
          planId: plan.id,
          provider: plan.provider || 'dlocalgo',
          origin: origin,
          plan_token: plan.plan_token
        });
      }
      state.authModalMode = 'register';
      state.loginForm = true;
      return;
    }

    const email = auth.user.email;
    if (!email) {
      toast.error('Usuario no encontrado');
      return;
    }

    setLoadingPlanId(plan._id);

    try {
      if (plan.provider !== "stripe") {
        // Flujo para proveedores que no son Stripe (ej: dlocal)
        const res = await fetch(endpoints.payments.createPaymentToken, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, planId: plan.id }),
        });

        const data = await res.json();
        setLoadingPlanId(null);

        if (!data.success) {
          toast.error(data.message);
          return;
        }

        const { token, planToken } = data;
        Cookies.set('planToken', planToken ? planToken : '', { expires: 5 });

        // URL por defecto para dlocal (puede ser sobrescrita por variable de entorno en el servidor)
        const origin = "https://checkout.dlocalgo.com";
        
        router.push(`${origin}/validate/subscription/${plan.plan_token}?external_id=${auth.user._id}`);
      } else {
        // Flujo para Stripe
        try {
          const res = await fetch(endpoints.payments.stripe.createPaymentURL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, planId: plan.id }),
          });

          const data = await res.json();
          setLoadingPlanId(null);

          if (!data.success) {
            toast.error(data.message);
            return;
          }

          const { url, planToken } = data;
          Cookies.set('planToken', planToken ? planToken : '', { expires: 5 });

          if (url) {
            window.location.href = url;
          } else {
            toast.error('No se recibió la URL de pago');
          }
        } catch (error: any) {
          setLoadingPlanId(null);
          toast.error(error?.message || 'Error al procesar el pago');
        }
      }
    } catch (error: any) {
      setLoadingPlanId(null);
      toast.error(error.message || 'Error al procesar el pago');
    }
  };

  const PlanCard = ({
    plan,
    index,
    displayAmount,
    showPreventaInfo = false,
    fechaLanzamiento = null,
    preventaFechaFin = null,
    promocionesList = promociones,
  }: {
    plan: Plan;
    index: number;
    displayAmount?: number;
    showPreventaInfo?: boolean;
    fechaLanzamiento?: Date | null;
    preventaFechaFin?: Date | null;
    promocionesList?: Promocion[];
  }) => {
    const preventaCountdownRemainingMs = useCountdownTo(
      showPreventaInfo ? preventaFechaFin : null
    );
    const promocionPlan = getPromocionAplicable(plan, promocionesList);
    const hasPromo = Boolean(promocionPlan && promocionPlan.porcentajeDescuento > 0);
    const precioConDescuento = hasPromo
      ? plan.amount * (1 - (promocionPlan?.porcentajeDescuento ?? 0) / 100)
      : null;
    const ahorroPromo = hasPromo && precioConDescuento !== null
      ? Math.max(0, Math.round(plan.amount - precioConDescuento))
      : null;

    const precioPrincipal =
      displayAmount != null
        ? Math.round(displayAmount)
        : precioConDescuento !== null
          ? Math.round(precioConDescuento)
          : plan.amount;

    const priceIncreaseDeadlineRef = useRef(Date.now() + SEVEN_DAYS_MS);
    const [priceIncreaseRemainingMs, setPriceIncreaseRemainingMs] = useState(
      () => Math.max(0, priceIncreaseDeadlineRef.current - Date.now()),
    );

    useEffect(() => {
      if (showPreventaInfo) return;

      const tick = () => {
        let end = priceIncreaseDeadlineRef.current;
        let diff = end - Date.now();
        if (diff <= 0) {
          priceIncreaseDeadlineRef.current = Date.now() + SEVEN_DAYS_MS;
          diff = priceIncreaseDeadlineRef.current - Date.now();
        }
        setPriceIncreaseRemainingMs(Math.max(0, diff));
      };
      tick();
      const id = window.setInterval(tick, 1000);
      return () => window.clearInterval(id);
    }, [plan._id, showPreventaInfo]);

    const countdownRemainingMs = showPreventaInfo
      ? preventaCountdownRemainingMs
      : priceIncreaseRemainingMs;
    const countUnits = splitCountdownUnits(countdownRemainingMs);
    const countdownLabel = showPreventaInfo
      ? 'Este precio de preventa termina en:'
      : 'El precio aumenta en:';

    return (
      <motion.div
        id={`plan-card-${plan._id}`}
        key={plan._id}
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className={`group relative isolate flex h-full min-h-[21.5rem] w-full min-w-0 flex-col overflow-hidden ${landingPlanCard} p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-palette-sage/40 hover:shadow-[0_28px_60px_-28px_rgba(20,20,17,0.2)] sm:min-h-[22rem] md:min-h-0 md:p-5`}
      >
        {/* Acentos sutiles (debajo del contenido y del precio) */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-sage/35 to-transparent opacity-90" />
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-palette-sage/[0.12] blur-3xl opacity-65" />
          <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-palette-stone/10 blur-3xl opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_60%_at_50%_0%,rgba(255,253,253,0.9),transparent_62%)] opacity-60" />
        </div>

        {/* Precio: centrado en la tarjeta, por encima de acentos / degradados (z-20) */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-3">
          <div className="relative mx-auto w-fit px-2 pb-8 md:pb-6">
            <p className="text-center font-montserrat text-[2.75rem] font-bold leading-none tracking-[-0.09em] text-palette-ink tabular-nums md:text-[3.5rem]">
              <b>{new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(precioPrincipal)}</b>
            </p>
            <span className="pointer-events-none absolute bottom-6 right-2 font-montserrat text-[0.82rem] font-semibold uppercase tracking-[0.22em] text-palette-ink md:text-[0.58rem]">
              USD
            </span>
          </div>
        </div>

        {/* Cabecera y pie por encima del precio donde se cruce el layout (z-30) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-5 pt-2 text-center text-palette-ink md:px-5 md:pt-2">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {hasPromo ? (
              <span className="pointer-events-auto font-montserrat text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-palette-sage/90">
                {promocionPlan?.porcentajeDescuento}% OFF
              </span>
            ) : null}
          </div>
          <h3 className="mt-5 text-balance font-montserrat text-2xl md:text-4xl font-semibold tracking-tight leading-tight text-palette-ink md:mt-5">
            <b>PRECIO</b>
            <br />{' '}
            <span className="relative bottom-2 text-2xl text-palette-ink md:bottom-3 md:text-4xl">
              {showPreventaInfo ? 'PREVENTA' : 'HOY'}
            </span>
          </h3>
          {showPreventaInfo && fechaLanzamiento ? (
            <p className="pointer-events-auto mt-3 font-montserrat text-[0.65rem] font-medium uppercase leading-snug tracking-[0.12em] text-palette-ink md:text-[0.7rem]">
              Lanzamiento: {formatCursoFechaLargo(fechaLanzamiento)}
            </p>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-4 px-5 pb-4 text-center text-palette-ink md:gap-3 md:px-5 md:pb-4">
          {ahorroPromo !== null && ahorroPromo > 0 ? (
            <p className="pointer-events-auto text-base font-light text-palette-ink">
              Ahorrás{' '}
              <span className="font-semibold text-palette-ink">{formatPrice(plan.currency, ahorroPromo)}</span>
            </p>
          ) : null}
          <div className="pointer-events-auto w-full max-w-[17rem] border-t border-palette-ink/15 pt-4 md:pt-3">
            <p className="font-montserrat text-[0.62rem] font-medium uppercase leading-snug tracking-[0.14em] text-palette-ink">
              {countdownLabel}
            </p>
            {showPreventaInfo && preventaFechaFin ? (
              <p className="mt-1 font-montserrat text-[0.55rem] font-normal normal-case tracking-normal text-palette-ink/75">
                Hasta el {formatCursoFechaConHora(preventaFechaFin)}
              </p>
            ) : null}
            <div className="mt-3 flex justify-center gap-2 tabular-nums md:mt-2 md:gap-1.5">
              {countUnits.map((unit) => (
                <div key={unit.label} className="flex min-w-[2.65rem] flex-col items-center gap-1 sm:min-w-[2.75rem] md:min-w-[2.65rem] md:gap-0.5">
                  <span className="w-full rounded-md border border-palette-ink/20 bg-white/50 px-1.5 py-2 text-center font-montserrat text-base font-bold leading-none text-palette-ink shadow-sm md:px-1 md:py-1.5 sm:text-lg">
                    {unit.value}
                  </span>
                  <span className="font-montserrat text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-palette-ink">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* CTA se renderiza fuera del card (abajo del bloque 3D). */}
      </motion.div>
    );
  };

  const PriceReferenceCard = ({
    plan,
    referenceAmount,
  }: {
    plan: Plan;
    referenceAmount?: number | null;
  }) => {
    const precioReferencia =
      referenceAmount != null && referenceAmount > 0
        ? Math.round(referenceAmount)
        : Math.round((plan.amount || 0) * 3);
    const precioFormateado = new Intl.NumberFormat('es-AR', {
      maximumFractionDigits: 0,
    }).format(precioReferencia);

    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className={`relative isolate flex w-full min-w-0 flex-col items-center gap-2 overflow-hidden ${landingPlanCardSide} px-4 py-3.5 text-center text-palette-ink md:h-full md:min-h-[20rem] md:items-stretch md:gap-0 md:p-5`}
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-palette-sage/[0.1] blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-stone/30 to-transparent opacity-80" />
        </div>

        <div className="relative z-30 w-full text-center md:pointer-events-none md:absolute md:inset-x-0 md:top-0 md:px-5 md:pt-2">
          <h3 className="text-balance font-montserrat text-lg font-semibold tracking-tight leading-tight text-palette-ink sm:text-xl md:mt-5 md:text-[clamp(1.2rem,3.1vw,1.72rem)]">
            <b>PRECIO</b>
            <br />{' '}
            <span className="relative bottom-1 text-base text-palette-ink sm:text-lg md:bottom-3 md:text-2xl">
              ANTERIOR
            </span>
          </h3>
        </div>

        <div className="relative z-20 flex w-full justify-center md:pointer-events-none md:absolute md:inset-0 md:items-center md:px-3">
          <div className="relative mx-auto w-fit px-1 md:px-2 md:pb-6">
            <p className="text-center font-montserrat text-[2.35rem] font-bold leading-tight tracking-[-0.08em] text-palette-ink tabular-nums sm:text-[2.65rem] md:text-[clamp(3rem,8vw,4.1rem)] md:tracking-[-0.095em]">
              <b className="relative z-0 inline-block">
                {precioFormateado}
                <svg
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-[56%] z-10 h-[0.42em] w-[150%] -translate-y-1/2 -translate-x-6 overflow-visible text-red-600"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 10 90 L 90 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 10 L 90 90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </b>
            </p>
            <span className="pointer-events-none absolute -bottom-0.5 right-0 font-montserrat text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-palette-ink md:bottom-6 md:right-2 md:text-[0.58rem]">
              USD
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  const UruguayPaymentsCard = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className={`relative isolate flex h-full min-h-[20.5rem] w-full min-w-0 flex-col overflow-hidden ${landingPlanCardSide} p-5 text-center text-palette-ink sm:min-h-[21rem] md:min-h-[20rem] md:p-5`}
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-palette-sage/[0.12] blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-sage/30 to-transparent opacity-80" />
        </div>

        {/* Ilustración medios de pago — centrada en la tarjeta */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4 pt-[4.5rem] pb-[5.5rem] md:px-4 md:pt-20 md:pb-24">
          <Image
            src="/images/svg/pagodoble.png"
            alt="Cuotas con tarjeta local e internacional: dLocal y Stripe."
            width={640}
            height={400}
            sizes="(max-width: 768px) 90vw, 18rem"
            className="h-auto max-h-[12.5rem] w-full max-w-[min(100%,17.5rem)] object-contain drop-shadow-sm md:max-h-[13rem] md:max-w-[18rem]"
            loader={imageLoader}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-5 pt-2 text-center text-palette-ink md:px-5 md:pt-2">
          <h3 className="mt-5 text-balance font-montserrat text-[clamp(1.2rem,3.1vw,1.72rem)] font-semibold tracking-tight leading-tight text-palette-ink md:mt-5">
            <b>MÉTODO</b>
            <br /> <span className="relative bottom-2 text-xl text-palette-ink md:bottom-3 md:text-2xl">DE PAGO</span>
          </h3>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 px-5 pb-4 text-center text-palette-ink md:bottom-4 md:px-5 md:pb-4">
          <p className="font-raleway text-base leading-snug text-palette-ink md:text-lg">
            Hasta 12 cuotas en Uruguay y Latinoamérica
          </p>
        </div>
      </motion.div>
    );
  };

  const renderPlans = () => {
    if (activeCheckoutPlans.length > 0) {
      const displayCheckoutPlan = activeCheckoutPlans[0];
      const checkoutDisplayAmount =
        preventaPricing.enPreventa && preventaPricing.precioPreventaActivo
          ? preventaPricing.precioPreventaActivo.monto
          : displayCheckoutPlan.monto;
      const displayPlan = {
        _id: 'curso-checkout',
        id: 'curso-checkout',
        merchant_id: '',
        name: displayCheckoutPlan.etiqueta,
        description: displayCheckoutPlan.descripcion,
        amount: checkoutDisplayAmount,
        currency: displayCheckoutPlan.moneda,
        country: '',
        frequency_type: 'one_time',
        frequency_value: 1,
        frequency_label: 'Pago único',
        active: true,
        plan_token: '',
        back_url: '',
        notification_url: '',
        success_url: '',
        error_url: '',
        createdAt: '',
        provider: displayCheckoutPlan.proveedor,
      } as Plan;

      return (
        <motion.div className="mx-auto max-w-6xl">
          <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-6 lg:gap-7">
            <div className="order-2 flex h-auto items-start min-h-0 md:order-1 md:h-full md:col-span-4 md:items-stretch md:pt-10 md:[transform:translateZ(-80px)_rotateY(9deg)]">
              <motion.div className="h-auto w-full md:h-full md:min-h-0 md:translate-x-5 md:scale-[0.96] md:opacity-90">
                <PriceReferenceCard
                  plan={displayPlan}
                  referenceAmount={
                    preventaPricing.enPreventa ? lanzamientoMonto : null
                  }
                />
              </motion.div>
            </div>
            <div className="order-1 flex h-full min-h-0 md:order-2 md:col-span-4 md:[transform:translateZ(60px)]">
              <PlanCard
                plan={displayPlan}
                index={0}
                displayAmount={checkoutDisplayAmount}
                showPreventaInfo={preventaPricing.enPreventa}
                fechaLanzamiento={preventaPricing.fechaLanzamiento}
                preventaFechaFin={preventaPricing.preventaFechaFin}
              />
            </div>
            <div className="order-3 flex h-full min-h-0 md:order-3 md:col-span-4 md:pt-10 md:[transform:translateZ(-80px)_rotateY(-9deg)]">
              <motion.div className="h-full min-h-0 w-full md:-translate-x-5 md:scale-[0.96] md:opacity-90">
                <UruguayPaymentsCard />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="mx-auto mt-10 max-w-3xl px-4 text-center md:mt-14"
          >
            <button
              type="button"
              onClick={handleGoToCheckout}
              disabled={isNavigatingToCheckout}
              className={`${landingCtaPrimary} w-full px-10 py-4 disabled:cursor-not-allowed disabled:opacity-50 sm:px-12 md:w-auto md:px-14`}
            >
              {isNavigatingToCheckout ? (
                <>
                  <MiniLoadingSpinner />
                  <span>Redirigiendo...</span>
                </>
              ) : (
                <>
                  <span>Empezar AHORA</span>
                  <span className="opacity-80 translate-y-[0.5px] transition-transform duration-200">
                    →
                  </span>
                </>
              )}
            </button>
            <div className="mx-auto mt-6 max-w-2xl space-y-3.5 text-balance text-palette-stone md:mt-8 md:max-w-3xl md:space-y-4">
              <p className="font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-palette-ink md:text-sm">
                {planes.etiquetaFormasPago}
              </p>
              <p className="text-sm font-light leading-relaxed md:text-base">
                {planes.copyUruguayLatam}
              </p>
              <p className="text-sm font-light leading-relaxed md:text-base">
                {planes.copyRestoMundo}
              </p>
            </div>
          </motion.div>
        </motion.div>
      );
    }

    if (activePlans.length === 0) {
      return (
        <div className={`relative ${landingPlanCard} p-8 text-center font-light text-palette-stone md:p-10`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-palette-sage/15 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-lg md:text-xl leading-relaxed">
              {planes.mensajeSinPlanes}{' '}
              <a href={`mailto:${planes.emailSinPlanes}`} className="underline text-palette-sage hover:text-palette-ink font-medium">
                {planes.emailSinPlanes}
              </a>
            </p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.open(`mailto:${planes.emailSinPlanes}`);
                }
              }}
              className="mt-6 font-montserrat font-semibold text-base uppercase tracking-[0.18em] rounded-full px-7 py-3.5 bg-palette-ink text-palette-cream border-2 border-palette-ink hover:bg-palette-sage hover:border-palette-sage hover:text-palette-ink transition-all duration-200"
            >
              {planes.ctaSinPlanes}
            </button>
          </div>
        </div>
      );
    }

    if (!displayPlan) {
      return null;
    }

    return (
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-6 lg:gap-7">
          {/* Mobile: el plan primero. Desktop: a la izquierda, “card atrás” con precio viejo */}
          <div className="order-2 flex h-auto items-start min-h-0 md:order-1 md:h-full md:col-span-4 md:items-stretch md:pt-10 md:[transform:translateZ(-80px)_rotateY(9deg)]">
            <div className="h-auto w-full md:h-full md:min-h-0 md:translate-x-5 md:scale-[0.96] md:opacity-90">
              <PriceReferenceCard
                plan={displayPlan}
                referenceAmount={
                  preventaPricing.enPreventa ? lanzamientoMonto : null
                }
              />
            </div>
          </div>

          {/* Centro: plan principal */}
          <motion.div className="order-1 flex h-full min-h-0 md:order-2 md:col-span-4 md:[transform:translateZ(60px)]">
            <PlanCard
              plan={displayPlan}
              index={0}
              displayAmount={
                preventaPricing.enPreventa && preventaPricing.precioPreventaActivo
                  ? preventaPricing.precioPreventaActivo.monto
                  : undefined
              }
              showPreventaInfo={preventaPricing.enPreventa}
              fechaLanzamiento={preventaPricing.fechaLanzamiento}
              preventaFechaFin={preventaPricing.preventaFechaFin}
            />
          </motion.div>

          {/* Derecha: cuotas / MercadoPago Uruguay */}
          <div className="order-3 flex h-full min-h-0 md:order-3 md:col-span-4 md:pt-10 md:[transform:translateZ(-80px)_rotateY(-9deg)]">
            <div className="h-full min-h-0 w-full md:-translate-x-5 md:scale-[0.96] md:opacity-90">
              <UruguayPaymentsCard />
            </div>
          </div>
        </div>

        {/* CTA abajo del bloque 3D */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto mt-10 max-w-3xl px-4 text-center md:mt-14"
        >
          <button
            onClick={() => handleSelect(displayPlan)}
            disabled={loadingPlanId === displayPlan._id}
            className={`${landingCtaPrimary} w-full px-10 py-4 disabled:cursor-not-allowed disabled:opacity-50 sm:px-12 md:w-auto md:px-14`}
          >
            {loadingPlanId === displayPlan._id ? (
              <>
                <MiniLoadingSpinner />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <span>Entrar ahora</span>
                <span className="opacity-80 translate-y-[0.5px] transition-transform duration-200">
                  →
                </span>
              </>
            )}
          </button>
          <div className="mx-auto mt-6 max-w-2xl space-y-3.5 text-balance text-palette-stone md:mt-8 md:max-w-3xl md:space-y-4">
            <p className="font-montserrat text-xs font-semibold uppercase tracking-[0.14em] text-palette-ink md:text-sm">
              {planes.etiquetaFormasPago}
            </p>
            <p className="text-sm font-light leading-relaxed md:text-base">
              {planes.copyUruguayLatam}
            </p>
            <p className="text-sm font-light leading-relaxed md:text-base">
              {planes.copyRestoMundo}
            </p>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <>
    <section
      className={`${landingSectionShell} py-14 md:py-20`}
      id={plansSectionId}
    >

      <div className={`relative ${landingSectionContainer} text-center`}>
        <motion.div
          {...landingFadeUp}
          className={`${landingHeaderBlock} mx-auto text-center`}
        >
          <p className={landingEyebrow}>Inversión</p>
          <h2 className={landingSectionTitle}>
            {planesTitulo}
          </h2>
          {preventaPricing.enPreventa ? (
            <p className="mt-4 font-montserrat text-xs font-semibold uppercase tracking-[0.26em] text-palette-stone md:text-sm">
              Preventa
            </p>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className={`${landingSectionBody} mx-auto mb-10 max-w-4xl space-y-4 text-balance text-center md:mb-14 md:space-y-5`}
        >
          {planes.parrafosValor.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </motion.div>

        <div className="[perspective:1200px]">
          {renderPlans()}
        </div>
      </div>
    </section>

    <AnimatePresence>
      {isNavigatingToCheckout ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-palette-ink/60 font-montserrat backdrop-blur-sm"
          aria-live="polite"
          aria-busy="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-palette-stone/20 bg-palette-ink/90 px-8 py-6 shadow-xl"
          >
            <motion.div
              className="h-9 w-9 rounded-full border-2 border-palette-stone/30 border-t-palette-sage"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-sm font-light tracking-wide text-palette-cream">
              Preparando checkout...
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
    </>
  );
};

export default CoursePlans;
