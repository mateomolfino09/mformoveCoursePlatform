import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import Plan from '../../../../../models/planModel';

connectDB();
export async function GET(req) {
    try {
    const index = req.url.lastIndexOf('/');
    const planId = req.url.substr(index + 1)
    const plan = await Plan.findOne({ id: planId });
    const planStr = JSON.parse(JSON.stringify(plan));

    // console

    return NextResponse.json({plan: planStr, success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error, success: false }, { status: 404 })

  }
}
