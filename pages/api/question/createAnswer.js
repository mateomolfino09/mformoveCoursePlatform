import connectDB from '../../../config/connectDB'
import Classes from '../../../models/classModel'
import Courses from '../../../models/courseModel'
import Users from '../../../models/userModel'
import Question from '../../../models/questionModel'
import bcrypt from 'bcryptjs'

connectDB()

const createAnswer = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const {
        answer,
        questionId,
        userId
      } = req.body

      //Existe?
      let question = await Question.findOne({ id: questionId })
      let admin = await Question.findOne({ id: userId })

      question.answer = answer
      question.answerAdmin = admin
      question.hasAnswer = true

      await question.save()

      res.status(200).json({ message: 'Pregunta enviada correctamente', question: newQuestion })
    }
  } catch (error) {
    console.log(error.message)
  }
}

export default createAnswer
