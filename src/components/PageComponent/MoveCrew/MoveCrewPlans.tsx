'use client'
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plan } from '../../../../typings';
import { useAuth } from '../../../hooks/useAuth';
import state from '../../../valtio';
import endpoints from '../../../services/api';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { MiniLoadingSpinner } from '../Products/MiniSpinner';

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
  }, [auth.user]);

  const handleSelect = async (plan: Plan) => {
    // Si el usuario no está logueado, abrir el modal de login
    if (!auth.user) {
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

  return (
    <section className="py-20 bg-white font-montserrat" id="move-crew-plans">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-gray-500 mb-3">Inversión</p>
          <h2 className="text-3xl md:text-5xl font-bold text-black">Elegí el ciclo que mejor va con vos</h2>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto font-light mt-4">
            Te ofrezco planes mensuales y trimestrales para que puedas sumarte cuando estés listo/a. Elijas el que elijas, vas a acceder a toda mi biblioteca, desafíos, comunidad y soporte.
          </p>
        </motion.div>

        {activePlans.length === 0 ? (
          <div className="relative bg-gradient-to-br from-gray-50 via-amber-50/20 to-orange-50/10 border border-amber-200/40 rounded-3xl p-10 text-center text-gray-700 font-light overflow-hidden">
            {/* Decoración sutil de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-3xl" />
            
            <div className="relative z-10">
            <p>
              Estamos actualizando los planes de Move Crew en este momento. Si querés reservar tu lugar, escribime a <a href="mailto:hola@mformove.com" className="underline">hola@mformove.com</a> o tocá el botón para recibir novedades.
            </p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.open('mailto:hola@mformove.com');
                }
              }}
              className="mt-6 bg-gradient-to-r from-amber-700 to-orange-700 text-white px-10 py-3 rounded-2xl text-sm md:text-base hover:from-amber-800 hover:to-orange-800 transition-all duration-300 shadow-lg shadow-amber-500/20"
            >
              Recibir novedades
            </button>
            </div>
          </div>
        ) : (
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
                className="relative border border-amber-200/40 rounded-3xl p-8 bg-gradient-to-br from-gray-50 via-amber-50/20 to-orange-50/10 overflow-hidden flex flex-col h-full min-h-[600px] transition-all duration-300"
              >
                {/* Decoración sutil de fondo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-3xl" />
                
                <div className="relative z-10 flex flex-col flex-grow">
                      {promocionPlan && (
                        <div className="mb-3 bg-gradient-to-r from-amber-700 to-orange-700 text-white px-4 py-2 rounded-lg inline-block shadow-lg shadow-amber-500/20">
                          <p className="text-sm font-semibold">{promocionPlan.porcentajeDescuento}% OFF - {promocionPlan.nombre}</p>
                        </div>
                      )}
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{plan.frequency_label}</p>
                      <h3 className="text-2xl md:text-3xl font-semibold mt-2 mb-3 text-black">{plan.name}</h3>
                      <p className="text-sm md:text-base text-gray-600 mb-6 font-light">{plan.description}</p>
                      <div className="mb-6">
                        {promocionPlan && precioConDescuento ? (
                          <>
                            <p className="text-2xl line-through text-gray-400">{formatPrice(plan.currency, plan.amount)}</p>
                            <p className="text-4xl font-bold text-amber-700 mt-1">{formatPrice(plan.currency, Math.round(precioConDescuento))}</p>
                            <p className="text-gray-500 text-sm font-light mt-1">
                              Facturación {plan.frequency_label?.toLowerCase()}
                            </p>
                            <p className="text-amber-700 text-sm font-semibold mt-1">
                              Ahorras {formatPrice(plan.currency, Math.round(plan.amount - precioConDescuento))}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-4xl font-bold text-black">{formatPrice(plan.currency, plan.amount)}</p>
                            <p className="text-gray-500 text-sm font-light mt-1">
                              Facturación {plan.frequency_label?.toLowerCase()}
                            </p>
                          </>
                        )}
                      </div>
                <div className="space-y-3 text-sm md:text-base text-gray-700 font-light mb-8 flex-grow">
                  <p>• Acceso completo a prácticas y biblioteca de recursos.</p>
                  <p>• Comunidad privada y desafíos trimestrales.</p>
                  <p>• Material educativo y recordatorios para sostener tu proceso.</p>
                </div>
                <button
                  onClick={() => handleSelect(plan)}
                  disabled={loadingPlanId === plan._id}
                  className="w-full bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-2xl py-3 font-semibold text-sm md:text-base hover:from-amber-800 hover:to-orange-800 transition-all duration-300 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto"
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
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="relative mt-16 text-center bg-gradient-to-br from-amber-50/40 via-orange-50/20 to-rose-50/20 rounded-3xl p-8 md:p-12 border border-amber-200/40 overflow-hidden"
        >
          {/* Decoración sutil de fondo */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
          <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-black">
            Garantía de 30 días con condiciones claras
          </h3>
          <p className="text-base md:text-lg text-gray-600 font-light max-w-2xl mx-auto mb-4">
            Si después del primer mes sentís que Move Crew no es para vos, te devuelvo tu dinero. 
            Pero para acceder a la garantía necesitás cumplir mínimos razonables: haber completado al menos 6 sesiones (2 por semana), participar activamente en la comunidad 3 veces, y seguir las planificaciones propuestas.
          </p>
          <p className="text-sm md:text-base text-gray-500 font-light">
            La garantía protege a quienes realmente intentan, no a quienes quieren probar gratis.
          </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MoveCrewPlans;
