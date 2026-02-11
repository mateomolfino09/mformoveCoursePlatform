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

    // Otorgar 1 U.C. por aceptar el contrato (primera vez)
    let totalUnits = 0;
    let ucOtorgada = false;
    try {
      // Buscar o crear el tracking de coherencia
      let tracking = await CoherenceTracking.findOne({ userId: user._id });
      
      if (!tracking) {
        // Crear nuevo tracking si no existe
        tracking = await CoherenceTracking.create({
          userId: user._id,
          totalUnits: 0,
          currentStreak: 0,
          longestStreak: 0,
          weeklyCompletions: []
        });
      }

      // Verificar si ya se otorgó la U.C. del contrato
      const yaTieneUcContrato = tracking.totalUnits > 0 && 
        tracking.weeklyCompletions?.some(completion => 
          completion.programWeeks?.some(pw => pw.weekNumber === 0 && pw.ucsOtorgadas > 0)
        );

      if (!yaTieneUcContrato) {
        // Otorgar 1 U.C. por aceptar el contrato
        tracking.totalUnits = (tracking.totalUnits || 0) + 1;
        
        // Agregar a weeklyCompletions como semana especial (weekNumber: 0 para onboarding)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStartDate = new Date(now);
        weekStartDate.setDate(now.getDate() - daysToMonday);
        weekStartDate.setHours(0, 0, 0, 0);

        // Buscar o crear la semana calendario actual
        let currentWeekCompletion = tracking.weeklyCompletions?.find(completion => {
          const completionWeekStart = new Date(completion.weekStartDate);
          completionWeekStart.setHours(0, 0, 0, 0);
          const currentWeekStart = new Date(weekStartDate);
          currentWeekStart.setHours(0, 0, 0, 0);
          return completionWeekStart.getTime() === currentWeekStart.getTime();
        });

        if (!currentWeekCompletion) {
          currentWeekCompletion = {
            weekStartDate: weekStartDate,
            programWeeks: []
          };
          if (!tracking.weeklyCompletions) {
            tracking.weeklyCompletions = [];
          }
          tracking.weeklyCompletions.push(currentWeekCompletion);
        }

        // Inicializar programWeeks si no existe
        if (!currentWeekCompletion.programWeeks) {
          currentWeekCompletion.programWeeks = [];
        }

        // Agregar la semana especial del onboarding (weekNumber: 0)
        currentWeekCompletion.programWeeks.push({
          weekNumber: 0, // 0 = onboarding/contrato
          ucsOtorgadas: 1,
          completedVideo: false,
          completedAudio: false,
          completedAt: now
        });

        await tracking.save();
        totalUnits = tracking.totalUnits;
        ucOtorgada = true;
      } else {
        // Ya tiene la U.C., solo devolver el total actual
        totalUnits = tracking.totalUnits;
        ucOtorgada = false;
      }
    } catch (error) {
      console.error('Error otorgando U.C. por contrato:', error);
      // No fallar la aceptación del contrato si hay error al otorgar U.C.
    }

    return NextResponse.json({
      success: true,
      message: 'Contrato aceptado correctamente',
      ucOtorgada: ucOtorgada,
      totalUnits: totalUnits,
      esPrimeraVez: esPrimeraVez // Indicar si es la primera vez que acepta el contrato
    }, { status: 200 });

  } catch (error) {
    console.error('Error aceptando contrato:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

