import connectDB from '../../../config/connectDB'
import Classes from '../../../models/classModel'
import Courses from '../../../models/courseModel'
import Users from '../../../models/userModel'
import Question from '../../../models/questionModel'
import bcrypt from 'bcryptjs'

connectDB()

const createQuestion = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const {
        question,
        userEmail
      } = req.body

      //Existe?
      let user = await Users.findOne({ email: userEmail })

      const exists = await bcrypt.compare(password, user.password)

      if (!exists) {
        return res.status(404).json({ error: 'Credenciales incorrectas' })
      }
      const lastQuestion = await Question.find().sort({ _id: -1 }).limit(1)

      const newQuestion = await new Question({
        id: JSON.stringify(lastQuestion) != '[]' ? lastQuestion[0].id + 1 : 1,
        question: question,
        user: user
      }).save()


      res.status(200).json({ message: 'Pregunta enviada correctamente', question: newQuestion })
    }
  } catch (error) {
    console.log(error.message)
  }
}

export default createQuestion
