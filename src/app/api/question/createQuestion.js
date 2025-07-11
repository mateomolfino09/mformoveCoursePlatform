import connectDB from '../../../config/connectDB';
import Classes from '../../../models/classModel';
import Question from '../../../models/questionModel';
import Users from '../../../models/userModel';

connectDB();

const createQuestion = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { question, userEmail, classId } = req.body;

      //Existe?
      let user = await Users.findOne({ email: userEmail });
      const adminUsers = await Users.find({ rol: 'Admin' });
      let clase = await Classes.findOne({ _id: classId }).populate({
        path: 'course'
      });

      const lastQuestion = await Question.find().sort({ _id: -1 }).limit(1);

      const newQuestion = await new Question({
        id: JSON.stringify(lastQuestion) != '[]' ? lastQuestion[0].id + 1 : 1,
        question: question,
        user: user,
        class: clase
      }).save();

      adminUsers.forEach(async (admin) => {
        admin.notifications.push({
          title: `Te han preguntado en el curso ${clase.course.name}`,
          message: `Respondele a ${user.name} cuando puedas.`,
          link: `/courses/questions/${newQuestion.id}`,
          status: 'green'
        });
        await admin.save();
      });
      const noti = {
        title: 'Pregunta creada con éxito',
        message: `Se ha creado tu pregunta nro ${newQuestion.id}`,
        link: `/courses/questions/${newQuestion.id}`,
        status: 'green'
      };
      user.notifications.push(noti);
      await user.save()

      res.status(200).json({
        message: 'Pregunta enviada correctamente',
        question: newQuestion
      });
    }
  } catch (error) {
    }
};

export default createQuestion;
