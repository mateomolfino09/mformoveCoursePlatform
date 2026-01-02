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
    const user = await Users.findById(decoded.userId).select('subscription');

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
        bitacoraBaseCompletada: false,
        bitacoraProgreso: {
          elCinturon: false,
          laEspiral: false,
          elRango: false,
          elCuerpoUtil: false
        },
        videosCompletados: 0,
        totalVideos: 4,
        necesitaOnboarding: false, // No necesita onboarding si no tiene suscripción activa
        sinSuscripcion: true
      }, { status: 200 });
    }

    // Obtener onboarding, manejando null/undefined
    const onboarding = user.subscription?.onboarding || {};
    const bitacoraProgreso = onboarding?.bitacoraBaseProgreso || {};
    
            // Calcular cuántos videos están completados (tratando null como false)
            const videosCompletados = [
              bitacoraProgreso?.elCinturon,
              bitacoraProgreso?.laEspiral,
              bitacoraProgreso?.elRango,
              bitacoraProgreso?.elCuerpoUtil
            ].filter(v => v === true).length;

            const bitacoraCompletada = videosCompletados === 4;

            console.log('contratoAceptado', user.subscription);

            // Solo verificar contrato aceptado (Bienvenida obligatoria)
            // La Bitácora Base es opcional y no bloquea el acceso
            const contratoAceptado = onboarding?.contratoAceptado === true;
            const necesitaOnboarding = !contratoAceptado;

    return NextResponse.json({
      contratoAceptado: contratoAceptado,
      bitacoraBaseCompletada: bitacoraCompletada,
      bitacoraProgreso: {
        elCinturon: bitacoraProgreso?.elCinturon === true,
        laEspiral: bitacoraProgreso?.laEspiral === true,
        elRango: bitacoraProgreso?.elRango === true,
        elCuerpoUtil: bitacoraProgreso?.elCuerpoUtil === true
      },
      videosCompletados,
      totalVideos: 4,
      necesitaOnboarding: necesitaOnboarding
    }, { status: 200 });

  } catch (error) {
    console.error('Error obteniendo estado de onboarding:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

