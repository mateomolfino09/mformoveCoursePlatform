import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createStripeSubscription } from '../../createSubscription/createStripeSubscription';
import { updateStripeSubscription } from '../../updateSubscription/updateStripeSubscription';
import { sendSubscriptionEmail } from '../../createSubscription/getSubscriptionEmail';
import { getCurrentURL } from '../../../assets/getCurrentURL';
import { deleteStripeSubscription } from '../../cancelSubscription/deleteStripeSubscription';
import { getLatestSubscriptionStatusByEmail } from '../getSubscriptionStatusByMail';
import connectDB from '../../../../../config/connectDB';
import User from '../../../../../models/userModel.js';
import { EmailService } from '../../../../../services/email/emailService';
import CoherenceTracking from '../../../../../models/coherenceTrackingModel';

// Helper robusto para inicializar tracking incluso si el método estático no está disponible
const ensureCoherenceTracking = async (userId: any) => {
  const Model: any = CoherenceTracking;
  // Si el método existe, úsalo
  if (Model?.getOrCreate) {
    return Model.getOrCreate(userId);
  }
  // Fallback manual
  let tracking = await Model.findOne({ userId });
  if (!tracking) {
    tracking = new Model({
      userId,
      totalUnits: 0,
      currentStreak: 0,
      longestStreak: 0,
      achievements: [],
      level: 1,
      monthsCompleted: 0,
      characterEvolution: 0,
      completedMonths: [],
      weeklyCompletions: [],
      completedDays: [],
      completedWeeks: [],
      completedVideos: [],
      completedAudios: []
    });
    await tracking.save();
  }
  return tracking;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
connectDB();

export const POST = async (req: NextRequest) => {
  if (req.method === 'POST') {
    const sig = headers().get('stripe-signature') as string;
    const body = await req.text();
    let event;
    const origin = getCurrentURL();

    try {
      // Verifica que el webhook proviene de Stripe
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error(`Error al verificar la firma del webhook: ${err?.message}`);
      return new NextResponse("Invalido", {status:400})
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
    const session = event.data.object as Stripe.Checkout.Session;
          
          // Verificar si es una membresía
          const isMembership = session.metadata?.type === 'membership';
          
          if (isMembership) {
            const customerEmail = session.customer_details?.email || session.metadata?.email;
            
            if (customerEmail) {
              console.log(`✅ Checkout completado para membresía: ${customerEmail}`);
              // La suscripción se procesará cuando llegue el evento customer.subscription.created
              // Este evento solo sirve como log/confirmación
            }
          }
          break;
        }

        case 'customer.subscription.created': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const customer = await stripe.customers.retrieve(customerId);
      const email = (customer as Stripe.Customer).email;
          
          // Verificar si es una membresía desde el metadata de la suscripción
          const isMembership = subscription.metadata?.type === 'membership';
          
          if (isMembership && email) {
            console.log(`✅ Procesando creación de suscripción de membresía para: ${email}`);
            console.log(`📧 Email del usuario detectado: ${email}`);
            
            try {
              const user = await createStripeSubscription(email);
              const status = await getLatestSubscriptionStatusByEmail(email);
              
              if (user) {
                console.log(`✅ Membresía creada exitosamente para: ${email}`);
                console.log(`👤 Usuario encontrado: ${user.name || 'Sin nombre'} (${user.email})`);
                console.log(`📊 Estado de suscripción: ${status}`);

                // Inicializar tracking de coherencia para Move Crew
                try {
                  await ensureCoherenceTracking(user._id);
                  console.log(`🦍 Tracking inicial de coherencia creado para: ${user.email}`);
                } catch (trackingErr) {
                  console.error(`❌ Error creando tracking de coherencia para ${user.email}:`, trackingErr);
                }
                
                const emailService = EmailService.getInstance();
                
                // Enviar email de bienvenida al usuario
                try {
                  console.log(`📨 Enviando email de bienvenida a: ${user.email}`);
                  await emailService.sendWelcomeMembership({
                    email: user.email,
                    name: user.name || 'Miembro',
                    dashboardUrl: `${origin}/home`
                  });
                  console.log(`✅ Email de bienvenida enviado exitosamente a: ${user.email}`);
                } catch (emailErr) {
                  console.error(`❌ Error enviando email de bienvenida a ${user.email}:`, emailErr);
                }
                
                // Enviar email de notificación al administrador
                try {
                  const adminEmail = 'mateomolfino09@gmail.com';
                  console.log(`📨 Enviando notificación de membresía al administrador: ${adminEmail}`);
                  await emailService.sendAdminMembershipNotification({
                    userName: user.name || 'Sin nombre',
                    userEmail: user.email,
                    userId: user._id?.toString() || 'N/A',
                    planName: subscription.metadata?.planName || 'Move Crew',
                    subscriptionId: subscription.id,
                    activationDate: new Date().toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }),
                    adminUrl: `${origin}/admin`
                  }, adminEmail);
                  console.log(`✅ Notificación de administrador enviada exitosamente a: ${adminEmail}`);
                } catch (adminEmailErr) {
                  console.error(`❌ Error enviando notificación al administrador:`, adminEmailErr);
                }
                
                // NO enviar email genérico al admin para membresías - ya tenemos emails específicos
                // El email genérico solo se envía al usuario si es necesario
              } else {
                console.error(`❌ Error al crear membresía para: ${email}`);
              }
            } catch (err) {
              console.error("❌ Error al procesar la subscripción creada:", err);
            }
          } else if (email) {
            // Procesar otras suscripciones (no membresías)
            const status = await getLatestSubscriptionStatusByEmail(email);
            
            if(status != null) {
            try {
                const user = await createStripeSubscription(email);
              if (status === "trialing") {
                await sendSubscriptionEmail(status, "mateomolfino09@gmail.com", origin);
              }
            } catch (err) {
              console.error("Error al procesar la subscripción creada:", err);
            }
            }
          }
            break;
          }
        
          case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const customer = await stripe.customers.retrieve(customerId);
          const email = (customer as Stripe.Customer).email;
          const status = await getLatestSubscriptionStatusByEmail(email ?? "");
      
          if(status != null) {
            try {
              const updatedSubscription = await updateStripeSubscription(email ?? "");
              const isMembership = subscription.metadata?.type === 'membership';
              
              //al cancelar el estado se mantiene hasta el fin del periodo, por eso chequeamos isCanceled
              if (updatedSubscription?.isCanceled && (status == "trialing" || status == "active")) {
                // NO enviar email genérico al admin si es una membresía - ya tenemos emails específicos
                // Si NO es membresía, enviar email genérico al admin
                if (!isMembership) {
                  await sendSubscriptionEmail("canceled", "mateomolfino09@gmail.com", origin);
                }
                
                // Si es una membresía, enviar email de cancelación al usuario
                if (isMembership && email) {
                  try {
                    const user = await User.findOne({ email });
                    if (user) {
                      const emailService = EmailService.getInstance();
                      const periodEnd = subscription.current_period_end 
                        ? new Date(subscription.current_period_end * 1000).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : null;
                      
                      console.log(`📨 Enviando email de cancelación a: ${user.email}`);
                      await emailService.sendSubscriptionCancelled({
                        email: user.email,
                        name: user.name || 'Miembro',
                        planName: subscription.metadata?.planName || 'Move Crew',
                        cancellationDate: new Date().toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }),
                        accessUntil: periodEnd,
                        feedbackUrl: `${origin}/contact?reason=cancellation&email=${encodeURIComponent(user.email)}`,
                        reactivateUrl: `${origin}/move-crew`
                      });
                      console.log(`✅ Email de cancelación enviado exitosamente a: ${user.email}`);
                      
                      // Enviar email de notificación al administrador
                      try {
                        const adminEmail = 'mateomolfino09@gmail.com';
                        console.log(`📨 Enviando notificación de cancelación al administrador: ${adminEmail}`);
                        await emailService.sendAdminSubscriptionCancelled({
                          userName: user.name || 'Sin nombre',
                          userEmail: user.email,
                          userId: user._id?.toString() || 'N/A',
                          planName: subscription.metadata?.planName || 'Move Crew',
                          subscriptionId: subscription.id,
                          cancellationDate: new Date().toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }),
                          accessUntil: periodEnd,
                          adminUrl: `${origin}/admin`
                        }, adminEmail);
                        console.log(`✅ Notificación de cancelación enviada exitosamente al administrador: ${adminEmail}`);
                      } catch (adminEmailErr) {
                        console.error(`❌ Error enviando notificación de cancelación al administrador:`, adminEmailErr);
                      }
                    }
                  } catch (emailErr) {
                    console.error(`❌ Error enviando email de cancelación a ${email}:`, emailErr);
                  }
                }
              } else {
                // Solo enviar email genérico si NO es una membresía (las membresías tienen emails específicos)
                if (!isMembership) {
                  await sendSubscriptionEmail(status, "mateomolfino09@gmail.com", origin);
                }
              }

            } catch (err) {
              console.error("Error al procesar la subscripción actualizada:", err);
            }
          }
            break;
          }
        
          case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const customer = await stripe.customers.retrieve(customerId);
          const email = (customer as Stripe.Customer).email;
          const isMembership = subscription.metadata?.type === 'membership';
          
          if (email) {
            const user = await deleteStripeSubscription(email);
            
            // Si es una membresía, enviar email de cancelación al usuario
            if (isMembership && user) {
              try {
                const emailService = EmailService.getInstance();
                console.log(`📨 Enviando email de cancelación (eliminada) a: ${user.email}`);
                await emailService.sendSubscriptionCancelled({
                  email: user.email,
                  name: user.name || 'Miembro',
                  planName: subscription.metadata?.planName || 'Move Crew',
                  cancellationDate: new Date().toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }),
                  accessUntil: null, // Ya no tiene acceso
                  feedbackUrl: `${origin}/contact?reason=cancellation&email=${encodeURIComponent(user.email)}`,
                  reactivateUrl: `${origin}/move-crew`
                });
                console.log(`✅ Email de cancelación enviado exitosamente a: ${user.email}`);
                
                // Enviar email de notificación al administrador
                try {
                  const adminEmail = 'mateomolfino09@gmail.com';
                  console.log(`📨 Enviando notificación de cancelación (eliminada) al administrador: ${adminEmail}`);
                  await emailService.sendAdminSubscriptionCancelled({
                    userName: user.name || 'Sin nombre',
                    userEmail: user.email,
                    userId: user._id?.toString() || 'N/A',
                    planName: subscription.metadata?.planName || 'Move Crew',
                    subscriptionId: subscription.id,
                    cancellationDate: new Date().toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }),
                    accessUntil: null,
                    adminUrl: `${origin}/admin`
                  }, adminEmail);
                  console.log(`✅ Notificación de cancelación (eliminada) enviada exitosamente al administrador: ${adminEmail}`);
                } catch (adminEmailErr) {
                  console.error(`❌ Error enviando notificación de cancelación al administrador:`, adminEmailErr);
                }
              } catch (emailErr) {
                console.error(`❌ Error enviando email de cancelación a ${email}:`, emailErr);
              }
            }
          // Aquí podrías revocar acceso a contenido premium
          }
            break;
          }
        
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;
          const customer = await stripe.customers.retrieve(customerId);
          const email = (customer as Stripe.Customer).email;
          
          if (email && invoice.subscription) {
            try {
              // Obtener la suscripción para verificar si es una membresía
              const subscriptionId = typeof invoice.subscription === 'string' 
                ? invoice.subscription 
                : invoice.subscription.id;
              const subscription = await stripe.subscriptions.retrieve(subscriptionId);
              const isMembership = subscription.metadata?.type === 'membership';
              
              if (isMembership) {
                const user = await User.findOne({ email });
                if (user) {
                  const emailService = EmailService.getInstance();
                  const amount = invoice.amount_due ? (invoice.amount_due / 100).toFixed(2) : null;
                  const planName = subscription.metadata?.planName || 'Move Crew';
                  
                  console.log(`📨 Enviando email de pago fallido a: ${user.email}`);
                  await emailService.sendPaymentFailed({
                    email: user.email,
                    name: user.name || 'Miembro',
                    productName: planName,
                    amount: amount || undefined,
                    paymentDate: new Date().toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }),
                    errorMessage: (invoice as any).last_payment_error?.message || 'No se pudo procesar el pago. Por favor, verifica tu método de pago.',
                    retryUrl: `${origin}/move-crew`,
                    feedbackUrl: `${origin}/contact?reason=payment&email=${encodeURIComponent(user.email)}`
                  });
                  console.log(`✅ Email de pago fallido enviado exitosamente a: ${user.email}`);
                  
                  // Enviar email de notificación al administrador
                  try {
                    const adminEmail = 'mateomolfino09@gmail.com';
                    console.log(`📨 Enviando notificación de pago fallido al administrador: ${adminEmail}`);
                    await emailService.sendAdminPaymentFailed({
                      userName: user.name || 'Sin nombre',
                      userEmail: user.email,
                      userId: user._id?.toString() || 'N/A',
                      planName: planName,
                      productName: planName,
                      amount: amount || undefined,
                      paymentDate: new Date().toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }),
                      errorMessage: (invoice as any).last_payment_error?.message || 'No se pudo procesar el pago',
                      subscriptionId: subscription.id,
                      invoiceId: invoice.id,
                      adminUrl: `${origin}/admin`
                    }, adminEmail);
                    console.log(`✅ Notificación de pago fallido enviada exitosamente al administrador: ${adminEmail}`);
                  } catch (adminEmailErr) {
                    console.error(`❌ Error enviando notificación de pago fallido al administrador:`, adminEmailErr);
                  }
                }
              }
            } catch (err) {
              console.error(`❌ Error procesando invoice.payment_failed para ${email}:`, err);
            }
          }
          break;
        }
      
        default:
          break;
      }
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      return new NextResponse("Error procesando webhook", {status:500});
    }

    return new NextResponse("Evento recibido", {status:200})
  } else {
    return new NextResponse("Método no permitido", {status:405})
  }
}