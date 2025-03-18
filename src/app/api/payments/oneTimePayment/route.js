import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import axios from 'axios';
import { verify } from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import { NextResponse } from 'next/server';
import dLocalApi from '../dlocalConfig';
import { getCurrentURL } from '../../assets/getCurrentURL'

connectDB();

export async function POST(req) {
  const { name, description, currency, amount, back_url, success_url } =
    await req.json();

  try {
    let origin = getCurrentURL();
    console.log(`${origin}${back_url}`);

    if (req.method === 'POST') {
        const response = await dLocalApi.post(
            '/payments',
            {
              name:name,
              currency: currency,
              amount: +amount,
              order_id: Math.floor(Math.random() * 500),//incrementar manualmente
              description: description,
              success_url: `${origin}${success_url}`,
              back_url: `${origin}${back_url}`,
              notification_url: 'https://example.com/notifications',
              error_url:'https://www.youtube.com/watch?v=pfbQwKZTL-o&ab_channel=davus'
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
