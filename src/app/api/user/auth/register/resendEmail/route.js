import { NextResponse } from 'next/server';
import connectDB from '../../../../../../config/connectDB';
import { sendEmail } from '../../../../../../helpers/sendEmail';
import Users from '../../../../../../models/userModel';
import {validateRecaptcha} from '../../../../recaptcha/validate';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import { serialize } from 'cookie';
import axios from 'axios';
import { getCurrentURL } from '../../../../assets/getCurrentURL';

connectDB();

export async function POST(request) {
  try {
    if (request.method === 'POST') {
      const { email } =
      await request.json();
      console.log(email)
      // const secretKey = process.env.RECAPTCHA_SECRET_SITE_KEY

      // const formData = `secret=${secretKey}&response=${gRecaptchaToken}`;
      // const validCaptcha =await validateRecaptcha(formData)

      // // const validCaptcha = await validateCaptcha(captcha);

      // if (!validCaptcha.success) {
      //   return NextResponse.json({ error: 'Unprocessable request, Invalid captcha code.'}, { status: 422 })
      // }

      const user = await Users.findOne({ email: email });

      const token = jwt.sign(
        { _id: user._id },
        process.env.NEXTAUTH_SECRET,
        {
          expiresIn: '30d'
        }
      );

      user.emailToken = token;

      await user.save();

      let origin = getCurrentURL();
      
          const link = `${origin}/email/${token}`;
      const title = `<h1>Confirma tu email</h1>`;

      const message = `
          <div>     
          <div>
          <button style="background-color:black; border:none;border-radius: 4px;width:100%; padding:14px 0px; margin-bottom:15px">
           <a style="color:white; text-decoration: none; font-weight:700; font-size:14px" href="${link}">Confirmar email </a>
          </button>
          </div>
          <p style="font-size:14px;font-weight:700;color:#221f1f;margin-bottom:24px">El equipo de Video Stream.</p>
          <hr style="height:2px;background-color:#221f1f;border:none">       
         </div>`;

      let resp = sendEmail({
        title: title,
        name: `Hola, ${user.name}:`,
        content:
          'Confirma tu email para poder empezar a disfrutar de Video Stream.',
        message: message,
        to: [{
          email: user.email,
          name: user.name
        }], 
        subject: 'Confirmar Mail'
      });

      return NextResponse.json({ message: `Email enviado a ${user.email}, porfavor chequea tu correo.`}, { status: 200 })
    }
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: `Error al enviar el mail. Porfavor vuelva a intentarlo`}, { status: 500 })
  }
};

