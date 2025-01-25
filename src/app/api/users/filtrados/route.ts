import connectDB from '../../../../config/connectDB';
import User from '../../../../models/userModel';
import { NextResponse } from 'next/server';

connectDB();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const isVipParam = searchParams.get('isVip'); // Original string value
  const isVip = isVipParam === 'true'; // Convert to boolean

  const skip = (page - 1) * limit;

  try {
    const users = await User.find({ isVip }).skip(skip).limit(limit).lean();

    const serializedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString()
    }));

    const total = await User.countDocuments({ isVip }); // Count only matching documents

    return NextResponse.json({
      users: serializedUsers,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    return NextResponse.json(
      { message: 'Error al cargar usuarios' },
      { status: 500 }
    );
  }
}
