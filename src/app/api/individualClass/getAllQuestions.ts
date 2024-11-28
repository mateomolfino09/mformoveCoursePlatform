import connectDB from '../../../config/connectDB';
import Question from '../../../models/questionModel';
import User from '../../../models/userModel';
import IndividualClass from '../../../models/individualClassModel';
import ClassFilters from '../../../models/classFiltersModel';

connectDB();

export async function getQuestionsFromClass(classUId: string) {
  try {
    console.log(classUId)
    const res = await Question.where('individualClass')
      .equals(classUId)
      .populate({ path: 'individualClass' })
      // .populate({ path: 'user' })
      // .populate({ path: 'answers.answerAdmin' })
      .exec();

    const questions = JSON.parse(JSON.stringify(res));
    console.log(questions, res, 'hola')

    return questions;
  } catch (err) {
    console.log(err);
  }
}