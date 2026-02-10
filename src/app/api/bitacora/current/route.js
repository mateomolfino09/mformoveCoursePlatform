import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '../../../../config/connectDB';
import WeeklyLogbook from '../../../../models/weeklyLogbookModel';

export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req) {
  try {
    // Conectar a la base de datos
    await connectDB();
    // Obtener el token del usuario desde las cookies
    const cookieStore = cookies();
    const userToken = cookieStore.get('userToken')?.value;
    
    // Esta ruta no requiere autenticación estricta, puede ser pública
    // pero verificamos si hay token para loguear en caso de error

    // Usar el método estático del modelo para obtener la camino actual
    const result = await WeeklyLogbook.getCurrentWeekLogbook();

    if (!result) {
      return NextResponse.json(
        { logbook: null, weeklyContent: null },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      );
    }

    return NextResponse.json(
      {
        logbook: result.logbook,
        weeklyContent: result.weeklyContent,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error obteniendo camino actual:', error);
    return NextResponse.json(
      { error: 'Error al obtener la camino actual', message: error.message, logbook: null, weeklyContent: null },
      { status: 200 } // Retornamos 200 con datos null para que no rompa el frontend
    );
  }
}

