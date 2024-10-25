import { NextResponse } from 'next/server';
import FAQ from '../.././../models/faqModel';
import { revalidateTag } from 'next/cache';
import connectDB from '../../../config/connectDB';
// Conectar a la base de datos
connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store'
export async function GET() {
  try {
    const faqs = await FAQ.find({});
    revalidateTag('faqs');
    return NextResponse.json(faqs, {
        status: 200,
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'x-vercel-cache': 'miss'  // Forzar a Vercel a evitar el caché
        },
      });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching faqs' }, { status: 500 });
  }
}
