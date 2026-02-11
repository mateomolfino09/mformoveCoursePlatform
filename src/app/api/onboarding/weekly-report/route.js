import Users from '../../../../models/userModel';
import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import jwt from 'jsonwebtoken';

// Función para obtener el número de semana del año
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return `${d.getUTCFullYear()}-W${Math.ceil((((d - yearStart) / 86400000) + 1) / 7)}`;
}

export async function POST(req) {
  try {
    await connectDB();
    
    const token = req.cookies.get('userToken')?.value;
    const { feedbackSensorial, feedbackTecnico } = await req.json();
    
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
        { error: 'Solo usuarios con suscripción activa pueden enviar reportes' },
        { status: 403 }
      );
    }

    const semanaActual = getWeekNumber(new Date());
    
    // Inicializar estructura si no existe
    user.subscription.onboarding = user.subscription.onboarding || {};
    user.subscription.onboarding.practicasSemanales = user.subscription.onboarding.practicasSemanales || [];

    // Buscar o crear entrada para la semana actual
    let semanaEntry = user.subscription.onboarding.practicasSemanales.find(
      p => p.semana === semanaActual
    );

    if (!semanaEntry) {
      semanaEntry = {
        semana: semanaActual,
        cantidadPracticas: 0,
        reporteCompletado: false
      };
      user.subscription.onboarding.practicasSemanales.push(semanaEntry);
    }

    // Guardar reporte
    semanaEntry.reporteCompletado = true;
    semanaEntry.fechaReporte = new Date();
    semanaEntry.feedbackSensorial = feedbackSensorial || '';
    semanaEntry.feedbackTecnico = feedbackTecnico || '';

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Reporte guardado correctamente',
      semana: semanaActual
    }, { status: 200 });

  } catch (error) {
    console.error('Error guardando reporte semanal:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// Endpoint para incrementar contador de prácticas
export async function PUT(req) {
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
        { error: 'Solo usuarios con suscripción activa pueden registrar prácticas' },
        { status: 403 }
      );
    }

    const semanaActual = getWeekNumber(new Date());
    
    user.subscription.onboarding = user.subscription.onboarding || {};
    user.subscription.onboarding.practicasSemanales = user.subscription.onboarding.practicasSemanales || [];

    let semanaEntry = user.subscription.onboarding.practicasSemanales.find(
      p => p.semana === semanaActual
    );

    if (!semanaEntry) {
      semanaEntry = {
        semana: semanaActual,
        cantidadPracticas: 0,
        reporteCompletado: false
      };
      user.subscription.onboarding.practicasSemanales.push(semanaEntry);
    }

    semanaEntry.cantidadPracticas = (semanaEntry.cantidadPracticas || 0) + 1;

    await user.save();

    return NextResponse.json({
      success: true,
      cantidadPracticas: semanaEntry.cantidadPracticas,
      necesitaReporte: semanaEntry.cantidadPracticas >= 2 && !semanaEntry.reporteCompletado
    }, { status: 200 });

  } catch (error) {
    console.error('Error incrementando práctica:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

