import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import IndividualClass from '../../../../models/individualClassModel';
import { revalidateTag } from 'next/cache';

connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || "";

  try {
    let classes;
    if (search !== "") {
      classes = await IndividualClass.find({ name: { $regex: search, $options: 'i' } });
    } else {
      classes = await IndividualClass.find({});
    }

    revalidateTag('classes'); // Invalidar el caché relacionado con las clases
    return NextResponse.json(classes, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'x-vercel-cache': 'miss', // Forzar a Vercel a evitar el caché
      },
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ message: 'Error fetching classes' }, { status: 500 });
  }
}
