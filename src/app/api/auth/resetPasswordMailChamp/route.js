import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import User from '../../../../models/userModel';
import jwt from 'jsonwebtoken';
import { getCurrentURL } from '../../assets/getCurrentURL';
import mailchimp from '@mailchimp/mailchimp_transactional';

connectDB();
debugger;
const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY);
debugger;
export async function POST(req) {
  try {
    debugger;
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
      <div>     
        <div>
          <button style="background-color:black; border:none;border-radius: 4px;width:100%; padding:14px 0px; margin-bottom:15px">
            <a style="color:white; text-decoration: none; font-weight:700; font-size:14px" href="${link}">Restablecer contraseña</a>
          </button>
        </div>
        <p style="font-size:14px;font-weight:700;color:#221f1f;margin-bottom:24px">El equipo de MForMove.</p>
        <hr style="height:2px;background-color:#221f1f;border:none">       
      </div> `;

    // Utiliza mailchimpClient para enviar el correo
    const response = await mailchimpClient.messages.send({
      message: {
        from_email: 'noreply@mateomove.com', // Reemplazar con tu correo de remitente
        subject: 'Resetear contraseña',
        html: message,  // Usamos `html` para enviar contenido formateado en HTML
        to: [{ email: user.email, type: 'to' }],
      },
    });

    console.log(response);

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
