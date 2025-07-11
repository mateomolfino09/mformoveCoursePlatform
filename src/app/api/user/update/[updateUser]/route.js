import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import User from '../../../../../models/userModel';

connectDB();
export async function PUT(req) {
    const {
      firstname, lastname, email, gender, country, rol, id
    } = await req.json();
    const userId = id;
    const fullName = firstname + ' ' + lastname;
    try {
    if (req.method === 'PUT') {
      await User.findByIdAndUpdate(userId, {
        name: fullName,
        email: email,
        gender: gender,
        country: country,
        rol: rol,
      });
    }
    return NextResponse.json({message: 'Usuario actualizado' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
