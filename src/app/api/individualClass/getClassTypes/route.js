import { NextResponse } from 'next/server';
import ClassFilters from '../../../../models/classFiltersModel';
import { revalidateTag } from 'next/cache';
import connectDB from '../../../../config/connectDB';

// Conectar a la base de datos
connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const classFilters = await ClassFilters.find({}).lean().exec();
    revalidateTag('classFilters');
    return NextResponse.json(classFilters, {
      status: 200,
      headers: { 
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'x-vercel-cache': 'miss'  // Forzar a Vercel a evitar el caché
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching class filters' }, { status: 500 });
  }
}
