import connectDB from '../../../config/connectDB';
import Class from '../../../models/classModel';
import Course from '../../../models/courseModel';
import Question from '../../../models/questionModel';
import User from '../../../models/userModel';
import bcrypt from 'bcryptjs';

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
