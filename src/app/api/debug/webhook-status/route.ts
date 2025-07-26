import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
  
    
    // Verificar variables de entorno
    const envVars = {
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configurado' : '❌ No configurado',
      MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY ? '✅ Configurado' : '❌ No configurado',
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || '❌ No configurado',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '✅ Configurado' : '❌ No configurado'
    };

    // Verificar que el webhook endpoint existe
    const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/stripe`;
    
    const status = {
      environment: envVars,
      webhookUrl,
      instructions: {
        stripeDashboard: 'https://dashboard.stripe.com/webhooks',
        localTesting: 'Usa ngrok para exponer localhost:3000',
        webhookEvents: ['checkout.session.completed', 'payment_intent.succeeded']
      }
    };

    
    
    return NextResponse.json({
      success: true,
      message: 'Estado del webhook verificado',
      data: status
    });

  } catch (error) {
    console.error('❌ Error verificando webhook:', error);
    return NextResponse.json({
      success: false,
      message: 'Error verificando webhook',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 