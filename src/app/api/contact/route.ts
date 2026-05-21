import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '../../../services/email/emailService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;
    const reasonRaw = typeof body.reason === 'string' && body.reason.trim() ? body.reason.trim() : 'general';

    // Mínimo exigido para verificación de comercio: nombre, correo y mensaje (motivo opcional)
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Nombre, correo y mensaje son obligatorios' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Email inválido' },
        { status: 400 }
      );
    }

    const emailService = EmailService.getInstance();

    // Mapear razón a texto legible
    const reasonLabels: { [key: string]: string } = {
      cancellation: 'Cancelación de membresía',
      payment: 'Problema con el pago',
      general: 'Consulta general',
      feedback: 'Feedback sobre el servicio',
      other: 'Otro'
    };

    const reasonLabel = reasonLabels[reasonRaw] || reasonRaw;

    // Enviar email usando el servicio de emails
    try {
      await emailService.sendContactForm({
        name,
        email,
        subject: `Contacto - ${reasonLabel}`,
        message: `Motivo: ${reasonLabel}\n\n${message}`,
        reason: reasonLabel
      });

      return NextResponse.json(
        { 
          success: true, 
          message: 'Mensaje enviado exitosamente. Te responderemos a la brevedad.' 
        },
        { status: 200 }
      );
    } catch (emailError: any) {
      console.error('Error enviando email de contacto:', emailError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error al enviar el mensaje. Por favor, intenta nuevamente.' 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error en endpoint de contacto:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

