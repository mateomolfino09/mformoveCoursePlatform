import Users from '../../../../models/userModel';
import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import jwt from 'jsonwebtoken';
import CoherenceTracking from '../../../../models/coherenceTrackingModel';

export async function POST(req) {
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
    const user = await Users.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario tenga suscripción activa
    if (!user.subscription?.active) {
      return NextResponse.json(
        { error: 'Solo usuarios con suscripción activa pueden completar el onboarding' },
        { status: 403 }
      );
    }

    // Verificar si es la primera vez que acepta el contrato
    const esPrimeraVez = !user.subscription?.onboarding?.contratoAceptado;

    // Marcar contrato como aceptado
    user.subscription.onboarding = user.subscription.onboarding || {};
    user.subscription.onboarding.contratoAceptado = true;
    user.subscription.onboarding.fechaAceptacionContrato = new Date();
    
    await user.save();

    // U.C. deshabilitado: ya no se otorgan unidades por aceptar el contrato
    // let totalUnits = 0;
    // let ucOtorgada = false;
    // try {
    //   let tracking = await CoherenceTracking.findOne({ userId: user._id });
    //   if (!tracking) {
    //     tracking = await CoherenceTracking.create({
    //       userId: user._id,
    //       totalUnits: 0,
    //       currentStreak: 0,
    //       longestStreak: 0,
    //       weeklyCompletions: []
    //     });
    //   }
    //   const yaTieneUcContrato = tracking.totalUnits > 0 && ...
    //   if (!yaTieneUcContrato) {
    //     tracking.totalUnits = (tracking.totalUnits || 0) + 1;
    //     ... programWeeks.push({ weekNumber: 0, ucsOtorgadas: 1, ... });
    //     await tracking.save();
    //     totalUnits = tracking.totalUnits;
    //     ucOtorgada = true;
    //   } else {
    //     totalUnits = tracking.totalUnits;
    //     ucOtorgada = false;
    //   }
    // } catch (error) {
    //   console.error('Error otorgando U.C. por contrato:', error);
    // }

    return NextResponse.json({
      success: true,
      message: 'Contrato aceptado correctamente',
      ucOtorgada: false, // U.C. deshabilitado
      totalUnits: 0,
      esPrimeraVez: esPrimeraVez
    }, { status: 200 });

  } catch (error) {
    console.error('Error aceptando contrato:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

