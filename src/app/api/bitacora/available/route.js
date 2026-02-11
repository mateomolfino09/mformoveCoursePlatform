import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';
import User from '../../../../models/userModel';

export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const userToken = cookieStore.get('userToken')?.value;

    if (!userToken) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = verify(userToken, process.env.NEXTAUTH_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener el userId del token
    const userId = decoded.userId || decoded._id || decoded.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Token inválido: no se pudo obtener el ID de usuario' },
        { status: 401 }
      );
    }

    // Obtener el usuario de la base de datos
    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    // Verificar que tenga suscripción activa o sea administrador
    const hasActiveSubscription = user.subscription?.active || user.isVip;
    const isAdmin = user.rol === 'Admin';

    if (!hasActiveSubscription && !isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere suscripción activa.' },
        { status: 403 }
      );
    }

    // Obtener todas las caminos (sin camino base) ordenadas por año y mes (más recientes primero)
    const logbooks = await WeeklyLogbook.find({ isBaseBitacora: { $ne: true } })
      .sort({ year: -1, month: -1, createdAt: -1 })
      .select('_id month year title description createdAt')
      .lean();

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const formattedLogbooks = logbooks.map(logbook => ({
      _id: logbook._id,
      month: logbook.month,
      year: logbook.year,
      monthName: monthNames[logbook.month - 1],
      title: logbook.title || `Camino - ${monthNames[logbook.month - 1]} ${logbook.year}`,
      description: logbook.description || '',
      createdAt: logbook.createdAt,
      isBaseBitacora: false
    }));

    return NextResponse.json(
      { 
        success: true,
        logbooks: formattedLogbooks || []
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Error obteniendo caminos disponibles:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error al obtener las caminos disponibles' 
      },
      { status: 500 }
    );
  }
}


