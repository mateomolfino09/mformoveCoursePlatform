import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import { sendEmail } from '../../../../../helpers/sendEmail';
import Users from '../../../../../models/userModel';
import validateCaptcha from '../../validateCaptcha';
import {validateRecaptcha} from '../../../recaptcha/validate';
import { generatePassword } from '../../../assets/randomPasswordGenerator.ts'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import { serialize } from 'cookie';
import axios from 'axios';
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
      const { email, name, gender, country } =
      await request.json();
      const MailchimpKey = process.env.MAILCHIMP_API_KEY;
      const MailchimpServer = process.env.MAILCHIMP_API_SERVER;
      const MailchimpNewsletterAudience = process.env.MAILCHIMP_RUTINAS_AUDIENCE_ID;
      const customNewsletterUrl = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpNewsletterAudience}/members`;

      const user = await Users.findOne({ email: email });

      if (user) {

        const hashedEmail = generateMd5(email)


        const resetToken = jwt.sign({ _id: user._id }, process.env.NEXTAUTH_SECRET, {
          expiresIn: '30d',
        });
  
        user.resetToken = resetToken;
        user.token = resetToken;

        await user.save()


        const res = await mailchimp.lists.setListMember(
          MailchimpNewsletterAudience,
          hashedEmail,
          {
              email_address: email,
              merge_fields: {
                  FNAME: user.name,
                  LNAME: "",
                  TOKEN: `${resetToken}`
                  },
              status_if_new: "subscribed",
              status: "subscribed",
              tags: ["PLATAFORMA"],
          }
          );

          return NextResponse.json({ error: 'Ya hay una cuenta con este usuario'}, { status: 422 })
      }
       
      const password = generatePassword(16);
      const HashedPassword = await bcrypt.hash(password, 12);

      const newUser = await new Users({
        email: email,
        password: HashedPassword,
        name: name,
        gender: gender,
        country: country
      });

      newUser.validEmail = 'yes';
      newUser.emailToken = undefined;
      newUser.courses = [];

      newUser.notifications.push({
        title: 'Usuario creado',
        message: `¡Te damos la bienvenida a MForMove ${newUser.name}!`,
        status: 'green'
      });

      newUser.admin = {
        active: false,
        coursesAvailable: 3
      };

      const adminUsers = await Users.find({
        rol: 'Admin'
      });
      adminUsers.forEach(async (user) => {
        user.notifications.push({
          title: 'Usuario creado',
          message: `¡Le damos la bienvenida a ${newUser.name} a MForMove!`,
          status: 'green'
        });
        await user.save();
      });

      await newUser.save()


      const token = jwt.sign({ _id: newUser._id }, process.env.NEXTAUTH_SECRET, {
        expiresIn: '30d',
      });

      newUser.resetToken = token;
      newUser.token = `${token}`
      await newUser.save()

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
              FNAME: name,
              LNAME: "",
              PASSWORD: password,
              TOKEN:  newUser.token
            },
          status: "subscribed",
          vip: false,
          tags: ["PLATAFORMA"]
        }),
      });

      newUser.password = null;


      return NextResponse.json({ message: `Te registraste con éxito.`, newUser, token }, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({ message: `Error al enviar el mail. Porfavor vuelva a intentarlo`}, { status: 500 })
  }
};

