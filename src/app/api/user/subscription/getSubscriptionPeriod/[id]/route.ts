import { NextResponse } from 'next/server';
import connectDB from '../../../../../../config/connectDB';
import Plan from '../../../../../../models/planModel';
import { getSubscriptionPeriod } from '../../../../payments/stripe/getSubscriptionPeriod';

connectDB();

export async function GET(req: Request) {
    try {
    const index = req.url.lastIndexOf('/');
    const subId = req.url.substr(index + 1)
    const {startDate, endDate, subscription} = await getSubscriptionPeriod(subId);
    // console

    return NextResponse.json({startDate, endDate, success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error, success: false }, { status: 404 })

  }
}
