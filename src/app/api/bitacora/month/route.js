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
    
    if (!userToken) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener la bitácora del mes actual
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // Los meses son 0-indexed en JS
    const currentYear = now.getFullYear();

    // Buscar la bitácora del mes/año actual
    let logbook = await WeeklyLogbook.findOne({
      year: currentYear,
      month: currentMonth
    }).lean();

    // Si no existe la del mes actual, buscar la más reciente
    if (!logbook) {
      logbook = await WeeklyLogbook.findOne()
        .sort({ year: -1, month: -1 })
        .lean();
    }

    if (!logbook) {
      return NextResponse.json(
        { error: 'No se encontró ninguna bitácora' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { logbook },
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
    console.error('Error obteniendo bitácora del mes:', error);
    return NextResponse.json(
      { error: 'Error al obtener la bitácora', message: error.message },
      { status: 500 }
    );
  }
}

