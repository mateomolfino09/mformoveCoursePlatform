import Question from '../../../../../models/questionModel';
import { ObjectId } from 'mongodb';
import connectDB from '../../../../../config/connectDB';

connectDB()

export default async function deleteQuestion(req, res) {
  try {
    if (req.method === 'DELETE') {
    
      const questionId = req.query.questionId;
      const answerIndex = req.query.answerId;

      const question = await Question.findOne({ id: questionId })
      .populate({ path: 'class' })
      .populate({ path: 'user' })
      .populate({ path: 'answers.answerAdmin' })
      .exec();

      question.answers.splice(answerIndex, 1)

      await question.save()

      res.status(200).send({question : question});
    }
  } catch (e) {
    console.error(e);
    throw new Error(e).message;
  }
}
