import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import User from '../../../../../models/userModel';
import {
  buildCourseTransferWhatsAppUrl,
  CURSO_TRANSFERENCIA_BANCARIA,
} from '../../../../../constants/courseTransferencia';
import { EmailService } from '../../../../../services/email/emailService';

export const runtime = 'nodejs';

const formatAmount = (currency?: string, amount?: number) => {
  if (amount == null || Number.isNaN(amount)) return '';
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency || ''}`.trim();
  }
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userToken = cookies().get('userToken')?.value;
    if (!userToken) {
      return NextResponse.json({ success: false, message: 'Iniciá sesión para recibir los datos' }, { status: 401 });
    }

    const decoded = verify(userToken, process.env.NEXTAUTH_SECRET as string) as {
      userId?: string;
      _id?: string;
    };

    const user = await User.findById(decoded.userId || decoded._id).select('email name nombre').lean();
    if (!user?.email) {
      return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const courseName = typeof body.courseName === 'string' ? body.courseName.trim() : '';
    if (!courseName) {
      return NextResponse.json({ success: false, message: 'Falta el nombre del curso' }, { status: 400 });
    }

    const supportEmail =
      typeof body.supportEmail === 'string' && body.supportEmail.trim()
        ? body.supportEmail.trim()
        : 'hola@mformove.com';

    const amountFormatted = formatAmount(body.currency, body.amount);
    const userName = (user as { name?: string; nombre?: string }).name || (user as { nombre?: string }).nombre || '';

    const emailService = EmailService.getInstance();
    const result = await emailService.sendCourseTransferBankDetails({
      email: user.email,
      name: userName,
      courseName,
      banco: CURSO_TRANSFERENCIA_BANCARIA.banco,
      cuentaPesos: CURSO_TRANSFERENCIA_BANCARIA.cuentaPesos,
      cuentaDolares: CURSO_TRANSFERENCIA_BANCARIA.cuentaDolares,
      titular: CURSO_TRANSFERENCIA_BANCARIA.titular,
      whatsappProofUrl: buildCourseTransferWhatsAppUrl(courseName),
      amountFormatted,
      supportEmail,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'No pudimos enviar el email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Te enviamos los datos de transferencia a ${user.email}`,
    });
  } catch (error) {
    console.error('request-transfer-details:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
