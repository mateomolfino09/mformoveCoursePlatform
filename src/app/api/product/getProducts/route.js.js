import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Product from '../../../../models/productModel';
import { revalidateTag } from 'next/cache';

// Conectar a la base de datos
connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const products = await Product.find({}).populate('classes');

    revalidateTag('products');

    return NextResponse.json(products, {
      status: 200,
      headers: { 
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'x-vercel-cache': 'miss'  // Forzar a Vercel a evitar el caché
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
  }
}