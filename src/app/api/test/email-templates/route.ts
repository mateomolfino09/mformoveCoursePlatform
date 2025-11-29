import { NextRequest, NextResponse } from 'next/server';
import { EmailService, EmailType } from '../../../../services/email/emailService';

export async function POST(req: NextRequest) {
  try {
    const { testEmail } = await req.json();

    if (!testEmail) {
      return NextResponse.json(
        { success: false, message: 'Email de prueba requerido' },
        { status: 400 }
      );
    }

    const emailService = EmailService.getInstance();
    const results: any[] = [];

    // Test email de bienvenida de membresía
    try {
      const result = await emailService.sendWelcomeMembership({
        email: testEmail,
        name: 'Usuario de Prueba',
        dashboardUrl: 'https://mateomove.com/home'
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

