import clientPromise from '../../../../config/mongodb';
import Question from '../../../../models/questionModel';
import { ObjectId } from 'mongodb';

export default async function deleteQuestion(req, res) {
  try {
    if (req.method === 'DELETE') {
        
      const questionId = req.query.questionId;

      const question = await Question.deleteOne({
        id: questionId
      });
      res.status(200).json({ message: `Question deleted` });
    }
  } catch (e) {
    console.error(e);
    throw new Error(e).message;
  }
}
