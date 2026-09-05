'use client'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plan } from '../../../../typings';
import { CursoPlanPago } from '../../../types/cursoLanding';
import { useAuth } from '../../../hooks/useAuth';
import state from '../../../valtio';
import endpoints from '../../../services/api';
import Cookies from 'js-cookie';
import { toast } from '../../../hooks/useToast';
import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import { savePlanIntent } from '../../../utils/redirectQueue';
import { fetchOwnedCursoRedirectPath } from '../../../lib/resolveOwnedCursoRedirect';
import imageLoader from '../../../../imageLoader';
import { CldImage } from 'next-cloudinary';
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
import {
  CURSO_SUSCRIPCION_INTERVALO_4_MESES,
  CURSO_SUSCRIPCION_INTERVALO_MENSUAL,
  isCursoCheckoutSuscripcion,
  resolveCursoPlanIntervaloMeses,
} from '../../../lib/cursoSuscripcion';
import {
  CURSO_SUSCRIPCION_INCLUDES,
  CURSO_SUSCRIPCION_INCLUDES_TITULO,
} from '../../../constants/cursoSuscripcionIncludes';

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
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
/** Una sola deadline por sesión: el toggle de plan no debe reiniciar ni remountar el árbol entero. */
let bonusUrgencyDeadlineMs = Date.now() + TWELVE_HOURS_MS;

const countdownEase = [0.16, 1, 0.3, 1] as const;

const countdownRowVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const countdownUnitVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: countdownEase },
  },
};

const beneficioListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.06 },
  },
};

const beneficioItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: countdownEase },
  },
};

