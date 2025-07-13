import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import User from '../../../../models/userModel';
import jwt from 'jsonwebtoken';
import { getCurrentURL } from '../../assets/getCurrentURL';
import mailchimp from '@mailchimp/mailchimp_transactional';

connectDB();

const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY);

export async function POST(req) {
  try {
    const { email } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'No hemos encontrado ningún usuario con ese email' },
        { status: 404 }
      );
    }

    const token = jwt.sign({ _id: user._id }, process.env.NEXTAUTH_SECRET, {
      expiresIn: '30d',
    });

    user.resetToken = token;
    await user.save();

    const origin = getCurrentURL();
    const link = `${origin}/reset/${token}`;

    const message = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #333333; text-align: center;">Restablecer Contraseña</h2>
      <p style="font-size: 16px; color: #666666; text-align: center;">
        Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para proceder:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${link}" style="background-color: #000000; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold; display: inline-block;">
          Restablecer Contraseña
        </a>
      </div>
      <p style="font-size: 14px; color: #999999; text-align: center;">
        Si no solicitaste este cambio, puedes ignorar este correo.
      </p>
      <p style="font-size: 14px; color: #999999; text-align: center; margin-top: 30px;">
        El equipo de MForMove
      </p>
      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
      <p style="font-size: 12px; color: #999999; text-align: center;">
        © 2025 MForMove. Todos los derechos reservados.
      </p>
    </div>
  </div>
`;


    // Utiliza mailchimpClient para enviar el correo
    const response = await mailchimpClient.messages.send({
      message: {
        from_email: 'noreply@mateomove.com', // Reemplazar con tu correo de remitente
        subject: 'Resetear contraseña',
        html: message,  // Usamos `html` para enviar contenido formateado en HTML
        to: [{ email: user.email, type: 'to' }],
      },
    });

    return NextResponse.json(
      { message: `Se ha enviado un mail a ${user.email}, revisa tu correo por favor.` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Hubo un error al enviar un mail a tu cuenta: ${error.message}` },
      { status: 500 }
    );
  }
}
