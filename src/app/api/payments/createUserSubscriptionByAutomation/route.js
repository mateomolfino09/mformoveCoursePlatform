import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import { NextResponse } from 'next/server';
import dLocalApi from '../dlocalTest';
import { getCurrentURL } from '../../assets/getCurrentURL';

connectDB();

export async function POST(req) {
    const {
        email, planId
        } = await req.json();  
  try { 
      if (req.method === 'POST') {

        let origin = getCurrentURL();


        const response = await dLocalApi.get(`/subscription/plan/${planId}/subscription/all`);  
        const data = response.data;

        return NextResponse.json({ data }, { status: 200 })


    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
}
};
