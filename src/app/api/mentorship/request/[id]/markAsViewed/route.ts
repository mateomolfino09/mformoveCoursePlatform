import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../config/connectDB';
const MentorshipRequest = require('../../../../../../models/mentorshipRequestModel');

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const solicitud = await MentorshipRequest.findByIdAndUpdate(
      params.id,
      { vista: true },
      { new: true }
    );
    
    if (!solicitud) {
      return NextResponse.json({ message: 'Solicitud no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Solicitud marcada como vista', 
      solicitud 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ 
      message: 'Error al marcar como vista', 
      error: error.message 
    }, { status: 500 });
  }
} 