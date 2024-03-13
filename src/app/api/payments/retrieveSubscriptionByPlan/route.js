import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import { NextResponse } from 'next/server';
import dLocalApi from '../dlocalTest';

connectDB();

export async function POST(req) {
    const {
        userId
        } = await req.json();  
  try { 
      if (req.method === 'GET') {

          const plans = await Plan.find({ })
          .lean()
          .exec();

          plans.forEach(async p => {
            const response = await dLocalApi.get(`/subscription/plan/${p.id}/subscription/all`);  
          });


            
          const data = response.data;

          planToChange = {
            ...planToChange,
            name: data.name,
            currency: data.currency,
            description: data.description,
            amount: data.amount
          }

          await planToChange.save();

        return NextResponse.json({ success: true, newPlan: planToChange }, { status: 200 })


    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
}
};
