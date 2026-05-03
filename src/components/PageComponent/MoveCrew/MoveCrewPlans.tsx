'use client'
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plan } from '../../../../typings';
import { useAuth } from '../../../hooks/useAuth';
import state from '../../../valtio';
import endpoints from '../../../services/api';
import Cookies from 'js-cookie';
import { toast } from '../../../hooks/useToast';
import { useState, useEffect } from 'react';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';
import { savePlanIntent } from '../../../utils/redirectQueue';

interface Promocion {
  _id: string;
  nombre: string;
  descripcion?: string;
  porcentajeDescuento: number;
  frecuenciasAplicables: string[];
  fechaFin: string;
  codigoPromocional?: string;
}

interface MoveCrewPlansProps {
  plans: Plan[];
  promociones?: Promocion[];
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

const MoveCrewPlans = ({ plans, promociones = [] }: MoveCrewPlansProps) => {
  const router = useRouter();
  const auth = useAuth();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
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
  const anualMensualizado = annualPlan ? Math.round((annualPlan.amount || 0) / 12) : null;
  const ahorroAnual = annualPlan && monthlyPlan
    ? Math.max(0, Math.round(monthlyPlan.amount * 12 - annualPlan.amount))
    : null;

  // Función para obtener la promoción aplicable a un plan
  const getPromocionAplicable = (plan: Plan): Promocion | null => {
    if (!promociones || promociones.length === 0) return null;
    
    const ahora = new Date();
    const promocionesValidas = promociones.filter((p: Promocion) => {
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
  }, [auth.user, auth]);

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
    featured,
  }: {
    plan: Plan;
    index: number;
    featured?: boolean;
  }) => {
    const promocionPlan = getPromocionAplicable(plan);
    const hasPromo = Boolean(promocionPlan && promocionPlan.porcentajeDescuento > 0);
    const precioConDescuento = hasPromo
      ? plan.amount * (1 - (promocionPlan?.porcentajeDescuento ?? 0) / 100)
      : null;
    const ahorroPromo = hasPromo && precioConDescuento !== null
      ? Math.max(0, Math.round(plan.amount - precioConDescuento))
      : null;

    const precioPrincipal = precioConDescuento !== null ? Math.round(precioConDescuento) : plan.amount;
    const frecuencia = (plan.frequency_label || '').toLowerCase();

    return (
      <motion.div
        id={`plan-card-${plan._id}`}
        key={plan._id}
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className={`group relative overflow-hidden border rounded-2xl md:rounded-3xl p-7 md:p-9 transition-all duration-300 ${
          featured
            ? 'border-palette-stone/45 bg-white/60 shadow-[0_16px_48px_rgba(20,20,17,0.10)]'
            : 'border-palette-stone/25 bg-white/40 shadow-[0_10px_32px_rgba(20,20,17,0.06)]'
        } hover:-translate-y-0.5 hover:border-palette-stone/40 flex flex-col h-full`}
      >
        {/* Acentos sutiles, vibra editorial */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-palette-sage/35 to-transparent opacity-70" />
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-palette-sage/10 blur-3xl opacity-70" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-palette-stone/10 blur-3xl opacity-60" />
        </div>
        {featured && (
          <div className="absolute right-6 top-6 z-10">
            <p className="text-[11px] font-montserrat uppercase tracking-[0.22em] text-palette-ink bg-palette-cream/80 border border-palette-stone/25 px-3 py-1 rounded-full">
              Recomendado
            </p>
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone">
                {plan.frequency_label}
              </p>
              <h3 className="text-2xl md:text-3xl font-montserrat font-semibold mt-2 text-palette-ink tracking-tight">
                {plan.name}
              </h3>
            </div>

            {hasPromo && (
              <div className="shrink-0">
                <div className="bg-palette-sage/90 text-palette-cream px-3 py-1.5 rounded-full border border-palette-sage/50 shadow-sm">
                  <p className="text-[11px] font-montserrat font-semibold tracking-[0.22em] uppercase">
                    {promocionPlan?.porcentajeDescuento}% OFF
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-7 flex items-end justify-between gap-4">
            <div>
              {hasPromo && (
                <p className="text-sm text-palette-stone/70 line-through">
                  {formatPrice(plan.currency, plan.amount)}
                </p>
              )}
              <div className="flex items-end gap-3">
                <p className={`text-4xl md:text-5xl font-semibold tracking-tight ${featured ? 'text-palette-sage' : 'text-palette-ink'}`}>
                  {formatPrice(plan.currency, precioPrincipal)}
                </p>
                <p className="text-xs md:text-sm text-palette-stone font-light mb-1">
                  / {frecuencia || 'ciclo'}
                </p>
              </div>

              {(ahorroPromo !== null && ahorroPromo > 0) && (
                <p className="mt-2 text-sm text-palette-stone font-light">
                  Ahorrás <span className="font-semibold text-palette-ink">{formatPrice(plan.currency, ahorroPromo)}</span>
                </p>
              )}

              {!hasPromo && featured && ahorroAnual !== null && ahorroAnual > 0 && (
                <p className="mt-2 text-sm text-palette-stone font-light">
                  Ahorrás <span className="font-semibold text-palette-ink">{formatPrice(plan.currency, ahorroAnual)}</span> vs mensual
                </p>
              )}

              {featured && anualMensualizado !== null && (
                <p className="mt-2 text-xs text-palette-stone/80 font-light">
                  Equivale a {formatPrice(plan.currency, anualMensualizado)}/mes
                </p>
              )}
            </div>

            {featured && (
              <div className="hidden md:block shrink-0 text-right">
                <p className="text-xs uppercase tracking-[0.22em] text-palette-stone/70 font-montserrat">
                  Mejor valor
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto pt-7">
            <button
              onClick={() => handleSelect(plan)}
              disabled={loadingPlanId === plan._id}
              className={`w-full font-montserrat font-semibold text-sm uppercase tracking-[0.2em] rounded-full py-3 border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                featured
                  ? 'bg-palette-ink text-palette-cream border-palette-ink hover:bg-palette-sage hover:border-palette-sage'
                  : 'bg-palette-ink text-palette-cream border-palette-ink hover:bg-palette-sage hover:border-palette-sage'
              }`}
            >
              {loadingPlanId === plan._id ? (
                <>
                  <MiniLoadingSpinner />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>Elegir este plan</span>
                  <span className="opacity-80 translate-y-[0.5px] group-hover:translate-x-0.5 transition-transform duration-200">
                    →
                  </span>
                </>
              )}
            </button>
            <p className="mt-3 text-xs text-palette-stone/80 font-light">
              Facturación {frecuencia || plan.frequency_label?.toLowerCase()}.
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderPlans = () => {
    if (activePlans.length === 0) {
      return (
        <div className="relative bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-10 text-center md:text-left text-palette-stone font-light overflow-hidden shadow-[0_4px_24px_rgba(20,20,17,0.06)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-palette-stone/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p>
              Estoy actualizando los planes de Cuerpo autónomo en este momento. Si querés reservar tu lugar, escribime a <a href="mailto:hola@mformove.com" className="underline text-palette-sage hover:text-palette-ink">hola@mformove.com</a> o tocá el botón para recibir novedades.
            </p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.open('mailto:hola@mformove.com');
                }
              }}
              className="mt-6 font-montserrat font-semibold text-sm uppercase tracking-[0.2em] rounded-full px-6 py-3 bg-palette-ink text-palette-cream border-2 border-palette-ink hover:bg-palette-sage hover:border-palette-sage transition-all duration-200"
            >
              Recibir novedades
            </button>
          </div>
        </div>
      );
    }

    if (monthlyPlan && annualPlan) {
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <PlanCard plan={monthlyPlan} index={0} featured={false} />
            <PlanCard plan={annualPlan} index={1} featured />
          </div>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 gap-8">
        {activePlans.map((plan, index) => {
          return <PlanCard key={plan._id} plan={plan} index={index} featured={false} />;
        })}
      </div>
    );
  };

  return (
    <section className="py-16 md:py-20 bg-palette-cream font-montserrat" id="membership-plans">
      <div className="w-[85%] max-w-6xl mx-auto px-4 text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-12 text-start md:text-left"
        >
          <p className="font-montserrat uppercase tracking-[0.2em] text-xs md:text-sm text-palette-stone/80 mb-2">Inversión</p>
          <h2 className="text-2xl md:text-4xl font-montserrat font-semibold text-palette-ink tracking-tight mb-4">
            Elegí el ciclo que mejor va con vos
          </h2>

        </motion.div>

        {renderPlans()}

     
      </div>
    </section>
  );
};

export default MoveCrewPlans;
