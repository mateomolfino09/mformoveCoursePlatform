import Users from '../../../../models/userModel';
import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    await connectDB();
    
    const token = req.cookies.get('userToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    const userId = decoded._id || decoded.userId || decoded.id;
    const user = await Users.findById(userId).select('subscription');

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario tenga suscripción activa
    if (!user.subscription?.active) {
      return NextResponse.json({
        contratoAceptado: false,
        necesitaOnboarding: false,
        sinSuscripcion: true
      }, { status: 200 });
    }

    const onboarding = user.subscription?.onboarding || {};
    const contratoAceptado = onboarding?.contratoAceptado === true;
    const necesitaOnboarding = !contratoAceptado;

    return NextResponse.json({
      contratoAceptado,
      necesitaOnboarding
    }, { status: 200 });

  } catch (error) {
    console.error('Error obteniendo estado de onboarding:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

