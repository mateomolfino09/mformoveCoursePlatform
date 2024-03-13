import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import User from '../../../../models/userModel';
import { NextResponse } from 'next/server';
import dLocalApi from '../dlocalTest';
import { subtle } from 'crypto';

connectDB();

export async function POST(req) {
    const {
        userId
        } = await req.json();  
  try { 
      if (req.method === 'POST') {

          const user = await User.find({ user: userId })
          .lean()
          .exec();

          if(user.subscription.active) return NextResponse.json({ success: true, subscription: user.subscription }, { status: 200 })
          else return NextResponse.json({ error: 'No tienes subscripcion' }, { status: 404 })

    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
}
};
