import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import axios from 'axios';
import { verify } from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import { NextResponse } from 'next/server';
import dLocalApi from '../dlocalTest';

connectDB();

export async function POST(req) {
  const { name, description, currency, amount, frequency_type } =
    await req.json();

  try {
    const { origin } = absoluteUrl(req);

    console.log(origin);

    if (req.method === 'POST') {
        const response = await dLocalApi.post(
            '/payments',
            {
              name:name,
              currency: currency,
              amount: 10,
              country: 'UY',
              order_id: Math.floor(Math.random() * 500),//incrementar manualmente
              description: description,
              success_url: `${origin}/oneTimePaymentSucces`,
              back_url: `${origin}/payment/back`,
              notification_url: 'https://example.com/notifications'
            }
          );
          

      const data = response.data;

      console.log(data);

      return NextResponse.json(
        { response: data, success: true, message: 'Link creado con éxito' },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: 'Algo salió mal' }, { status: 401 });
    }
  } catch (err) {
    console.log(err); 
    return NextResponse.json({ error: 'Algo salió mal' }, { status: 401 });
  }
}
