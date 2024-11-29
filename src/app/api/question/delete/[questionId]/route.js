import { NextResponse } from 'next/server';
import Question from '../../../../../models/questionModel';
import { ObjectId } from 'mongodb';

export async function DELETE(req) {
    try {
    if (req.method === 'DELETE') {

        const indexClass = req.url.lastIndexOf('/');
        const questionId = req.url.substr(indexClass + 1)


        const numericQuestionId = Number(questionId); // Convierte a Number
        if (isNaN(numericQuestionId)) {
          return NextResponse.json({ error: "El ID proporcionado no es válido" }, { status: 400});
        }
        
        const question = await Question.deleteOne({
          id: numericQuestionId, // Ahora es un número
        });

        return NextResponse.json({  message: `Question deleted`, success: true }, { status: 200 })
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message, success: false }, { status: 404 })
  }
}
