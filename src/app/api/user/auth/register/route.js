import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import { emailService } from '../../../../../services/email/emailService';
import Users from '../../../../../models/userModel';
import validateCaptcha from '../../validateCaptcha';
import {validateRecaptcha} from '../../../recaptcha/validate';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import { serialize } from 'cookie';
import axios from 'axios';
import { getCurrentURL } from '../../../assets/getCurrentURL';
import { generateMd5 } from '../../../helper/generateMd5';
import mailchimp from "@mailchimp/mailchimp_marketing"; 

connectDB();
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_SERVER,
});

export async function POST(request) {
  try {
    if (request.method === 'POST') {
      const { email, password, firstname, lastname, gender, country } =
      await request.json();
      const secretKey = process.env.RECAPTCHA_SECRET_SITE_KEY

      const MailchimpKey = process.env.MAILCHIMP_API_KEY;
      const MailchimpServer = process.env.MAILCHIMP_API_SERVER;
      const MailchimpNewsletterAudience = process.env.MAILCHIMP_RUTINAS_AUDIENCE_ID;
      const customNewsletterUrl = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpNewsletterAudience}/members`;


      const user = await Users.findOne({ email: email });
      if (user) {
        return NextResponse.json({ error: 'Este usuario ya fue registrado'}, { status: 422 })
      }

      const HashedPassword = await bcrypt.hash(password, 12);
      const newUser = await new Users({
        email: email,
        password: HashedPassword,
        name: `${firstname} ${lastname}`,
        gender: gender,
        country: country
      }).save();

      //SUBSCRIBO A MAILCHIMP PLATFORa    

      const responseNews = await fetch(customNewsletterUrl, {
        method: "POST",
        headers: {
          Authorization: `apikey ${MailchimpKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          merge_fields: {
              FNAME: firstname,
              LNAME: lastname,
              PASSWORD: `${"•".repeat(password.length)}`
            },
          status: "subscribed",
          vip: false,
          tags: ["PLATAFORMA"]
        }),
      });

      const token = jwt.sign(
        { _id: newUser._id },
        process.env.NEXTAUTH_SECRET,
        {
          expiresIn: '30d'
        }
      );

      newUser.emailToken = token;

      await newUser.save();

      let origin = getCurrentURL();
        const link = `${origin}/email/${token}`;
      await emailService.sendWelcomeEmail({
        email: newUser.email,
        name: newUser.name,
        confirmLink: link,
        buttonText: 'Confirmar email',
        message: 'registro completado. Confirmá tu email para activar tu cuenta.',
        secondaryMessage: 'Si no solicitaste este acceso, ignorá este correo.'
      });

      return NextResponse.json({ message: `Email enviado a ${newUser.email}, porfavor chequea tu correo.`, token}, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({ message: `Error al enviar el mail. Porfavor vuelva a intentarlo`}, { status: 500 })
  }
};

