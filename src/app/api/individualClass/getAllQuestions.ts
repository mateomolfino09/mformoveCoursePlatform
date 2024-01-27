import connectDB from '../../../config/connectDB';
import Question from '../../../models/questionModel';

connectDB();

export async function getQuestionsFromClass(classUId: string) {
  try {
    const res = await Question.where('individualClass')
      .equals(classUId)
      .populate({ path: 'individualClass' })
      .populate({ path: 'user' })
      .populate({ path: 'answers.answerAdmin' })
      .exec();

    const questions = JSON.parse(JSON.stringify(res));

    return questions;
  } catch (err) {
    console.log(err);
  }
}