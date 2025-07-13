import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import ProductFilters from '../../../../models/productFiltersModel';

connectDB();

export async function GET() {
  try {
    const res = await ProductFilters.find({})
      .lean()
      .exec();
    const productFilters = JSON.parse(JSON.stringify(res));
    return NextResponse.json(productFilters);
  } catch (err) {
    console.error('Error getting product filters:', err);
    return NextResponse.json([], { status: 200 }); // Retornar array vacío en caso de error
  }
} 