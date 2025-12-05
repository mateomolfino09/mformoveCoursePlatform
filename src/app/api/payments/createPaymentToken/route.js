import Users from '../../../../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import mailchimp from "@mailchimp/mailchimp_marketing";

export async function POST(req) {
    connectDB();
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_API_SERVER,
    });
    const { email, planId } = await req.json();
    try {
      if (req.method === 'POST') {

        const user = await Users.findOne({ email });
  
        if (!user) {
          return NextResponse.json({ message: 'Usuario no encontrado'}, { status: 404 })
        }

        // Permitir suscribirse si la suscripción está cancelada, incluso si aún está activa hasta el fin del período
        if(user?.subscription != null && user?.subscription.active && !user?.subscription.isCanceled) {
          return NextResponse.json({ message: 'Ya estas subscripto y tus pagos se realizaron con éxito.', type: 'error', success: false}, { status: 401 })
        }
    
        const token = jwt.sign(
        { userId: user._id },
        process.env.NEXTAUTH_SECRET,
        {
            expiresIn: '30d'
        }
        );

        const planToken = jwt.sign(
          { planId: planId },
          process.env.NEXTAUTH_SECRET,
          {
              expiresIn: '30d'
          }
          );

        return NextResponse.json({
        token,
        planToken,
        success: true
        }, { status: 201 })
  
      } else {
        return NextResponse.json({ message: 'Error inesperado, vuelva a intentar', type: 'error'}, { status: 401 })
      }
    } catch (error) {
        return NextResponse.json({ message: 'Error inesperado, vuelva a intentar', type: 'error'}, { status: 500 })
    }
  };