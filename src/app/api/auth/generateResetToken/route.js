import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import User from '../../../../models/userModel';
import jwt from 'jsonwebtoken';
import { getCurrentURL } from '../../assets/getCurrentURL';
import mailchimp from '@mailchimp/mailchimp_transactional';

connectDB();

export async function POST(req) {
  try {
    const { email } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'No hemos encontrado ningún usuario con ese email' },
        { status: 404 }
      );
    }

    const token = jwt.sign({ _id: user._id }, process.env.NEXTAUTH_SECRET, {
      expiresIn: '30d',
    });

    user.resetToken = token;
    await user.save();

    return NextResponse.json(
      { message: `Se ha agregado un Token a ${user.email}.` },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Hubo un error al agregar un token a tu cuenta: ${error.message}` },
      { status: 500 }
    );
  }
}
