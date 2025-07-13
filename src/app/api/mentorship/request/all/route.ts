import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
const MentorshipRequest = require('../../../../../models/mentorshipRequestModel');

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const solicitudes = await MentorshipRequest.find().sort({ createdAt: -1 });
    return NextResponse.json({ solicitudes }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al obtener las solicitudes', error: error.message }, { status: 500 });
  }
} 