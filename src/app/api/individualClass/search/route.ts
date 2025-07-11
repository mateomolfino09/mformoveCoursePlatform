import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import IndividualClassModel from '../../../../models/individualClassModel';
import { IndividualClass } from '../../../../../typings';

export const dynamic = "force-dynamic"; // 👈 Solución

connectDB();
export async function GET(req: any) {
  try {
    const { searchParams } = new URL(req.url)
    const text = searchParams.get('text')

    if (req.method === 'GET') { 

      const regex = new RegExp(text ? text : "", 'i'); // 'i' flag makes the search case-insensitive

      const individualClass: IndividualClass[] | null = await IndividualClassModel.find({ name: { $regex: regex } });
      return NextResponse.json({ individualClass: individualClass }, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({error: 'Hubo un error'}, { status: 404 })
  }
}
