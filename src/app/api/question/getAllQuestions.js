import connectDB from '../../../config/connectDB';
import Question from '../../../models/questionModel';

connectDB();

export async function getQuestionsFromClass(classUId) {
  try {
    const res = await Question.where('class')
      .equals(classUId)
      .populate({ path: 'class' })
      .populate({ path: 'user' })
      .populate({ path: 'answers.answerAdmin' })
      .exec();

    const questions = JSON.parse(JSON.stringify(res));

    return questions;
  } catch (err) {
    }
}
