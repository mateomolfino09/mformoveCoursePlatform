import connectDB from '../../../../config/connectDB';
import FAQs from '../../../../models/faqModel';
import { getCurrentURL } from '../../assets/getCurrentURL';

import { NextResponse } from 'next/server';

connectDB();

export async function POST(req) {
  const { question, answer } = await req.json();

  try {
    let origin = getCurrentURL();
    console.log(origin);

    if (req.method === 'POST') {
      // Crea y guarda la nueva FAQ en la base de datos
      const newFAQ = await new FAQs({
        question: question,
        answer: answer
      }).save();

      return NextResponse.json(
        { success: true, newFAQ: newFAQ, message: 'FAQ creado con éxito' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'El método no es POST' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
