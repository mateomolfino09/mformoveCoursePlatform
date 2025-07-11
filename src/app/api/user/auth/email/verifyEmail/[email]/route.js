import { NextResponse } from 'next/server';
import connectDB from '../../../../../../../config/connectDB';
import User from '../../../../../../../models/userModel';

connectDB();
export async function GET(request, { params }) {
  try {
    const { email } = params
    const user = await User.find({ email }).lean().exec();

    if (user.length != 0 && user[0].validEmail == 'not') {
      user[0].password = null;
      return NextResponse.json({ error: 'Ya hay un usuario registrado con este email sin verificar.' , resend: true, user: user[0]}, { status: 409 })

    }


    if (user.length != 0)
      return NextResponse.json({ error: 'Ya hay un usuario registrado con este email.' }, { status: 409 })

    return NextResponse.json({ message: 'Avanza' }, { status: 200 })
  } catch (error) {
    }
  return NextResponse.json('hola')
}

