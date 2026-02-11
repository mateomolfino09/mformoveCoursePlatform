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

    // Obtener parámetros de query (id, mes y año)
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    let logbook;

    // Si se proporciona un ID, buscar por ID directamente
    if (idParam) {
      logbook = await WeeklyLogbook.findById(idParam).lean();
      // Si no se encuentra por ID, buscar la más reciente como fallback
      if (!logbook) {
        logbook = await WeeklyLogbook.findOne({ isBaseBitacora: { $ne: true } })
          .sort({ year: -1, month: -1 })
          .lean();
      }
    } else if (monthParam && yearParam) {
      // Si se proporcionan mes y año, buscar por esos parámetros
      const targetMonth = parseInt(monthParam, 10);
      const targetYear = parseInt(yearParam, 10);
      
      logbook = await WeeklyLogbook.findOne({
        year: targetYear,
        month: targetMonth,
        isBaseBitacora: { $ne: true } // Excluir caminos base
      }).lean();
      
      // Si no existe, buscar la más reciente como fallback
      if (!logbook) {
        logbook = await WeeklyLogbook.findOne({ isBaseBitacora: { $ne: true } })
          .sort({ year: -1, month: -1 })
          .lean();
      }
    } else {
      // Si no se proporcionan parámetros, usar el mes/año actual
      const now = new Date();
      const targetMonth = now.getMonth() + 1; // Los meses son 0-indexed en JS
      const targetYear = now.getFullYear();

      logbook = await WeeklyLogbook.findOne({
        year: targetYear,
        month: targetMonth,
        isBaseBitacora: { $ne: true } // Excluir caminos base
      }).lean();

      // Si no existe la del mes actual, buscar la más reciente
      if (!logbook) {
        logbook = await WeeklyLogbook.findOne({ isBaseBitacora: { $ne: true } })
          .sort({ year: -1, month: -1 })
          .lean();
      }
    }

    if (!logbook) {
      return NextResponse.json(
        { error: 'No se encontró ninguna camino' },
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
    console.error('Error obteniendo camino del mes:', error);
    return NextResponse.json(
      { error: 'Error al obtener la camino', message: error.message },
      { status: 500 }
    );
  }
}

