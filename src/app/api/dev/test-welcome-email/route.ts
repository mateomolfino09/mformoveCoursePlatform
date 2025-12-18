import { NextResponse } from 'next/server';
import { emailService } from '../../../../services/email/emailService';
import { getCurrentURL } from '../../assets/getCurrentURL';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Falta email' }, { status: 400 });
    }

    const origin = getCurrentURL();
    const token = 'dummy-confirm-token';
    const confirmLink = `${origin}/email/${token}`;

    await emailService.sendWelcomeEmail({
      email,
      name: name || 'Mover',
      confirmLink,
      buttonText: 'Confirmar email',
      message: 'registro completado. Confirmá tu email para activar tu cuenta.',
      secondaryMessage: 'Si no solicitaste este acceso, ignorá este correo.'
    });

    return NextResponse.json({ ok: true, message: 'Email de bienvenida enviado' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al enviar email' }, { status: 500 });
  }
}
