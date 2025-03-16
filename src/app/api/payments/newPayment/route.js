import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import { NextResponse } from 'next/server';
import dLocalApi from '../dlocalConfig';
import { isToday, isTodayLastHour } from '../../assets/isTodayLastHour';
import { generateMd5 } from '../../helper/generateMd5';
import User from '../../../../models/userModel';
import { generatePassword } from '../../assets/randomPasswordGenerator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mailchimp from "@mailchimp/mailchimp_marketing";

connectDB();
mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_API_SERVER,
  });

export async function POST(req) {
    const body = await req.json();
    const { payment_id } = body; 
    
  try { 
    const response = await dLocalApi.get(`/payments/${payment_id}`);  
    const data = response.data.data;
    console.log(payment_id , data)

    if(data.status === "PAID") {

        // let user = await User.find({ email: data })
        // .lean()
        // .exec();
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })

    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
}
};
