import { NextResponse } from 'next/server';
import connectDB from '../../../config/connectDB';
import User from '../../../models/userModel';

connectDB();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const filter = searchParams.get('filter') || 'ALL';

  const skip = (page - 1) * limit;

  try {
    let query = {};

    if (filter === 'VIP') {
      query = { subscription: { $exists: true, $ne: null } };
    } else if (filter === 'NON_VIP') {
      query = { subscription: { $exists: false } };
    }

    const users = await User.find(query).skip(skip).limit(limit).lean();

    const serializedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users: serializedUsers,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    return NextResponse.json(
      { message: 'Error al cargar usuarios' },
      { status: 500 }
    );
  }
}
