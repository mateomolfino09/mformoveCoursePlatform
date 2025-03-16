import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import dLocalApi from '../dlocalConfig';
import { verify } from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import { getCurrentURL } from '../../assets/getCurrentURL';
import { NextResponse } from 'next/server';
import { stripe } from '../stripe/stripeConfig';
import { createPlanDlocal } from './createPlanDLocal';
import { createPlanStripe } from './createPlanStripe';

connectDB();

export async function POST(req) {
    const {
        name, description, currency, amount, amountAnual, frequency_type, useStripe
        } = await req.json();  
  try { 

    if (req.method === 'POST') {
      if(useStripe) {
        //CASO STRIPE

        let plan = createPlanStripe({name,
          currency,
          description,
          amount,
          amountAnual})

        return NextResponse.json(
          { success: true, newPlan: plan, message: 'Plan creado con éxito' },
          { status: 200 }
        );

      } else {
        //CASO DLOCAL
        let plan = createPlanDlocal({name,
          currency,
          description,
          amount,
          frequency_type})
  
        return NextResponse.json(
          { success: true, newPlan: plan, message: 'Plan creado con éxito' },
          { status: 200 }
        );
      }

    } else {
      return NextResponse.json({ error: 'El metodo no fue post' }, { status: 500 });
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: err }, { status: 401 });
  }
}
