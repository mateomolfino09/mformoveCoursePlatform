import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '../../../../services/email/emailService';

export async function POST(req: NextRequest) {
  try {
    const { testEmail } = await req.json();
    
    if (!testEmail) {
      return NextResponse.json({ 
        success: false, 
        message: 'Se requiere un email de prueba' 
      }, { status: 400 });
    }

    const testData = {
      nombre: 'Usuario de Prueba',
      email: testEmail,
      calendlyLink: 'https://calendly.com/mformovers/consulta-mentoria'
    };

    // Enviar email de aprobación de mentoría
    const result = await emailService.sendMentorshipApproval(testData);

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? 'Email de aprobación de mentoría enviado exitosamente' 
        : 'Error al enviar email',
      error: result.error,
      emailType: 'MENTORSHIP_APPROVAL',
      sentTo: testEmail
    });

  } catch (error: any) {
    console.error('Error en prueba de email de aprobación:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al ejecutar prueba de email',
      error: error.message
    }, { status: 500 });
  }
} 