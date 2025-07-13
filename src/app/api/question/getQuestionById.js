import Question from '../../../models/questionModel';

export async function getQuestionById(id) {
  try {

    const res = await Question.where('id')
      .equals(id)
      .populate({ path: 'class' })
      .populate({ path: 'user' })
      .populate({ path: 'answers.answerAdmin' })
      .exec();

      const question = JSON.parse(JSON.stringify(res));
      return question[0];
  } catch (err) {
    }
}
