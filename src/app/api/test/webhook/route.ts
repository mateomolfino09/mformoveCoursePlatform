import { NextRequest, NextResponse } from 'next/server';
import { EmailService, EmailType } from '../../../../services/email/emailService';

export async function GET(req: NextRequest) {
  try {
  
    
    // Verificar variables de entorno
    const envVars = {
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'Configurado' : 'No configurado',
      MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY ? 'Configurado' : 'No configurado',
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'No configurado'
    };

    // Probar el email service
    const emailService = EmailService.getInstance();
    
    const testEmailData = {
      customerName: 'Usuario de Prueba',
      eventName: 'Evento de Prueba',
      eventDate: '15 de diciembre de 2024',
      eventTime: '19:00',
      eventLocation: 'Online',
      eventLink: 'https://meet.google.com/test',
      isOnline: true,
      amount: '$50',
      benefits: ['Acceso completo', 'Grabación', 'Material descargable'],
      cupo: 20,
      sessionId: 'test_session_123',
      eventPageUrl: 'https://mateomove.com/events/test',
      supportEmail: 'soporte@mateomove.com',
      accessInstructions: 'El link de acceso estará disponible 15 minutos antes del evento',
      recordingInfo: 'La grabación estará disponible por 30 días después del evento'
    };


    
    const result = await emailService.sendEmail({
      type: EmailType.EVENT_CONFIRMATION,
      to: 'test@example.com', // Cambia por tu email real para probar
      subject: '🧪 Email de prueba - Webhook Stripe',
      data: testEmailData
    });

    if (result.success) {

      return NextResponse.json({
        success: true,
        message: 'Webhook y email service funcionando correctamente',
        emailResult: result
      });
    } else {
      console.error('❌ Error enviando email de prueba:', result.error);
      return NextResponse.json({
        success: false,
        message: 'Error enviando email de prueba',
        error: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error en prueba de webhook:', error);
    return NextResponse.json({
      success: false,
      message: 'Error en prueba de webhook',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 