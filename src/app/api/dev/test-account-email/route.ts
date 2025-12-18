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
    const password = 'temporal123';
    const resetToken = 'dummy-token';
    const resetLink = `${origin}/reset/${resetToken}`;

    await emailService.sendAccountCreated({
      email,
      name: name || 'Mover',
      password,
      resetLink
    });

    return NextResponse.json({ ok: true, message: 'Email de prueba enviado' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al enviar email' }, { status: 500 });
  }
}
