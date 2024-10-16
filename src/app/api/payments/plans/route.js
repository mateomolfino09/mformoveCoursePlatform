// src/app/api/payments/plans/route.js
import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';

export const dynamic = "force-dynamic"; 
export const fetchCache = "force-no-store";

connectDB();

export async function GET() {
  try {
    const plans = await Plan.find({});
    return NextResponse.json(plans, { status: 200 });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json({ message: 'Error fetching plans' }, { status: 500 });
  }
}
