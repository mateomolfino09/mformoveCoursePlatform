import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import { sendEmail } from '../../../../../helpers/sendEmail';
import User from '../../../../../models/userModel';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import {validateRecaptcha} from '../../../recaptcha/validate';

connectDB();

export async function POST(req) {
    try {
    if (req.method === 'POST') {
        const { email, captcha } = await req.json();

        const secretKey = process.env.RECAPTCHA_SECRET_SITE_KEY

        const formData = `secret=${secretKey}&response=${captcha}`;
        const validCaptcha =await validateRecaptcha(formData)

      const user = await User.findOne({ email });

      if (!user) {
        return NextResponse.json({ error: 'No hemos encontrado ningún usuario con ese email'}, { status: 404 })
      }
      if (!validCaptcha.success) {
        return NextResponse.json({ error: 'Unprocessable request, Invalid captcha code.'}, { status: 422 })
      }

      const token = jwt.sign({ _id: user._id }, process.env.NEXTAUTH_SECRET, {
        expiresIn: '30d'
      });

      user.resetToken = token;
      await user.save();

      const { origin } = absoluteUrl(req);
      const link = `${origin}/reset/${token}`;
      const title = `<h1>Restablece tu contraseña</h1>`;

      const message = `
      <div>     
       <div>
       <button style="background-color:black; border:none;border-radius: 4px;width:100%; padding:14px 0px; margin-bottom:15px">
        <a style="color:white; text-decoration: none; font-weight:700; font-size:14px" href="${link}">Restablecer contraseña</a>
       </button>
       </div>
       <p style="font-size:14px;font-weight:700;color:#221f1f;margin-bottom:24px">El equipo de Video Stream.</p>
       <hr style="height:2px;background-color:#221f1f;border:none">       
      </div> `;

      let resp = sendEmail({
        title: title,
        name: `Hola, ${user.name}:`,
        content:
          'Restablezcamos tu contraseña para que puedas seguir disfrutando Video Stream.',
        message: message,
        to: `Video Stream te envió este mensaje a [${user.email}] como parte de tu membresía.`,
        subject: 'Resetear contraseña'
      });

      return NextResponse.json({ message: `Se ha enviado un mail a ${user.email}, revisa tu correo porfavor.`}, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({ error: `Hubo un error al enviar un mail a tu cuenta`}, { status: 500 })
  }
};
