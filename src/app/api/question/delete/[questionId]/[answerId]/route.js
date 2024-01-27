import Question from '../../../../../../models/questionModel';
import { ObjectId } from 'mongodb';
import connectDB from '../../../../../../config/connectDB';
import { NextResponse } from 'next/server';

connectDB()

export async function DELETE(req) {
    try {
    if (req.method === 'DELETE') {

        const last = req.url.lastIndexOf('/');
        const penultimate = req.url.lastIndexOf('/', req.url.lastIndexOf('/') - 1);
        const answerIndex = req.url.substr(last + 1)
        const questionId = req.url.substring(penultimate + 1, last)

      const question = await Question.findOne({ id: questionId })
      .populate({ path: 'individualClass' })
      .populate({ path: 'user' })
      .populate({ path: 'answers.answerAdmin' })
      .exec();

      question.answers.splice(answerIndex, 1)

      await question.save()

      return NextResponse.json({  message: `Answer deleted`, success: true, question: question }, { status: 200 })
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message, success: false }, { status: 500 })
  }
}
