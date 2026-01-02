import Users from '../../../../../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import mailchimp from "@mailchimp/mailchimp_marketing";
import { createCheckoutSession } from '../createCheckoutSession';
import Plan from '../../../../../models/planModel';
import Promocion from '../../../../../models/promocionModel';

export async function POST(req) {
    connectDB();
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_API_SERVER,
    });
    const { email, planId } = await req.json();
    
    try {
      if (req.method === 'POST') {

        const user = await Users.findOne({ email });
  
        if (!user) {
          return NextResponse.json({ message: 'Usuario no encontrado'}, { status: 404 })
        }

        if(user?.subscription != null && user?.subscription.active && !user?.subscription.isCanceled) {
          return NextResponse.json({ message: 'Ya estas subscripto y tus pagos se realizaron con éxito.', type: 'error', success: false}, { status: 401 })
        }
    
        // planId puede ser _id de MongoDB, stripePriceId (plan_token), o el campo id del plan
        let plan = null;
        let stripePriceId = planId;
        
        if (planId && planId.startsWith('price_')) {
          // Si empieza con price_, buscar por plan_token o id
          plan = await Plan.findOne({ 
            $or: [
              { plan_token: planId },
              { id: planId }
            ]
          });
          if (plan) {
            stripePriceId = plan.plan_token || plan.id || planId;
          }
        } else {
          try {
            // Intentar buscar por _id de MongoDB primero
            plan = await Plan.findById(planId);
            if (plan) {
              stripePriceId = plan.plan_token || plan.id || planId;
            } else {
              // Si no se encuentra por _id, buscar por plan_token o id
              plan = await Plan.findOne({ 
                $or: [
                  { plan_token: planId },
                  { id: planId }
                ]
              });
              if (plan) {
                stripePriceId = plan.plan_token || plan.id || planId;
              }
            }
          } catch (error) {
            if (error.name === 'CastError') {
              // Si no es un ObjectId válido, buscar por plan_token o id
              plan = await Plan.findOne({ 
                $or: [
                  { plan_token: planId },
                  { id: planId }
                ]
              });
              if (plan) {
                stripePriceId = plan.plan_token || plan.id || planId;
              }
            } else {
              throw error;
            }
          }
        }
        
        // Si no se encontró el plan pero tenemos un planId que parece ser un priceId de Stripe, usarlo directamente
        if (!plan && planId && planId.startsWith('price_')) {
          stripePriceId = planId;
        } else if (!plan) {
          return NextResponse.json({ 
            message: 'Plan no encontrado', 
            type: 'error', 
            success: false 
          }, { status: 404 });
        } else if (plan && !plan.active) {
          return NextResponse.json({ 
            message: 'El plan no está activo', 
            type: 'error', 
            success: false 
          }, { status: 400 });
        }
        
        let promocionId = null;
        
        if (plan) {
          let frecuenciaPlan = '';
          const freqType = (plan.frequency_type || '').toLowerCase();
          if (freqType === 'month' || freqType === 'monthly' || freqType === 'mensual') {
            frecuenciaPlan = 'mensual';
          } else if (freqType === 'quarter' || freqType === 'quarterly' || freqType === 'trimestral') {
            frecuenciaPlan = 'trimestral';
          } else if (freqType === 'year' || freqType === 'yearly' || freqType === 'anual') {
            frecuenciaPlan = 'trimestral';
          }
          
          if (frecuenciaPlan) {
            const now = new Date();
            const promocionesActivas = await Promocion.find({
              activa: true,
              fechaInicio: { $lte: now },
              fechaFin: { $gte: now },
              $or: [
                { frecuenciasAplicables: frecuenciaPlan },
                { frecuenciasAplicables: 'ambas' }
              ]
            }).sort({ createdAt: -1 }).limit(1);
            
            if (promocionesActivas.length > 0) {
              const promocion = promocionesActivas[0];
              if (promocion.stripeCouponId) {
                promocionId = promocion._id.toString();
              }
            }
          }
        }
    
        if (!stripePriceId || !stripePriceId.startsWith('price_')) {
          return NextResponse.json({ 
            message: 'ID de precio de Stripe inválido', 
            type: 'error', 
            success: false 
          }, { status: 400 });
        }

        const url = await createCheckoutSession(stripePriceId, email, plan?._id?.toString() || planId, promocionId);

        const planToken = jwt.sign(
          { planId: planId },
          process.env.NEXTAUTH_SECRET,
          {
              expiresIn: '30d'
          }
          );

        return NextResponse.json({
        url,
        planToken,
        success: true
        }, { status: 201 })
  
      } else {
        return NextResponse.json({ message: 'Error inesperado, vuelva a intentar', type: 'error'}, { status: 401 })
      }
    } catch (error) {
        return NextResponse.json({ 
          message: 'Error inesperado, vuelva a intentar', 
          type: 'error',
          success: false,
          details: error instanceof Error ? error.message : 'Error desconocido',
          stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
        }, { status: 500 })
    }
  };