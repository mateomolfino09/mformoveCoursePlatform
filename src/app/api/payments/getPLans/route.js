import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import { revalidateTag } from 'next/cache';

// Conectar a la base de datos
connectDB();

export async function GET() {
  try {
    const plans = await Plan.find({});
    revalidateTag('plans');
    return NextResponse.json(plans, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },  // No cachear
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching plans' }, { status: 500 });
  }
}
