import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import userModel from '../../../../models/userModel';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    await connectDB();

    // Obtener el token de las cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('userToken')?.value;

    console.log('token', token);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar el token
    let decoded;
    try {
      decoded = verify(token, process.env.NEXTAUTH_SECRET);
    } catch (error) {
      console.error('Error verificando token:', error);
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Buscar el usuario
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que tenga suscripción activa
    if (!user.subscription?.active && !user.isVip) {
      return NextResponse.json(
        { success: false, message: 'No tienes una suscripción activa' },
        { status: 403 }
      );
    }

    // Marcar el tutorial como completado
    if (!user.subscription.onboarding) {
      user.subscription.onboarding = {};
    }

    user.subscription.onboarding.tutorialBitacoraCompletado = true;
    user.subscription.onboarding.fechaTutorialBitacora = new Date();

    // Marcar el subdocumento como modificado para que Mongoose lo guarde
    user.markModified('subscription.onboarding');

    console.log('user.subscription.onboarding', user.subscription.onboarding);
    console.log('user.subscription.onboarding.tutorialBitacoraCompletado', user.subscription.onboarding.tutorialBitacoraCompletado);
    console.log('user.subscription.onboarding.fechaTutorialBitacora', user.subscription.onboarding.fechaTutorialBitacora);

    await user.save();

    // Verificar que se guardó correctamente
    const savedUser = await userModel.findById(decoded.userId);
    console.log('Verificación después de guardar - tutorialBitacoraCompletado:', savedUser.subscription?.onboarding?.tutorialBitacoraCompletado);

    console.log('user saved', user);

    return NextResponse.json({
      success: true,
      message: 'Tutorial de bitácora completado correctamente',
    });
  } catch (error) {
    console.error('Error completando tutorial de bitácora:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

