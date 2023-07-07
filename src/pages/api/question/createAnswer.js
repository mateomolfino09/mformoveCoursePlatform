import connectDB from '../../../config/connectDB';
import Question from '../../../models/questionModel';
import Users from '../../../models/userModel';

connectDB();

const createAnswer = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { answer, questionId, userId } = req.body;

      //Existe?
      let question = await Question.findOne({ id: questionId }).populate('user');
      let user = await Users.findOne({ id: userId });
      let creator = question.user._id;
      let creatorUser = await Users.findOne({ creator })
      const adminUsers = await Users.find({ rol: 'Admin' });

      const answerObj = {
        answer: answer,
        answerAdmin: user,
        answeredAt: Date.now()
      };
      question.answers.push(answerObj);

      question.hasAnswer = true;

      const noti = {
        title: 'Respuesta creada con éxito',
        message: `Has respondido a la pregunta ${questionId}`,
        link: `/src/courses/questions/${questionId}`,
        status: 'green'
      };
      user.notifications.push(noti);

      const creatorNoti = {
        title: `Tienes una nueva respuesta de ${user.name}`,
        message: `Respondele lo antes posible`,
        link: `/src/courses/questions/${questionId}`,
        status: 'yellow'
      }

      creatorUser.notifications.push(creatorNoti)

      adminUsers.forEach(async (admin) => {
        admin.notifications.push(creatorNoti);
        await admin.save();
      });


      await user.save()

      await question.save();

      res.status(200).json({
        message: 'Pregunta enviada correctamente',
        question: question
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

export default createAnswer;
