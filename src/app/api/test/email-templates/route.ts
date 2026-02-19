import { NextRequest, NextResponse } from 'next/server';
import { EmailService, EmailType } from '../../../../services/email/emailService';
import connectDB from '../../../../config/connectDB';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { testEmail, type, subject, data, preview } = body || {};

    const emailService = EmailService.getInstance();

    if (preview && type === EmailType.WEEKLY_LOGBOOK_RELEASE) {
      const to = data?.email || testEmail || 'preview@example.com';

      let simulatedWeek: any = null;
      if (data?.simulateFromLogbookId) {
        try {
          await connectDB();
          const logbook = await WeeklyLogbook.findById(data.simulateFromLogbookId).lean();
          if (logbook?.weeklyContents?.length) {
            const now = new Date(); now.setHours(0,0,0,0);
            const sorted = [...logbook.weeklyContents].sort((a:any,b:any)=> new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
            simulatedWeek = sorted.find((w:any)=> new Date(w.publishDate).setHours(0,0,0,0) <= now.getTime()) || sorted[0];
            if (simulatedWeek) {
              const firstVideoDay = simulatedWeek.dailyContents?.find((d:any)=> d.visualContent?.type === 'video' && d.visualContent?.videoUrl);
              const firstAudioDay = simulatedWeek.dailyContents?.find((d:any)=> d.audioTextContent?.audioUrl || d.audioTextContent?.text);
              simulatedWeek.coverImage =
                firstVideoDay?.visualContent?.thumbnailUrl ||
                simulatedWeek.thumbnailUrl ||
                simulatedWeek.videoThumbnail ||
                data?.coverImage;
              simulatedWeek.videoDurationSeconds =
                firstVideoDay?.visualContent?.duration ||
                simulatedWeek.videoDuration ||
                data?.videoDurationSeconds ||
                0;
              simulatedWeek.text = simulatedWeek.text || firstAudioDay?.audioTextContent?.text || data?.text;
              simulatedWeek.audioUrl = firstAudioDay?.audioTextContent?.audioUrl || data?.audioUrl;
              simulatedWeek.audioTitle = firstAudioDay?.audioTextContent?.nombre || simulatedWeek.weekTitle || data?.audioTitle;
              simulatedWeek.weekNumber = simulatedWeek.weekNumber || data?.weekNumber;
              simulatedWeek.month = logbook.month;
              simulatedWeek.year = logbook.year;
              simulatedWeek.logbookTitle = logbook.title || data?.logbookTitle;
            }
          }
        } catch (err) {
          console.warn('No se pudo simular desde camino:', err);
        }
      }

      const defaultData = {
        name: data?.name || 'Usuario de Prueba',
        email: to,
        weekNumber: simulatedWeek?.weekNumber || data?.weekNumber || 1,
        month: simulatedWeek?.month || data?.month || 1,
        year: simulatedWeek?.year || data?.year || 2025,
        text: (simulatedWeek?.text || data?.text || 'Contenido de prueba para la semana.'),
        audioUrl: simulatedWeek?.audioUrl || data?.audioUrl || '',
        audioTitle: simulatedWeek?.audioTitle || data?.audioTitle || 'Audio de la semana',
        coverImage: simulatedWeek?.coverImage || data?.coverImage || 'https://res.cloudinary.com/dbeem2avp/image/upload/v1764426772/my_uploads/mails/fondoMoveCrew_2_do594q.png',
        videoDurationSeconds: simulatedWeek?.videoDurationSeconds || data?.videoDurationSeconds || 0,
        bitacoraLink: data?.bitacoraLink || 'https://mateomove.com/weekly-path',
        logbookTitle: simulatedWeek?.logbookTitle || data?.logbookTitle || 'Camino'
      };

      const html = EmailService.renderTemplate(EmailType.WEEKLY_LOGBOOK_RELEASE, defaultData);
      return NextResponse.json({
        success: true,
        preview: true,
        to,
        subject: subject || `El Camino - Semana ${defaultData.weekNumber} está disponible`,
        html
      });
    }

    // Envío directo de template específico (p.ej. camino)
    if (type === EmailType.WEEKLY_LOGBOOK_RELEASE) {
      if (!data?.email && !testEmail) {
        return NextResponse.json(
          { success: false, message: 'Email requerido (data.email o testEmail)' },
          { status: 400 }
        );
      }

      const to = data?.email || testEmail;

      // Opcional: simular desde camino real también en envío (no solo preview)
      let simulatedWeek: any = null;
      if (data?.simulateFromLogbookId) {
        try {
          await connectDB();
          const logbook = await WeeklyLogbook.findById(data.simulateFromLogbookId).lean();
          if (logbook?.weeklyContents?.length) {
            const now = new Date(); now.setHours(0,0,0,0);
            const sorted = [...logbook.weeklyContents].sort((a:any,b:any)=> new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
            simulatedWeek = sorted.find((w:any)=> new Date(w.publishDate).setHours(0,0,0,0) <= now.getTime()) || sorted[0];
            if (simulatedWeek) {
              const firstVideoDay = simulatedWeek.dailyContents?.find((d:any)=> d.visualContent?.type === 'video' && d.visualContent?.videoUrl);
              const firstAudioDay = simulatedWeek.dailyContents?.find((d:any)=> d.audioTextContent?.audioUrl || d.audioTextContent?.text);
              simulatedWeek.coverImage =
                firstVideoDay?.visualContent?.thumbnailUrl ||
                simulatedWeek.thumbnailUrl ||
                simulatedWeek.videoThumbnail ||
                data?.coverImage;
              simulatedWeek.videoDurationSeconds =
                firstVideoDay?.visualContent?.duration ||
                simulatedWeek.videoDuration ||
                data?.videoDurationSeconds ||
                0;
              simulatedWeek.text = simulatedWeek.text || firstAudioDay?.audioTextContent?.text || data?.text;
              simulatedWeek.audioUrl = firstAudioDay?.audioTextContent?.audioUrl || data?.audioUrl;
              simulatedWeek.audioTitle = firstAudioDay?.audioTextContent?.nombre || simulatedWeek.weekTitle || data?.audioTitle;
              simulatedWeek.weekNumber = simulatedWeek.weekNumber || data?.weekNumber;
              simulatedWeek.month = logbook.month;
              simulatedWeek.year = logbook.year;
              simulatedWeek.logbookTitle = logbook.title || data?.logbookTitle;
            }
          }
        } catch (err) {
          console.warn('No se pudo simular desde camino (send):', err);
        }
      }

      const defaultData = {
        name: data?.name || 'Usuario de Prueba',
        email: to,
        weekNumber: simulatedWeek?.weekNumber || data?.weekNumber || 1,
        month: simulatedWeek?.month || data?.month || 1,
        year: simulatedWeek?.year || data?.year || 2025,
        text: simulatedWeek?.text || data?.text || 'Contenido de prueba para la semana.',
        audioUrl: simulatedWeek?.audioUrl || data?.audioUrl || '',
        audioTitle: simulatedWeek?.audioTitle || data?.audioTitle || 'Audio de la semana',
        coverImage: simulatedWeek?.coverImage || data?.coverImage || 'https://res.cloudinary.com/dbeem2avp/image/upload/v1764426772/my_uploads/mails/fondoMoveCrew_2_do594q.png',
        videoDurationSeconds: simulatedWeek?.videoDurationSeconds || data?.videoDurationSeconds || 0,
        bitacoraLink: data?.bitacoraLink || 'https://mateomove.com/weekly-path',
        logbookTitle: simulatedWeek?.logbookTitle || data?.logbookTitle || 'Camino'
      };

      try {
        const result = await emailService.sendEmail({
          type: EmailType.WEEKLY_LOGBOOK_RELEASE,
          to,
          subject: subject || `El Camino - Semana ${defaultData.weekNumber} está disponible`,
          data: defaultData
        });

        return NextResponse.json({
          success: result.success,
          message: result.message,
          type: 'WEEKLY_LOGBOOK_RELEASE',
          to
        });
      } catch (error: any) {
        return NextResponse.json(
          { success: false, message: 'Error enviando WEEKLY_LOGBOOK_RELEASE', error: error?.message },
          { status: 500 }
        );
      }
    }

    if (!testEmail) {
      return NextResponse.json(
        { success: false, message: 'Email de prueba requerido' },
        { status: 400 }
      );
    }

    const results: any[] = [];

    // Test email de bienvenida de membresía
    try {
      const result = await emailService.sendWelcomeMembership({
        email: testEmail,
        name: 'Usuario de Prueba',
        dashboardUrl: 'https://mateomove.com/library',
        telegramInviteUrl: process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK || 'https://chat.whatsapp.com/',
        whatsappInviteUrl: process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK || 'https://chat.whatsapp.com/'
      });
      results.push({
        emailType: 'WELCOME_MEMBERSHIP',
        success: result.success,
        message: result.message,
        error: result.error
      });
    } catch (error: any) {
      results.push({
        emailType: 'WELCOME_MEMBERSHIP',
        success: false,
        message: 'Error al enviar',
        error: error.message
      });
    }

    // Test email de notificación de admin
    try {
      const result = await emailService.sendAdminMembershipNotification({
        userName: 'Usuario de Prueba',
        userEmail: testEmail,
        userId: 'test123',
        planName: 'Move Crew Trimestral',
        subscriptionId: 'sub_test123',
        activationDate: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        adminUrl: 'https://mateomove.com/admin'
      }, testEmail); // Enviar al email de prueba también para ver el template
      results.push({
        emailType: 'ADMIN_MEMBERSHIP_NOTIFICATION',
        success: result.success,
        message: result.message,
        error: result.error
      });
    } catch (error: any) {
      results.push({
        emailType: 'ADMIN_MEMBERSHIP_NOTIFICATION',
        success: false,
        message: 'Error al enviar',
        error: error.message
      });
    }

    // Test email de cancelación de suscripción
    try {
      const result = await emailService.sendSubscriptionCancelled({
        email: testEmail,
        name: 'Usuario de Prueba',
        planName: 'Move Crew Trimestral',
        cancellationDate: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        accessUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        feedbackUrl: `https://mateomove.com/contact?reason=cancellation&email=${encodeURIComponent(testEmail)}`,
        reactivateUrl: 'https://mateomove.com/move-crew'
      });
      results.push({
        emailType: 'SUBSCRIPTION_CANCELLED',
        success: result.success,
        message: result.message,
        error: result.error
      });
    } catch (error: any) {
      results.push({
        emailType: 'SUBSCRIPTION_CANCELLED',
        success: false,
        message: 'Error al enviar',
        error: error.message
      });
    }

    // Test email de pago fallido
    try {
      const result = await emailService.sendPaymentFailed({
        email: testEmail,
        name: 'Usuario de Prueba',
        productName: 'Move Crew Trimestral',
        amount: '29.99',
        paymentDate: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        errorMessage: 'Tarjeta rechazada. Por favor, verifica tu método de pago.',
        retryUrl: 'https://mateomove.com/move-crew',
        feedbackUrl: `https://mateomove.com/contact?reason=payment&email=${encodeURIComponent(testEmail)}`
      });
      results.push({
        emailType: 'PAYMENT_FAILED',
        success: result.success,
        message: result.message,
        error: result.error
      });
    } catch (error: any) {
      results.push({
        emailType: 'PAYMENT_FAILED',
        success: false,
        message: 'Error al enviar',
        error: error.message
      });
    }

    // Test email de notificación de cancelación al admin
    try {
      const result = await emailService.sendAdminSubscriptionCancelled({
        userName: 'Usuario de Prueba',
        userEmail: testEmail,
        userId: 'test-user-123',
        planName: 'Move Crew Trimestral',
        subscriptionId: 'sub_test_cancelled_123',
        cancellationDate: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        accessUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        adminUrl: 'https://mateomove.com/admin'
      }, testEmail); // Enviar al email de prueba también para ver el template
      results.push({
        emailType: 'ADMIN_SUBSCRIPTION_CANCELLED',
        success: result.success,
        message: result.message,
        error: result.error
      });
    } catch (error: any) {
      results.push({
        emailType: 'ADMIN_SUBSCRIPTION_CANCELLED',
        success: false,
        message: 'Error al enviar',
        error: error.message
      });
    }

    // Test email de notificación de pago fallido al admin
    try {
      const result = await emailService.sendAdminPaymentFailed({
        userName: 'Usuario de Prueba',
        userEmail: testEmail,
        userId: 'test-user-123',
        planName: 'Move Crew Trimestral',
        productName: 'Move Crew Trimestral',
        amount: '29.99',
        paymentDate: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        errorMessage: 'Tarjeta rechazada. Fondos insuficientes.',
        subscriptionId: 'sub_test_failed_123',
        invoiceId: 'in_test_failed_123',
        adminUrl: 'https://mateomove.com/admin'
      }, testEmail); // Enviar al email de prueba también para ver el template
      results.push({
        emailType: 'ADMIN_PAYMENT_FAILED',
        success: result.success,
        message: result.message,
        error: result.error
      });
    } catch (error: any) {
      results.push({
        emailType: 'ADMIN_PAYMENT_FAILED',
        success: false,
        message: 'Error al enviar',
        error: error.message
      });
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return NextResponse.json({
      success: true,
      message: `Se enviaron ${successCount} de ${totalCount} emails de prueba a ${testEmail}`,
      results
    });
  } catch (error: any) {
    console.error('Error en test de emails:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud', error: error.message },
      { status: 500 }
    );
  }
}

