import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import { NextResponse } from 'next/server';
import dLocalApi from '../dlocalTest';

connectDB();

export async function POST(req) {
    const {
        name, description, currency, amount, frequency_type
        } = await req.json();  
  try { 
      if (req.method === 'POST') {

        const response = await dLocalApi.post('/subscription/plan', {
            name,
            currency,
            description,
            amount,
            frequency_type,
            success_url: "localhost:3000/success",
            error_url: "localhost:3000/error",
            back_url: "localhost:3000/back"
          });  
            
          const data = response.data;

          const frequency_label = frequency_type === "MONTHLY" ? "Mensual" : "Anual" 

          const lastPlan = await Plan.find().sort({ _id: -1 }).limit(1);

          const newPlan = await new Plan({
            id: data?.id,
            name,
            merchant_id: data?.merchant_id,
            description,
            currency,
            country: data?.country,
            amount,
            error_url: data.error_url,
            success_url:data.success_url,
            back_url: data.back_url,
            frequency_type,
            frequency_value: data.frequency_value,
            frequency_label,
            active: data?.active,
            plan_token: data?.plan_token,
            free_trial_days: data?.free_trial_days,
    
          }).save();

        return NextResponse.json({ success: true, newPlan: newPlan, message: "Plan creado con éxito" }, { status: 200 })


    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
}
};
