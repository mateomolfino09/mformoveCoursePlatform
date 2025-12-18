import { NextResponse } from 'next/server';
import connectDB from '../../../../../../config/connectDB';
import { emailService } from '../../../../../../services/email/emailService';
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
      await emailService.sendWelcomeEmail({
        email: user.email,
        name: user.name,
        confirmLink: link,
        buttonText: 'Confirmar email',
        message: 'registro completado. Confirmá tu email para activar tu cuenta.',
        secondaryMessage: 'Si no solicitaste este acceso, ignorá este correo.'
      });

      return NextResponse.json({ message: `Email enviado a ${user.email}, porfavor chequea tu correo.`}, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({ message: `Error al enviar el mail. Porfavor vuelva a intentarlo`}, { status: 500 })
  }
};

