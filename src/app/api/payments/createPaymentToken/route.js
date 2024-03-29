import Users from '../../../../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';

export async function POST(req) {
    connectDB();
    const { email } = await req.json();
    try {
      if (req.method === 'POST') {

  
        const user = await Users.findOne({ email });
  
        if (!user) {
          return NextResponse.json({ message: 'Usuario no encontrado'}, { status: 404 })
        }
    
        const token = jwt.sign(
        { userId: user._id },
        process.env.NEXTAUTH_SECRET,
        {
            expiresIn: '30d'
        }
        );

        return NextResponse.json({
        token
        }, { status: 201 })
  
      } else {
        return NextResponse.json({ message: 'Error inesperado, vuelva a intentar', type: 'error'}, { status: 401 })
      }
    } catch (error) {
        return NextResponse.json({ message: 'Error inesperado, vuelva a intentar', type: 'error'}, { status: 500 })
    }
  };