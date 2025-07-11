import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import IndividualClass from '../../../../../models/individualClassModel';
import { revalidateTag } from 'next/cache';

// Conectar a la base de datos
connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request, { params }) {
  try {
    const { classType } = params;

    const classes = await IndividualClass.find({
      type: { $regex: classType, $options: 'i' },
    });

    return NextResponse.json(classes, {
      status: 200,
      headers: { 
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'x-vercel-cache': 'miss'  // Forzar a Vercel a evitar el caché
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching classes' }, { status: 500 });
  }
}
