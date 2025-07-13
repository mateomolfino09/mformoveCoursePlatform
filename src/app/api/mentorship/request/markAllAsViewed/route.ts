import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
const MentorshipRequest = require('../../../../../models/mentorshipRequestModel');

export async function PATCH(req: NextRequest) {
  await connectDB();
  try {
    const result = await MentorshipRequest.updateMany(
      { vista: false },
      { vista: true }
    );

    return NextResponse.json({ 
      message: `${result.modifiedCount} solicitudes marcadas como vistas`, 
      modifiedCount: result.modifiedCount
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ 
      message: 'Error al marcar solicitudes como vistas', 
      error: error.message 
    }, { status: 500 });
  }
} 