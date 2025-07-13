import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
const MentorshipRequest = require('../../../../../models/mentorshipRequestModel');

// Configuraciones para evitar caché en Vercel
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const solicitudes = await MentorshipRequest.find().sort({ createdAt: -1 });
    return NextResponse.json({ solicitudes }, { 
      status: 200,
      headers: { 
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'x-vercel-cache': 'miss'  // Forzar a Vercel a evitar el caché
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al obtener las solicitudes', error: error.message }, { status: 500 });
  }
} 