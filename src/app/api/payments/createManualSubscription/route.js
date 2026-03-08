import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '../../../../models/userModel';
import Plan from '../../../../models/planModel';
import { EmailService } from '../../../../services/email/emailService';
import { getCurrentURL } from '../../assets/getCurrentURL';

/**
 * Endpoint para crear una suscripción manual para usuarios de prueba de Move Crew Fase Beta
 * POST /api/payments/createManualSubscription
 * Body: { email, planId? (opcional), name? (opcional) }
 * 
 * NOTA: Este endpoint se conecta explícitamente a la base de producción usando MONGODB_URI del .env
 */
export async function POST(req) {
  try {
    if (req.method !== 'POST') {
      return NextResponse.json(
        { error: 'Método no permitido' },
        { status: 405 }
      );
    }

    // Parsear el body del request con manejo de errores
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      console.error('Error al parsear JSON del request:', jsonError);
      return NextResponse.json(
        { 
          error: 'Error al parsear el JSON del request',
          message: 'El body del request debe ser un JSON válido',
          details: jsonError.message
        },
        { status: 400 }
      );
    }

    const { email, planId, name, isProd } = body;

    // Determinar qué conexión usar según isProd (nunca hardcodear credenciales; usar .env)
    let mongoUri;
    if (isProd === true) {
      if (!process.env.MONGODB_URI_PRODUCTION) {
        return NextResponse.json(
          { error: 'MONGODB_URI_PRODUCTION no está configurada en las variables de entorno' },
          { status: 500 }
        );
      }
      mongoUri = process.env.MONGODB_URI_PRODUCTION;
    } else {
      if (!process.env.MONGODB_URI) {
        return NextResponse.json(
          { error: 'MONGODB_URI no está configurada en las variables de entorno' },
          { status: 500 }
        );
      }
      mongoUri = process.env.MONGODB_URI;
    }

    // Verificar si ya hay una conexión activa
    if (mongoose.connections[0].readyState !== 1) {
      mongoose.set('strictQuery', false);
      await mongoose.connect(mongoUri);
    }

    // Validar que se proporcione el email
    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya tiene una suscripción activa
    if (user?.subscription?.active) {
      return NextResponse.json(
        { 
          error: 'El usuario ya tiene una suscripción activa',
          subscription: user.subscription
        },
        { status: 400 }
      );
    }

    let manualSubscription;
    let selectedPlan = null;

    // Si isProd es true, usar plantilla de producción desde variables de entorno (nunca hardcodear IDs/secretos)
    if (isProd === true) {
      const subId = process.env.MANUAL_SUB_PROD_TEMPLATE_SUB_ID;
      const planIdEnv = process.env.MANUAL_SUB_PROD_TEMPLATE_PLAN_ID;
      const subToken = process.env.MANUAL_SUB_PROD_TEMPLATE_SUBSCRIPTION_TOKEN;
      const pmCode = process.env.MANUAL_SUB_PROD_TEMPLATE_PAYMENT_METHOD_CODE;
      const clientIdEnv = process.env.MANUAL_SUB_PROD_TEMPLATE_CLIENT_ID;
      if (!subId || !planIdEnv || !subToken || !pmCode || !clientIdEnv) {
        return NextResponse.json(
          {
            error: 'Para isProd=true deben configurarse en .env: MANUAL_SUB_PROD_TEMPLATE_SUB_ID, MANUAL_SUB_PROD_TEMPLATE_PLAN_ID, MANUAL_SUB_PROD_TEMPLATE_SUBSCRIPTION_TOKEN, MANUAL_SUB_PROD_TEMPLATE_PAYMENT_METHOD_CODE, MANUAL_SUB_PROD_TEMPLATE_CLIENT_ID'
          },
          { status: 500 }
        );
      }
      const prodSubscriptionTemplate = {
        id: subId,
        planId: planIdEnv,
        subscription_token: subToken,
        status: 'active',
        payment_method_code: pmCode,
        client_id: clientIdEnv,
        client_first_name: user.name?.split(' ')[0] || '',
        client_last_name: user.name?.split(' ').slice(1).join(' ') || '',
        client_document_type: null,
        client_document: null,
        client_email: user.email,
        active: true,
        isCanceled: false,
        cancellation_reason: '',
        created_at: new Date()
      };

      manualSubscription = prodSubscriptionTemplate;
      
      // Intentar obtener el plan para la respuesta (opcional)
      try {
        selectedPlan = await Plan.findOne({ id: prodSubscriptionTemplate.planId });
      } catch (err) {
      }
    } else {
      // Lógica normal: obtener un plan real de la base de datos
      if (planId) {
        // Si se proporciona un planId, buscar ese plan específico
        selectedPlan = await Plan.findOne({ id: planId, active: true });
        if (!selectedPlan) {
          return NextResponse.json(
            { 
              error: 'El planId proporcionado no existe o no está activo',
              planId: planId
            },
            { status: 404 }
          );
        }
      } else {
        // Si no se proporciona planId, obtener el primer plan activo
        selectedPlan = await Plan.findOne({ active: true }).sort({ createdAt: -1 });
        if (!selectedPlan) {
          return NextResponse.json(
            { 
              error: 'No se encontró ningún plan activo en la base de datos'
            },
            { status: 404 }
          );
        }
      }

      // Crear suscripción manual con el planId real
      manualSubscription = {
        id: `manual_${Date.now()}_${user._id}`,
        planId: selectedPlan.id, // Usar el ID real del plan
        subscription_token: `manual_token_${Date.now()}`,
        status: 'active',
        payment_method_code: 'manual',
        client_id: user._id.toString(),
        client_email: user.email,
        client_first_name: user.name?.split(' ')[0] || '',
        client_last_name: user.name?.split(' ').slice(1).join(' ') || '',
        created_at: new Date(),
        active: true,
        isCanceled: false,
        cancellation_reason: ''
      };
    }

    // Asignar la suscripción al usuario
    user.subscription = manualSubscription;
    user.freeSubscription = null; // Eliminar suscripción gratuita si existe
    if (user.validEmail !== 'yes') {
      user.validEmail = 'yes';
      user.emailToken = undefined;
    }
    await user.save();

    // Enviar email de bienvenida
    const origin = getCurrentURL();
    const emailService = EmailService.getInstance();
    
    try {
      await emailService.sendWelcomeMembership({
        email: user.email,
        name: name || user.name || 'Mover',
        dashboardUrl: `${origin}/home`,
        telegramInviteUrl: 'https://t.me/+_9hJulwT690yNWFh'
      });
    } catch (emailError) {
      console.error('Error al enviar email de bienvenida:', emailError);
      // No fallar el endpoint si el email falla, pero registrar el error
    }

    // Limpiar password antes de devolver
    user.password = null;

    const responseData = {
      success: true,
      message: 'Suscripción creada exitosamente y email de bienvenida enviado',
      subscription: user.subscription,
      isProd: isProd === true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      }
    };

    // Agregar información del plan si está disponible
    if (selectedPlan) {
      responseData.plan = {
        id: selectedPlan.id,
        name: selectedPlan.name,
        provider: selectedPlan.provider
      };
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Error al crear suscripción manual:', error);
    return NextResponse.json(
      {
        error: 'Error al crear suscripción manual',
        message: error.message
      },
      { status: 500 }
    );
  }
}

