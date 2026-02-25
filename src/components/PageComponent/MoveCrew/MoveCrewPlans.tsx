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

  const renderPlans = () => {
    if (activePlans.length === 0) {
      return (
        <div className="relative bg-palette-cream border border-palette-stone/25 rounded-2xl md:rounded-3xl p-10 text-center md:text-left text-palette-stone font-light overflow-hidden shadow-[0_4px_24px_rgba(20,20,17,0.06)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-palette-stone/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p>
              Estoy actualizando los planes de Move Crew en este momento. Si querés reservar tu lugar, escribime a <a href="mailto:hola@mformove.com" className="underline text-palette-sage hover:text-palette-ink">hola@mformove.com</a> o tocá el botón para recibir novedades.
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
            {[monthlyPlan, annualPlan].map((plan, index) => {
              const promocionPlan = getPromocionAplicable(plan);
              const precioConDescuento = promocionPlan
                ? plan.amount * (1 - promocionPlan.porcentajeDescuento / 100)
                : null;

              return (
                <motion.div
                  id={`plan-card-${plan._id}`}
                  key={plan._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative border rounded-2xl md:rounded-3xl p-8 overflow-hidden flex flex-col h-full min-h-[600px] transition-all duration-300 ${
                    plan._id === annualPlan._id
                      ? 'border-palette-stone/50 bg-palette-stone/10 shadow-[0_8px_32px_rgba(20,20,17,0.08)] scale-[1.02]'
                      : 'border-palette-stone/25 bg-palette-cream shadow-[0_4px_24px_rgba(20,20,17,0.06)]'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-palette-stone/10 rounded-full blur-3xl" />

                  <div className="relative z-10 flex flex-col flex-grow">
                    {promocionPlan && (
                      <div className="mb-3 bg-palette-sage text-palette-cream px-4 py-2 rounded-lg inline-block">
                        <p className="text-sm font-montserrat font-semibold">{promocionPlan.porcentajeDescuento}% OFF - {promocionPlan.nombre}</p>
                      </div>
                    )}
                    <p className="font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone">
                      {plan.frequency_label}
                      {plan._id === annualPlan._id && anualMensualizado !== null && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full bg-palette-stone/20 text-palette-ink text-[11px] font-semibold">
                          Equivale a {formatPrice(plan.currency, anualMensualizado)}/mes
                        </span>
                      )}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-montserrat font-semibold mt-2 mb-3 text-palette-ink tracking-tight">{plan.name}</h3>
                    <p className="text-sm md:text-base text-palette-stone mb-6 font-light">{plan.description}</p>
                    <div className="mb-6">
                      {promocionPlan && precioConDescuento ? (
                        <>
                          <p className="text-2xl line-through text-palette-stone/70">{formatPrice(plan.currency, plan.amount)}</p>
                          <p className="text-4xl font-bold text-palette-sage mt-1">{formatPrice(plan.currency, Math.round(precioConDescuento))}</p>
                          <p className="text-palette-stone text-sm font-light mt-1">
                            Facturación {plan.frequency_label?.toLowerCase()}
                          </p>
                          <p className="text-palette-stone text-sm font-semibold mt-1">
                            Ahorras {formatPrice(plan.currency, Math.round(plan.amount - precioConDescuento))}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-end gap-2">
                            <p className={`text-4xl font-bold ${plan._id === annualPlan._id ? 'text-palette-sage' : 'text-palette-ink'}`}>
                              {formatPrice(plan.currency, plan.amount)}
                            </p>
                            {plan._id === annualPlan._id && ahorroAnual !== null && ahorroAnual > 0 && (
                              <span className="text-sm font-semibold text-palette-ink bg-palette-stone/20 px-2 py-1 rounded-full">
                                Ahorras {formatPrice(plan.currency, ahorroAnual)}
                              </span>
                            )}
                          </div>
                          <p className="text-palette-stone text-sm font-light mt-1">
                            Facturación {plan.frequency_label?.toLowerCase()}
                          </p>
                          {plan._id === monthlyPlan._id && (
                            <p className="text-xs text-palette-stone mt-1">
                              Paga mes a mes, cancela cuando quieras.
                            </p>
                          )}
                          {plan._id === annualPlan._id && (
                            <p className="text-xs text-palette-stone font-semibold mt-1">
                              Mejor precio: bloquea 12 meses y asegura tu lugar.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div className="space-y-3 text-sm md:text-base text-palette-stone font-light mb-8 flex-grow">
                      <p>• Acceso completo a prácticas y biblioteca de recursos.</p>
                      <p>• Comunidad privada y desafíos trimestrales.</p>
                      <p>• Material educativo y recordatorios para sostener tu proceso.</p>
                    </div>
                    <button
                      onClick={() => handleSelect(plan)}
                      disabled={loadingPlanId === plan._id}
                      className="w-full font-montserrat font-semibold text-sm uppercase tracking-[0.2em] rounded-full py-3 bg-palette-ink text-palette-cream border-2 border-palette-ink hover:bg-palette-sage hover:border-palette-sage transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto"
                    >
                      {loadingPlanId === plan._id ? (
                        <>
                          <MiniLoadingSpinner />
                          <span>Procesando...</span>
                        </>
                      ) : (
                        'Quiero unirme'
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 gap-8">
        {activePlans.map((plan, index) => {
          const promocionPlan = getPromocionAplicable(plan);
          const precioConDescuento = promocionPlan
            ? plan.amount * (1 - promocionPlan.porcentajeDescuento / 100)
            : null;

          return (
            <motion.div
              id={`plan-card-${plan._id}`}
              key={plan._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative border border-palette-stone/25 rounded-2xl md:rounded-3xl p-8 bg-palette-cream overflow-hidden flex flex-col h-full min-h-[600px] transition-all duration-300 shadow-[0_4px_24px_rgba(20,20,17,0.06)]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-palette-stone/10 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col flex-grow">
                {promocionPlan && (
                  <div className="mb-3 bg-palette-sage text-palette-cream px-4 py-2 rounded-lg inline-block">
                    <p className="text-sm font-montserrat font-semibold">{promocionPlan.porcentajeDescuento}% OFF - {promocionPlan.nombre}</p>
                  </div>
                )}
                <p className="font-montserrat text-xs uppercase tracking-[0.2em] text-palette-stone">{plan.frequency_label}</p>
                <h3 className="text-2xl md:text-3xl font-montserrat font-semibold mt-2 mb-3 text-palette-ink tracking-tight">{plan.name}</h3>
                <p className="text-sm md:text-base text-palette-stone mb-6 font-light">{plan.description}</p>
                <div className="mb-6">
                  {promocionPlan && precioConDescuento ? (
                    <>
                      <p className="text-2xl line-through text-palette-stone/70">{formatPrice(plan.currency, plan.amount)}</p>
                      <p className="text-4xl font-bold text-palette-sage mt-1">{formatPrice(plan.currency, Math.round(precioConDescuento))}</p>
                      <p className="text-palette-stone text-sm font-light mt-1">
                        Facturación {plan.frequency_label?.toLowerCase()}
                      </p>
                      <p className="text-palette-stone text-sm font-semibold mt-1">
                        Ahorras {formatPrice(plan.currency, Math.round(plan.amount - precioConDescuento))}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-palette-ink">{formatPrice(plan.currency, plan.amount)}</p>
                      <p className="text-palette-stone text-sm font-light mt-1">
                        Facturación {plan.frequency_label?.toLowerCase()}
                      </p>
                    </>
                  )}
                </div>
                <div className="space-y-3 text-sm md:text-base text-palette-stone font-light mb-8 flex-grow">
                  <p>• Acceso completo a prácticas y biblioteca de recursos.</p>
                  <p>• Comunidad privada y desafíos trimestrales.</p>
                  <p>• Material educativo y recordatorios para sostener tu proceso.</p>
                </div>
                <button
                  onClick={() => handleSelect(plan)}
                  disabled={loadingPlanId === plan._id}
                  className="w-full font-montserrat font-semibold text-sm uppercase tracking-[0.2em] rounded-full py-3 bg-palette-ink text-palette-cream border-2 border-palette-ink hover:bg-palette-sage hover:border-palette-sage transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto"
                >
                  {loadingPlanId === plan._id ? (
                    <>
                      <MiniLoadingSpinner />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    'Quiero unirme'
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="py-16 md:py-20 bg-palette-cream font-montserrat" id="move-crew-plans">
      <div className="w-[85%] max-w-6xl mx-auto px-4">
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
