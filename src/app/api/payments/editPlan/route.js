import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import { NextResponse } from 'next/server';
import dLocalApi from '../dlocalTest';

connectDB();

export async function PUT(req) {
    const {
        name, description, currency, amount
        } = await req.json();  
  try { 
      if (req.method === 'PUT') {

          const planToChange = await Plan.find({ id: id })
          .lean()
          .exec();

        const response = await dLocalApi.patch('/subscription/plan', {
            id: planToChange.id,
            merchant_id: planToChange.merchant_id,
            name,
            currency,
            description,
            amount,
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
