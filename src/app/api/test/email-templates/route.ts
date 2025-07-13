import { NextRequest, NextResponse } from 'next/server';
import { emailService, EmailType } from '../../../../services/email/emailService';

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
      name: 'Usuario de Prueba',
      email: testEmail,
      nombre: 'Usuario de Prueba',
      paisCiudad: 'Buenos Aires, Argentina',
      whatsapp: '+54 9 11 1234-5678',
      interesadoEn: ['Pérdida de peso', 'Ganancia muscular'],
      dondeEntrena: 'Gimnasio local',
      nivelActual: 'Intermedio',
      principalFreno: 'Falta de tiempo',
      presupuesto: '$100-200 USD',
      porQueElegirme: 'Me gusta tu enfoque personalizado y los resultados que veo en tus clientes.',
      comentarios: 'Estoy muy motivado para comenzar este viaje de transformación.',
      planName: 'Membresía Premium',
      cancellationDate: '15/01/2025',
      accessUntil: '15/02/2025',
      productName: 'Membresía Premium',
      amount: 99.99,
      paymentDate: '15/01/2025',
      transactionId: 'txn_123456789',
      errorMessage: 'Tarjeta declinada - fondos insuficientes',
      courseName: 'Fundamentos del Movimiento',
      className: 'Introducción a la Biomecánica',
      classDescription: 'Aprende los principios básicos del movimiento humano',
      classUrl: 'https://mateomove.com/classes/123',
      duration: '45 minutos',
      completionDate: '15/01/2025',
      grade: '95%',
      subject: 'Consulta sobre entrenamiento',
      message: 'Hola, me gustaría saber más sobre vuestros programas de entrenamiento.',
      title: 'Actualización de Membresía',
      buttonText: 'Ver Detalles',
      buttonLink: 'https://mateomove.com/account/billing',
      resetLink: 'https://mateomove.com/reset-password?token=abc123',
      calendlyLink: 'https://calendly.com/mformovers/consulta-mentoria',
      dashboardUrl: 'https://mateomove.com/account',
      adminUrl: 'https://mateomove.com/admin/mentorship/requests',
      reactivateUrl: 'https://mateomove.com/membership',
      accessUrl: 'https://mateomove.com/account',
      retryUrl: 'https://mateomove.com/membership',
      nextCourseUrl: 'https://mateomove.com/courses'
    };

    // Enviar todos los tipos de email
    const results = [];

    // 1. Mentoría
    results.push(await emailService.sendMentorshipRequestNotification(testData));
    results.push(await emailService.sendMentorshipApproval(testData));
    results.push(await emailService.sendWelcomeMentorship(testData));

    // 2. Membresía
    results.push(await emailService.sendWelcomeMembership(testData));
    results.push(await emailService.sendSubscriptionCancelled(testData));
    results.push(await emailService.sendEmail({
      type: EmailType.SUBSCRIPTION_UPDATE,
      to: testEmail,
      subject: 'Actualización de Membresía',
      data: {
        title: testData.title,
        message: 'Tu membresía ha sido actualizada exitosamente.',
        buttonText: testData.buttonText,
        buttonLink: testData.buttonLink
      }
    }));

    // 3. Pagos
    results.push(await emailService.sendPaymentSuccess(testData));
    results.push(await emailService.sendPaymentFailed(testData));

    // 4. Autenticación
    results.push(await emailService.sendPasswordReset({
      email: testEmail,
      resetLink: testData.resetLink
    }));

    // 5. Contenido
    results.push(await emailService.sendNewClassNotification({
      className: testData.className,
      classDescription: testData.classDescription,
      classUrl: testData.classUrl
    }, [testEmail]));
    results.push(await emailService.sendCourseCompletion(testData));
    results.push(await emailService.sendReminderEmail(testData));

    // 6. General
    results.push(await emailService.sendContactForm({
      name: testData.name,
      email: testEmail,
      subject: testData.subject,
      message: testData.message
    }));
    results.push(await emailService.sendWelcomeEmail({
      name: testData.name,
      email: testEmail
    }));

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Prueba completada: ${successful} emails enviados exitosamente, ${failed} fallidos`,
      results: results.map((result, index) => ({
        emailType: Object.values(EmailType)[index],
        success: result.success,
        message: result.message,
        error: result.error
      }))
    });

  } catch (error: any) {
    console.error('Error en prueba de templates:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al ejecutar prueba de templates',
      error: error.message
    }, { status: 500 });
  }
} 