function CountdownUnits({
  remainingMs,
  tone = 'default',
}: {
  remainingMs: number;
  tone?: 'default' | 'urgency';
}) {
  const reduceMotion = useReducedMotion();
  const countUnits = splitCountdownUnits(remainingMs);
  const isUrgency = tone === 'urgency';
  return (
    <motion.div
      className="mt-3 flex w-full justify-center gap-2 tabular-nums sm:gap-2.5 md:mt-2.5 md:gap-2"
      variants={countdownRowVariants}
      initial={reduceMotion ? false : 'hidden'}
      animate="visible"
    >
      {countUnits.map((unit) => (
        <motion.div
          key={unit.label}
          variants={countdownUnitVariants}
          className="flex min-w-[3.1rem] flex-col items-center gap-1 sm:min-w-[3.4rem] md:min-w-[3.2rem] md:gap-1"
        >
          <span
            className={
              isUrgency
                ? 'w-full rounded-lg border border-palette-ink/25 bg-white px-1.5 py-2.5 text-center font-montserrat text-2xl font-black leading-none text-palette-ink shadow-sm sm:text-[1.65rem] md:px-1.5 md:py-2 md:text-2xl'
                : 'w-full rounded-md border border-palette-ink/20 bg-white/50 px-1.5 py-2 text-center font-montserrat text-base font-bold leading-none text-palette-ink shadow-sm md:px-1 md:py-1.5 sm:text-lg'
            }
          >
            {unit.value}
          </span>
          <span
            className={
              isUrgency
                ? 'font-montserrat text-[0.7rem] font-bold uppercase tracking-[0.12em] text-palette-ink sm:text-xs'
                : 'font-montserrat text-[0.5rem] font-semibold uppercase tracking-[0.12em] text-palette-ink'
            }
          >
            {unit.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}

function BonusUrgencyFooter() {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, bonusUrgencyDeadlineMs - Date.now())
  );

  useEffect(() => {
    const tick = () => {
      let diff = bonusUrgencyDeadlineMs - Date.now();
      if (diff <= 0) {
        bonusUrgencyDeadlineMs = Date.now() + TWELVE_HOURS_MS;
        diff = bonusUrgencyDeadlineMs - Date.now();
      }
      setRemainingMs(Math.max(0, diff));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-auto w-full border-t border-palette-ink/15 pt-4 md:pt-3">
      <p className="font-montserrat text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-palette-ink">
        Bonus para quienes entran hoy
      </p>
      <p className="mt-2 font-montserrat text-[1.35rem] font-extrabold leading-[1.15] tracking-tight text-palette-ink sm:text-2xl md:text-[1.45rem] lg:text-2xl">
        Llamada 1:1
        <span className="mt-0.5 block text-[1.15rem] font-bold sm:text-xl md:text-[1.25rem] lg:text-xl">
          de 40 min con Mateo
        </span>
      </p>
      <p className="mt-3 font-montserrat text-[0.82rem] font-black uppercase leading-snug tracking-[0.08em] text-[#DC2626]">
        Esta oportunidad termina en:
      </p>
      <div className="mt-2 md:mt-1.5">
        <CountdownUnits remainingMs={remainingMs} tone="urgency" />
      </div>
    </div>
  );
}

function OfertaSelectorButton({
  isActive,
  onSelect,
}: {
  isActive: boolean;
  onSelect: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const showHint = !isActive && !reduceMotion;

  return (
    <span className="relative isolate inline-flex">
      {showHint ? (
        <>
          <span
            aria-hidden
            className="curso-oferta-hint-glow pointer-events-none absolute -inset-2 rounded-full"
          />
          <span
            aria-hidden
            className="curso-oferta-hint-ring pointer-events-none absolute -inset-[3px] rounded-full p-[2px]"
          />
        </>
      ) : null}
      <button
        type="button"
        role="radio"
        aria-checked={isActive}
        onClick={onSelect}
        className={`relative z-10 overflow-hidden rounded-full px-7 py-2.5 font-montserrat text-sm font-semibold ${
          isActive
            ? 'bg-palette-ink text-palette-cream shadow-md'
            : showHint
              ? 'curso-oferta-hint bg-white text-palette-ink'
              : 'bg-white text-palette-ink shadow-[0_10px_28px_-12px_rgba(20,20,17,0.5)]'
        }`}
      >
        {showHint ? <span aria-hidden className="curso-oferta-hint-shine" /> : null}
        <span className="relative z-10">Oferta</span>
      </button>
    </span>
  );
}

function EmphasisText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 3) {
          return (
            <em key={i} className="font-semibold italic text-palette-ink">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function PlanesBeneficiosList({
  titulo,
  beneficios,
}: {
  titulo?: string;
  beneficios: readonly string[];
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto mt-16 w-full max-w-[36rem] md:mt-20">
      {titulo ? (
        <motion.h3
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: countdownEase }}
          viewport={{ once: true, margin: '-48px' }}
          className="text-pretty font-montserrat text-[1.35rem] font-semibold leading-[1.25] tracking-tight text-palette-ink md:text-[1.65rem] md:leading-[1.22]"
        >
          {titulo}
        </motion.h3>
      ) : null}
      <motion.ul
        className="mt-7 space-y-[1.15rem] md:mt-9 md:space-y-5"
        variants={beneficioListVariants}
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-48px' }}
      >
        {beneficios.map((beneficio, i) => (
          <motion.li
            key={`${beneficio}-${i}`}
            variants={beneficioItemVariants}
            className="flex items-start gap-3.5 text-left md:gap-4"
          >
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              fill="none"
              className="mt-[0.28em] h-[1.05rem] w-[1.05rem] shrink-0 text-palette-ink md:mt-[0.32em] md:h-[1.15rem] md:w-[1.15rem]"
            >
              <path
                d="M3.5 10.4 8 15l8.5-10"
                stroke="currentColor"
                strokeWidth="2.15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-montserrat text-[1.05rem] font-normal leading-[1.45] text-palette-ink md:text-[1.18rem] md:leading-[1.48]">
              <EmphasisText text={beneficio} />
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

const CoursePlans = ({ plans = [], promociones = [], checkoutPlans = [] }: CoursePlansProps) => {
  const router = useRouter();
  const auth = useAuth();
  const { cursoConfig, plansSectionId, checkoutStartPath, slug, esSuscripcion } = useCursoLanding();
  const { planes } = cursoConfig;
  const preventaPricing = useCursoPreventaPricing(cursoConfig);
  const lanzamientoMonto = resolveCursoLanzamientoMonto(cursoConfig);
  const planesTitulo =
    preventaPricing.enPreventa && preventaPricing.fechaLanzamiento
      ? `Accedé a todo el método el ${formatCursoFechaLargo(preventaPricing.fechaLanzamiento)}`
      : planes.titulo;
  const sellosCorner = cursoConfig.mostrarSellosValidacion
    ? [...(cursoConfig.sellosValidacion || [])]
        .filter((s) => s.imagenPublicId?.trim())
        .sort((a, b) => a.orden - b.orden)
    : [];
  const selloCorner = sellosCorner[0] ?? null;
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [isNavigatingToCheckout, setIsNavigatingToCheckout] = useState(false);
  const activeCheckoutPlans = checkoutPlans.filter(
    (plan) =>
      plan.activo &&
      (Boolean(plan.paymentLink?.trim()) ||
        plan.proveedor === 'mercadopago' ||
        Boolean(plan.mercadoPagoPreferenceId))
  );
  const stripeCheckoutPlans = activeCheckoutPlans
    .filter((plan) => plan.proveedor === 'stripe')
    .slice()
    .sort(
      (a, b) =>
        resolveCursoPlanIntervaloMeses(a) - resolveCursoPlanIntervaloMeses(b)
    );
  const mostrarSuscripcion = isCursoCheckoutSuscripcion(
    esSuscripcion,
    activeCheckoutPlans
  );
  const [selectedIntervalo, setSelectedIntervalo] = useState(() =>
    stripeCheckoutPlans.some(
      (plan) =>
        resolveCursoPlanIntervaloMeses(plan) === CURSO_SUSCRIPCION_INTERVALO_4_MESES
    )
      ? CURSO_SUSCRIPCION_INTERVALO_4_MESES
      : CURSO_SUSCRIPCION_INTERVALO_MENSUAL
  );

  const handleGoToCheckout = useCallback(async () => {
    if (isNavigatingToCheckout) return;
    setIsNavigatingToCheckout(true);
    try {
      const ownedPath = await fetchOwnedCursoRedirectPath({ slug });
      if (ownedPath) {
        router.push(ownedPath);
        return;
      }
      router.push(
        mostrarSuscripcion
          ? `${checkoutStartPath}?intervalo=${selectedIntervalo}`
          : checkoutStartPath
      );
    } catch {
      setIsNavigatingToCheckout(false);
      toast.error('No pudimos abrir el checkout. Intentá de nuevo.');
    }
  }, [checkoutStartPath, isNavigatingToCheckout, mostrarSuscripcion, router, selectedIntervalo, slug]);
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
    priceCaption,
    badgeLabel,
    disableViewportEnter = false,
    showBonusUrgency = false,
  }: {
    plan: Plan;
    index: number;
    displayAmount?: number;
    showPreventaInfo?: boolean;
    fechaLanzamiento?: Date | null;
    preventaFechaFin?: Date | null;
    promocionesList?: Promocion[];
    priceCaption?: string;
    badgeLabel?: string;
    disableViewportEnter?: boolean;
    showBonusUrgency?: boolean;
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

    const countdownRemainingMs = preventaCountdownRemainingMs;
    const countdownLabel = 'Este precio de preventa termina en:';

    return (
      <motion.div
        id={`plan-card-${plan._id}`}
        key={plan._id}
        initial={disableViewportEnter ? false : { opacity: 0, y: 26 }}
        whileInView={disableViewportEnter ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        viewport={disableViewportEnter ? undefined : { once: true }}
        className={`group relative isolate flex h-auto w-full min-w-0 flex-col self-start overflow-hidden ${landingPlanCard} p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-palette-sage/40 hover:shadow-[0_28px_60px_-28px_rgba(20,20,17,0.2)] md:p-5`}
      >
        {/* Acentos sutiles (debajo del contenido y del precio) */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-sage/35 to-transparent opacity-90" />
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-palette-sage/[0.12] blur-3xl opacity-65" />
          <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-palette-stone/10 blur-3xl opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_60%_at_50%_0%,rgba(255,253,253,0.9),transparent_62%)] opacity-60" />
        </div>

        <div className="relative z-10 text-center text-palette-ink">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {hasPromo ? (
              <span className="pointer-events-auto font-montserrat text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-palette-ink">
                {promocionPlan?.porcentajeDescuento}% OFF
              </span>
            ) : badgeLabel ? (
              <span className="pointer-events-auto font-montserrat text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-palette-ink">
                {badgeLabel}
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 text-balance font-montserrat text-2xl font-semibold leading-tight tracking-tight text-palette-ink md:mt-2.5 md:text-4xl">
            <b>PRECIO</b>
            <br />{' '}
            <span className="relative bottom-1 text-2xl text-palette-ink md:bottom-2 md:text-4xl">
              {showPreventaInfo ? 'PREVENTA' : priceCaption || 'HOY'}
            </span>
          </h3>
          {showPreventaInfo && fechaLanzamiento ? (
            <p className="pointer-events-auto mt-2 font-montserrat text-[0.65rem] font-medium uppercase leading-snug tracking-[0.12em] text-palette-ink md:text-[0.7rem]">
              Lanzamiento: {formatCursoFechaLargo(fechaLanzamiento)}
            </p>
          ) : null}
        </div>

        <div className="relative z-10 flex items-end justify-center gap-1 py-3 md:py-3.5">
          <p className="text-center font-montserrat text-[2.75rem] font-bold leading-none tracking-[-0.09em] text-palette-ink tabular-nums md:text-[3.5rem]">
            <b>{new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(precioPrincipal)}</b>
          </p>
          <span className="relative bottom-1 font-montserrat text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-palette-ink md:bottom-1.5 md:text-[0.58rem]">
            USD
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center text-palette-ink">
          {ahorroPromo !== null && ahorroPromo > 0 ? (
            <p className="pointer-events-auto mb-3 text-base font-light text-palette-ink">
              Ahorrás{' '}
              <span className="font-semibold text-palette-ink">{formatPrice(plan.currency, ahorroPromo)}</span>
            </p>
          ) : null}
          {showPreventaInfo ? (
            <div className="pointer-events-auto w-full border-t border-palette-ink/15 pt-3">
              <p className="font-montserrat text-[0.62rem] font-medium uppercase leading-snug tracking-[0.14em] text-palette-ink">
                {countdownLabel}
              </p>
              {preventaFechaFin ? (
                <p className="mt-1 font-montserrat text-[0.55rem] font-normal normal-case tracking-normal text-palette-ink/75">
                  Hasta el {formatCursoFechaConHora(preventaFechaFin)}
                </p>
              ) : null}
              <CountdownUnits remainingMs={countdownRemainingMs} />
            </div>
          ) : showBonusUrgency ? (
            <BonusUrgencyFooter />
          ) : null}
        </div>
        {/* CTA se renderiza fuera del card (abajo del bloque 3D). */}
      </motion.div>
    );
  };

  const resolvePrecioReferencia = (
    plan: Plan,
    referenceAmount?: number | null,
  ) => {
    if (referenceAmount != null && referenceAmount > 0) {
      return Math.round(referenceAmount);
    }
    return Math.round((plan.amount || 0) * 3);
  };

  const PrecioAnteriorCompact = ({
    plan,
    currentAmount,
    referenceAmount,
  }: {
    plan: Plan;
    currentAmount: number;
    referenceAmount?: number | null;
  }) => {
    const precioReferencia = resolvePrecioReferencia(plan, referenceAmount);
    const precioActual = Math.round(currentAmount);
    const ahorro = Math.max(0, precioReferencia - precioActual);
    if (precioReferencia <= 0 || ahorro <= 0) return null;

    const formatNum = (n: number) =>
      new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="mt-3 flex flex-col items-center gap-1.5 px-2 text-center md:mt-4"
      >
        <p className="font-montserrat text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-palette-ink/70">
          Precio anterior{' '}
          <span className="relative inline-block tabular-nums text-palette-ink/60">
            <span className="line-through decoration-red-600/80 decoration-2">
              {formatNum(precioReferencia)}
            </span>{' '}
            <span className="text-[0.55rem] tracking-[0.16em]">USD</span>
          </span>
        </p>
        <p className="font-montserrat text-sm font-semibold tracking-tight text-palette-ink md:text-base">
          Ahorrás{' '}
          <span className="tabular-nums">
            {formatPrice(plan.currency || 'USD', ahorro)}
          </span>
        </p>
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
    const precioReferencia = resolvePrecioReferencia(plan, referenceAmount);
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
            src={planes.imagenPagosUrl || '/images/logos/tarjetasmpstripe2.png'}
            alt={planes.imagenPagosAlt || 'Pagos con Mercado Pago y Stripe.'}
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
            Hasta 12 cuotas · Uruguay y Latinoamérica
          </p>
        </div>
      </motion.div>
    );
  };

  const SelloRecomendacionCard = () => {
    if (!selloCorner) return null;

    const image = (
      <CldImage
        src={selloCorner.imagenPublicId}
        alt={selloCorner.alt || 'Sello de validación'}
        width={480}
        height={240}
        className="h-auto max-h-[10.5rem] w-full max-w-[min(100%,15rem)] object-contain drop-shadow-[0_12px_28px_rgba(20,20,17,0.14)] md:max-h-[11.5rem] md:max-w-[16rem]"
      />
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className={`relative isolate flex h-full min-h-[20.5rem] w-full min-w-0 flex-col overflow-hidden ${landingPlanCardSide} p-5 text-center text-palette-ink sm:min-h-[21rem] md:min-h-[20rem] md:p-5`}
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-palette-sage/[0.12] blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-sage/30 to-transparent opacity-80" />
        </div>

        <div className="relative z-20 shrink-0 px-1 pt-2 text-center md:pt-3">
          <h3 className="text-balance font-montserrat text-[clamp(1.2rem,3.1vw,1.72rem)] font-semibold tracking-tight leading-tight text-palette-ink">
            <b>PRODUCTO</b>
            <br />{' '}
            <span className="relative bottom-1 text-xl text-palette-ink md:bottom-2 md:text-2xl">
              RECOMENDADO POR:
            </span>
          </h3>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-3 pb-4 pt-6 md:pb-5 md:pt-8">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.04 }}
          >
            {selloCorner.enlace?.trim() ? (
              <a
                href={selloCorner.enlace.trim()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={
                  selloCorner.alt ||
                  cursoConfig.sellosValidacionTitulo ||
                  'Sello de validación'
                }
                className="block"
              >
                {image}
              </a>
            ) : (
              image
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const PlansCheckoutFooter = ({
    cta,
    disclaimer,
  }: {
    cta: ReactNode;
    disclaimer?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="mx-auto mt-10 max-w-3xl px-4 text-center md:mt-14"
    >
      {cta}
      {disclaimer ? (
        <p className="mt-4 font-raleway text-sm text-palette-stone">{disclaimer}</p>
      ) : (
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
      )}
    </motion.div>
  );

  const toCheckoutDisplayPlan = (
    checkoutPlan: CursoPlanPago,
    amount: number,
    id: string,
    frequencyLabel: string
  ): Plan =>
    ({
      _id: id,
      id,
      merchant_id: '',
      name: checkoutPlan.etiqueta,
      description: checkoutPlan.descripcion,
      amount,
      currency: checkoutPlan.moneda,
      country: '',
      frequency_type: 'one_time',
      frequency_value: 1,
      frequency_label: frequencyLabel,
      active: true,
      plan_token: '',
      back_url: '',
      notification_url: '',
      success_url: '',
      error_url: '',
      createdAt: '',
      provider: checkoutPlan.proveedor,
    }) as Plan;

  const renderThreeCardLayout = ({
    displayPlan,
    displayAmount,
    showPreventaInfo = false,
    priceCaption,
    badgeLabel,
    disableViewportEnter = false,
    showPrecioAnterior = true,
    showBonusUrgency = false,
  }: {
    displayPlan: Plan;
    displayAmount: number;
    showPreventaInfo?: boolean;
    priceCaption?: string;
    badgeLabel?: string;
    disableViewportEnter?: boolean;
    showPrecioAnterior?: boolean;
    showBonusUrgency?: boolean;
  }) => (
    <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-6 lg:gap-7">
      <div className="order-2 flex h-auto min-h-0 items-start md:order-1 md:h-full md:col-span-4 md:items-stretch md:pt-10 md:[transform:translateZ(-80px)_rotateY(9deg)]">
        <motion.div className="h-auto w-full md:h-full md:min-h-0 md:translate-x-5 md:scale-[0.96] md:opacity-90">
          {selloCorner ? (
            <SelloRecomendacionCard />
          ) : (
            <PriceReferenceCard
              plan={displayPlan}
              referenceAmount={preventaPricing.enPreventa ? lanzamientoMonto : null}
            />
          )}
        </motion.div>
      </div>
      <div className="order-1 flex h-full min-h-0 flex-col md:order-2 md:col-span-4 md:[transform:translateZ(60px)]">
        <PlanCard
          plan={displayPlan}
          index={0}
          displayAmount={displayAmount}
          showPreventaInfo={showPreventaInfo}
          fechaLanzamiento={preventaPricing.fechaLanzamiento}
          preventaFechaFin={preventaPricing.preventaFechaFin}
          priceCaption={priceCaption}
          badgeLabel={badgeLabel}
          disableViewportEnter={disableViewportEnter}
          showBonusUrgency={showBonusUrgency}
        />
        {selloCorner && showPrecioAnterior ? (
          <PrecioAnteriorCompact
            plan={displayPlan}
            currentAmount={displayAmount}
            referenceAmount={preventaPricing.enPreventa ? lanzamientoMonto : null}
          />
        ) : null}
      </div>
      <div className="order-3 flex h-full min-h-0 md:order-3 md:col-span-4 md:pt-10 md:[transform:translateZ(-80px)_rotateY(-9deg)]">
        <motion.div className="h-full min-h-0 w-full md:-translate-x-5 md:scale-[0.96] md:opacity-90">
          <UruguayPaymentsCard />
        </motion.div>
      </div>
    </motion.div>
  );

  const renderPlans = () => {
    if (mostrarSuscripcion && stripeCheckoutPlans.length > 0) {
      const selectedPlan =
        stripeCheckoutPlans.find(
          (plan) => resolveCursoPlanIntervaloMeses(plan) === selectedIntervalo
        ) ?? stripeCheckoutPlans[0];
      const selectedInterval = resolveCursoPlanIntervaloMeses(selectedPlan);
      const is4Meses = selectedInterval === CURSO_SUSCRIPCION_INTERVALO_4_MESES;
      const displayPlan = toCheckoutDisplayPlan(
        selectedPlan,
        selectedPlan.monto,
        `curso-checkout-${selectedInterval}`,
        is4Meses ? 'Cada 4 meses' : 'Mensual'
      );

      return (
        <motion.div className="mx-auto max-w-6xl">
          {stripeCheckoutPlans.length > 1 ? (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true }}
              className="mb-8 mt-2 flex justify-center md:mb-10"
            >
              <div
                className="relative isolate flex gap-2.5 rounded-full p-1"
                role="radiogroup"
                aria-label="Plan de suscripción"
              >
                {stripeCheckoutPlans.map((plan) => {
                  const intervalo = resolveCursoPlanIntervaloMeses(plan);
                  const isActive = selectedIntervalo === intervalo;
                  const is4 = intervalo === CURSO_SUSCRIPCION_INTERVALO_4_MESES;

                  if (is4) {
                    return (
                      <OfertaSelectorButton
                        key={intervalo}
                        isActive={isActive}
                        onSelect={() => setSelectedIntervalo(intervalo)}
                      />
                    );
                  }

                  return (
                    <button
                      key={intervalo}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      className={`relative z-10 rounded-full px-7 py-2.5 font-montserrat text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-palette-ink text-palette-cream shadow-md'
                          : 'font-medium text-palette-stone hover:bg-white/80 hover:text-palette-ink'
                      }`}
                      onClick={() => setSelectedIntervalo(intervalo)}
                    >
                      Mensual
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : null}

          <motion.div
            key={selectedIntervalo}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderThreeCardLayout({
              displayPlan,
              displayAmount: selectedPlan.monto,
              priceCaption: is4Meses ? '4 MESES' : 'MENSUAL',
              badgeLabel: is4Meses ? 'OFERTA' : undefined,
              disableViewportEnter: true,
              showPrecioAnterior: !is4Meses,
              showBonusUrgency: is4Meses,
            })}
          </motion.div>

          <PlansCheckoutFooter
            cta={
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
                    <span>Quiero formar parte</span>
                    <span className="opacity-80 translate-y-[0.5px] transition-transform duration-200">
                      →
                    </span>
                  </>
                )}
              </button>
            }
            disclaimer="Sin contratos largos. Cancelá cuando quieras."
          />

          <PlanesBeneficiosList
            titulo={CURSO_SUSCRIPCION_INCLUDES_TITULO}
            beneficios={CURSO_SUSCRIPCION_INCLUDES}
          />
        </motion.div>
      );
    }

    if (activeCheckoutPlans.length > 0) {
      const displayCheckoutPlan = activeCheckoutPlans[0];
      const checkoutDisplayAmount =
        preventaPricing.enPreventa && preventaPricing.precioPreventaActivo
          ? preventaPricing.precioPreventaActivo.monto
          : displayCheckoutPlan.monto;
      const displayPlan = toCheckoutDisplayPlan(
        displayCheckoutPlan,
        checkoutDisplayAmount,
        'curso-checkout',
        'Pago único'
      );

      return (
        <motion.div className="mx-auto max-w-6xl">
          {renderThreeCardLayout({
            displayPlan,
            displayAmount: checkoutDisplayAmount,
            showPreventaInfo: preventaPricing.enPreventa,
          })}

          <PlansCheckoutFooter
            cta={
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
            }
          />
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
              {selloCorner ? (
                <SelloRecomendacionCard />
              ) : (
                <PriceReferenceCard
                  plan={displayPlan}
                  referenceAmount={
                    preventaPricing.enPreventa ? lanzamientoMonto : null
                  }
                />
              )}
            </div>
          </div>

          {/* Centro: plan principal */}
          <motion.div className="order-1 flex h-full min-h-0 flex-col md:order-2 md:col-span-4 md:[transform:translateZ(60px)]">
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
            {selloCorner ? (
              <PrecioAnteriorCompact
                plan={displayPlan}
                currentAmount={
                  preventaPricing.enPreventa && preventaPricing.precioPreventaActivo
                    ? preventaPricing.precioPreventaActivo.monto
                    : displayPlan.amount
                }
                referenceAmount={
                  preventaPricing.enPreventa ? lanzamientoMonto : null
                }
              />
            ) : null}
          </motion.div>

          {/* Derecha: cuotas / MercadoPago Uruguay */}
          <div className="order-3 flex h-full min-h-0 md:order-3 md:col-span-4 md:pt-10 md:[transform:translateZ(-80px)_rotateY(-9deg)]">
            <div className="h-full min-h-0 w-full md:-translate-x-5 md:scale-[0.96] md:opacity-90">
              <UruguayPaymentsCard />
            </div>
          </div>
        </div>

        <PlansCheckoutFooter
          cta={
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
          }
        />
      </div>
    );
  };

  return (
    <>
    <section
      className={`${landingSectionShell} relative overflow-visible py-14 md:py-20`}
      id={plansSectionId}
    >
      <div className={`relative ${landingSectionContainer} text-center`}>
        <motion.div
          {...landingFadeUp}
          className={`${landingHeaderBlock} relative z-10 mx-auto max-w-3xl text-center`}
        >
          <p className={landingEyebrow}>Inversión</p>
          <h2 className={landingSectionTitle}>{planesTitulo}</h2>
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
          className={`${landingSectionBody} relative z-10 mx-auto mb-10 max-w-3xl space-y-4 text-balance text-center md:mb-14 md:max-w-4xl md:space-y-5`}
        >
          {planes.parrafosValor.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </motion.div>

        <div className="relative z-10 [perspective:1200px]">
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
