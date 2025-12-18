import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import InPersonClass from '../../../../models/inPersonClassModel';

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const dayOfWeek = searchParams.get('dayOfWeek');

    let query = {};
    
    if (active !== null) {
      query.active = active === 'true';
    }
    
    if (dayOfWeek) {
      query['schedules.dayOfWeek'] = dayOfWeek;
    }

    const classes = await InPersonClass.find(query).sort({ 
      'schedules.dayOfWeek': 1,
      'schedules.startTime': 1 
    });

    return NextResponse.json(classes, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching in-person classes:', error);
    return NextResponse.json(
      { message: 'Error fetching in-person classes', error: error.message },
      { status: 500 }
    );
  }
}


