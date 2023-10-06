import { cookies } from 'next/headers';
import connectDB from '../../../../../config/connectDB';
import User from '../../../../../models/userModel';
import { verify } from 'jsonwebtoken'
import { NextResponse } from 'next/server';

connectDB();

export async function GET(req) {
  try {
    const userToken= cookies().get('userToken').value;
    
      const data =  verify(userToken, process.env.NEXTAUTH_SECRET)

      const user = await User.findOne({ _id: data.userId });

      user ? user.password = undefined : null;

      return NextResponse.json({ user }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: 'Invalid Token' }, { status: 401 })
  }
};

