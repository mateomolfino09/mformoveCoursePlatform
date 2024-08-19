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
      const { email, firstname, lastname, gender, country } =
      await request.json();
      // const validCaptcha = await validateCaptcha(captcha);

      const user = await Users.findOne({ email: email });
      if (user) {
        return NextResponse.json({ error: 'Ya hay una cuenta con este usuario'}, { status: 422 })
      }
       
      const password = generatePassword(16);
      console.log(password)
      const HashedPassword = await bcrypt.hash(password, 12);

      const newUser = await new Users({
        email: email,
        password: HashedPassword,
        name: `${firstname} ${lastname}`,
        gender: gender,
        country: country
      });

      newUser.validEmail = 'yes';
      newUser.emailToken = undefined;
      newUser.courses = [];
      let userClass = [];

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

      return NextResponse.json({ message: `Te registraste con éxito.`, newUser }, { status: 200 })
    }
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: `Error al enviar el mail. Porfavor vuelva a intentarlo`}, { status: 500 })
  }
};

