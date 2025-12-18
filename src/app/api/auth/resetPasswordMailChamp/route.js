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
<!doctype html>
<html lang="es" style="margin:0;padding:0;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');
    </style>
  </head>
  <body style="margin:0; padding:0; background:#f5f7fb; font-family:'Montserrat','Helvetica Neue',Helvetica,Arial,sans-serif;">
    <div style="background:#f5f7fb; padding:24px 12px;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(15,23,42,0.12); border:1px solid #e5e7eb;">
        
        <!-- Header con acento Move Crew -->
        <div style="padding:28px 24px; text-align:center; background:linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(249, 115, 22, 0.06) 50%, rgba(251, 113, 133, 0.06) 100%);">
          <div style="color:#000000; font-size:26px; font-weight:800; margin:0 0 6px 0; letter-spacing:-0.3px;">Restablecer contraseña</div>
        </div>

        <!-- Contenido principal -->
        <div style="padding:26px 22px;">
          <p style="font-size:15px; color:rgba(0,0,0,0.78); line-height:1.6; margin:0 0 18px 0; text-align:center; font-weight:400;">
            Si hiciste esta solicitud, tocá el botón para crear tu nueva contraseña.
          </p>

          <div style="text-align:center; margin:10px 0 16px;">
            <a href="${link}" style="
              display:inline-block;
              background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 50%, rgba(251, 113, 133, 0.1) 100%);
              color:#000000;
              padding:14px 26px;
              text-decoration:none;
              border-radius:12px;
              font-size:15px;
              font-weight:700;
              font-family:'Montserrat','Helvetica Neue',Helvetica,Arial,sans-serif;
              border:1px solid rgba(245, 158, 11, 0.2);
              box-shadow:0 2px 10px rgba(245, 158, 11, 0.12);
            ">
              Restablecer contraseña
            </a>
          </div>

          <p style="font-size:13px; color:rgba(0,0,0,0.6); line-height:1.5; margin:12px 0 0 0; text-align:center; font-weight:400;">
            Si no solicitaste este cambio, ignorá este correo. Tu contraseña actual seguirá funcionando.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding:18px 22px 22px; text-align:center; border-top:1px solid #e5e7eb; background:#f9fafb;">
          <p style="font-size:12px; color:rgba(0,0,0,0.55); margin:0 0 6px 0; font-weight:400;">El equipo de MForMove</p>
          <p style="font-size:11px; color:rgba(0,0,0,0.45); margin:0; font-weight:400;">© 2025 MForMove. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  </body>
</html>
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
