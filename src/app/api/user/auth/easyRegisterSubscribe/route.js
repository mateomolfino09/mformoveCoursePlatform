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

connectDB();

export async function POST(request) {
  try {
    if (request.method === 'POST') {
      const { email, name, gender, country } =
      await request.json();
      // const validCaptcha = await validateCaptcha(captcha);

      const user = await Users.findOne({ email: email });
      if (user) {

        const customUrl = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpAudience}/members`;
        const customNewsletterUrl = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpNewsletterAudience}/members`;
      
        const response = await fetch(customUrl, {
          method: "POST",
          headers: {
            Authorization: `apikey ${MailchimpKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_address: email,
            merge_fields: {
                NAME: name,
                PASSWORD: password
              },
            status: "subscribed",
          }),
        });
  
        const responseNews = await fetch(customNewsletterUrl, {
          method: "POST",
          headers: {
            Authorization: `apikey ${MailchimpKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_address: email,
            merge_fields: {
                NAME: name,
                PASSWORD: password
              },
            status: "subscribed",
          }),
        });


        return NextResponse.json({ error: 'Ya hay una cuenta con este usuario'}, { status: 422 })
      }
       
      const password = generatePassword(16);
      console.log(password, email, name, gender, country)
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

      await newUser.save();

      //SUBSCRIBO A MAILCHIMP PLATFORM

      const MailchimpKey = process.env.MAILCHIMP_API_KEY;
      const MailchimpServer = process.env.MAILCHIMP_API_SERVER;
      const MailchimpAudience = process.env.MAILCHIMP_PLATFORM_AUDIENCE_ID;
      const MailchimpNewsletterAudience = process.env.MAILCHIMP_RUTINAS_AUDIENCE_ID;

      console.log(MailchimpKey,MailchimpServer,  MailchimpAudience)
    
      const customUrl = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpAudience}/members`;
      const customNewsletterUrl = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpNewsletterAudience}/members`;
    
      const response = await fetch(customUrl, {
        method: "POST",
        headers: {
          Authorization: `apikey ${MailchimpKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          merge_fields: {
              NAME: name,
              PASSWORD: password
            },
          status: "subscribed",
        }),
      });

      const responseNews = await fetch(customNewsletterUrl, {
        method: "POST",
        headers: {
          Authorization: `apikey ${MailchimpKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          merge_fields: {
              NAME: name,
              PASSWORD: password
            },
          status: "subscribed",
          vip: false,
          tags: ["RUTINA"]
        }),
      });
      
      console.log(newUser)

      const token = jwt.sign(
        { userId: newUser._id },
        process.env.NEXTAUTH_SECRET,
        {
          expiresIn: '30d'
        }
      );

      newUser.token = `${token}`
      await newUser.save()

      newUser.password = null;


      return NextResponse.json({ message: `Te registraste con éxito.`, newUser, token }, { status: 200 })
    }
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: `Error al enviar el mail. Porfavor vuelva a intentarlo`}, { status: 500 })
  }
};

