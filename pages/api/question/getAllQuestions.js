import connectDB from '../../../config/connectDB';
import Question from '../../../models/questionModel';

connectDB();

export async function getQuestionsFromClass(classUId) {
  try {
    console.log(classUId);
    const res = await Question.where('class')
      .equals(classUId)
      .populate({ path: 'class' })
      .populate({ path: 'user' })
      .populate({ path: 'answers.answerAdmin' })
      .exec();

    const questions = JSON.parse(JSON.stringify(res));
    console.log(questions[0]);

    return questions;
  } catch (err) {
    console.log(err);
  }
}
