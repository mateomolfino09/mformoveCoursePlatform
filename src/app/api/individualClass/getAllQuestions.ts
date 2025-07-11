import connectDB from '../../../config/connectDB';
import QuestionModel from '../../../models/questionModel';
import User from '../../../models/userModel';
import IndividualClass from '../../../models/individualClassModel';
import ClassFilters from '../../../models/classFiltersModel';
import { Answer, Question } from '../../../../typings';

connectDB();

export async function getQuestionsFromClass(classUId: string) {
  try {
// Paso 1: Obtener las preguntas relacionadas
const questions = await QuestionModel.where('individualClass').equals(classUId).exec();

// Paso 2: Obtener las referencias relacionadas
const individualClasses = await IndividualClass.find({
  _id: { $in: questions.map(q => q.individualClass).filter(Boolean) },
});

const users = await User.find({
  _id: { $in: questions.map(q => q.user).filter(Boolean) },
});

// Paso 3: Crear el nuevo arreglo de `Question[]`
const formattedQuestions: Question[] = questions.map(q => {
  const individualClass = individualClasses.find(ic => ic._id.equals(q.individualClass));
  const user = users.find(u => u._id.equals(q.user));
  const answers: Answer[] = q.answers.map((answer: any) => ({
    answerAdmin: users.find(u => u._id.equals(answer.answerAdmin)) || null,
    answeredAt: answer.answeredAt,
    answer: answer.answer,
  }));

  return {
    id: q.id,
    question: q.question,
    answers,
    user: user || null,
    answerAdmin: null, // Puedes asociarlo si hay un campo específico en el modelo original
    class: {
      _id: individualClass?._id.toString() || '',
      id: individualClass?.id || 0,
      name: individualClass?.name || '',
      createdAt: individualClass?.createdAt.toISOString() || '',
      class_code: individualClass?.class_code || '',
      image_url: individualClass?.image_url || '',
      likes: individualClass?.likes || 0,
      totalTime: individualClass?.totalTime || 0,
      course: individualClass?.course || null,
      atachedFiles: individualClass?.atachedFiles || [],
      links: individualClass?.links || [],
    },
    createdAt: q.createdAt.toISOString(),
    hasAnswer: q.answers.length > 0,
  };
});

// return formattedQuestions;
const questionsF = JSON.parse(JSON.stringify(formattedQuestions));
return questionsF;

    // const res = await Question.where('individualClass')
    //   .equals(classUId)
    //   .populate({ path: 'individualClass' })
    //   // .populate({ path: 'user' })
    //   // .populate({ path: 'answers.answerAdmin' })
    //   .exec();

    // const questionsF = JSON.parse(JSON.stringify(questionsWithDetails));
    // return questionsF;
  } catch (err) {
    }
}