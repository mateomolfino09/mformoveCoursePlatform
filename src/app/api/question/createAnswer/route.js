import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Question from '../../../../models/questionModel';
import Users from '../../../../models/userModel';

connectDB();

export async function POST(req) {
    try {
    if (req.method === 'POST') {
      const {
        answer, questionId, userId
        } = await req.json();
      //Existe?
      let question = await Question.findOne({ id: questionId }).populate('user');
      let user = await Users.findOne({ id: userId });

      !question && NextResponse.json({ error: "Esta pregunta no existe", success: false }, { status: 500 })

      const answerObj = {
        answer: answer,
        answerAdmin: user,
        answeredAt: Date.now()
      };
      question.answers.push(answerObj);

      question.hasAnswer = true;

      await question.save();

      return NextResponse.json({ message: 'Pregunta enviada correctamente',
      question: question, success: true }, { status: 200 })

    }
  } catch (error) {
    console.log(error.message);
    return NextResponse.json({ error: e.message, success: false }, { status: 500 })

  }
};
