import Users from '../../../../../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';

export async function POST(req) {
    connectDB();
    const { email, password } = await req.json();
    try {
      if (req.method === 'POST') {
        if (!email || !password) {
            return NextResponse.json({ error: 'Rellene ambos campos porfavor'}, { status: 422 })
        }
  
        const user = await Users.findOne({ email });
  
        if (!user) {
          return NextResponse.json({ message: 'La combinación usuario contraseña es incorrecta'}, { status: 404 })
        }
  
        // if (user.validEmail === 'not') {
        //     return NextResponse.json({ message: 'Debe confirmar su cuenta antes de ingresar al sitio',
        //     validate: true}, { status: 404 })
        // }
  
        const exists = await bcrypt.compare(password, user.password);
  
        if (exists) {
          const token = jwt.sign(
            { userId: user._id },
            process.env.NEXTAUTH_SECRET,
            {
              expiresIn: '30d'
            }
          );
  
          user.token = `${token}`
          await user.save()

          return NextResponse.json({
            login: true,
            token
          }, { status: 201 })
        }
  
        if (!exists) {
            return NextResponse.json({ message: 'La combinación usuario contraseña es incorrecta', type: 'error'}, { status: 401 })
        }
      } else {
        return NextResponse.json({ message: 'La combinación usuario contraseña es incorrecta', type: 'error'}, { status: 401 })
      }
    } catch (error) {
        return NextResponse.json({ message: 'Error inesperado, vuelva a intentar', type: 'error'}, { status: 500 })
    }
  };