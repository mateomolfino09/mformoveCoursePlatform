import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import User from '../../../../models/userModel';
import IndividualClass from '../../../../models/individualClassModel';

connectDB();

export async function GET() {
  try {
    const activeMembers = await User.countDocuments({
      $or: [
        { 'subscription.active': true },
        { isVip: true }
      ]
    });

    const classesAvailable = await IndividualClass.countDocuments({});

    return NextResponse.json({
      activeMembers,
      classesAvailable
    });
  } catch (error) {
    console.error('Error al obtener stats de Move Crew:', error);
    return NextResponse.json(
      { message: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
