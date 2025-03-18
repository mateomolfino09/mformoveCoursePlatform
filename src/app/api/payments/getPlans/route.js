import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import { revalidateTag } from 'next/cache';

// Conectar a la base de datos
connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store'
export async function GET() {
  try {
    const plans = await Plan.find({ active: true });
    revalidateTag('plans');
    return NextResponse.json(plans, {
        status: 200,
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'x-vercel-cache': 'miss'  // Forzar a Vercel a evitar el caché
        },
      });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching plans' }, { status: 500 });
  }
}
