import connectDB from "../../../../config/connectDB"
import User from "../../../../models/userModel"
import Course from "../../../../models/courseModel"
import axios from 'axios'
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { redirect } from 'next/navigation';
const mercadopago = require('mercadopago');

mercadopago.configure({
	access_token: process.env.MERCADO_PAGO_PUBLIC_API_KEY // ojo con no poner una process.env.NEXT_PUBLIC_... 
});

connectDB()

const bookFeedbackSuccess = async (req, res) => {
  const { email, courseId } = req.query
  try {
    const user = await User.findOne({ email })
    const course = await Course.findOne({ id: courseId })


    const index = user.courses.findIndex((element) => {
      return element.course.valueOf() === course._id.valueOf()
    })
  
    user.courses[index].purchased = true

    console.log(user.courses[index].purchased, index, user.email)

    await user.save()


    res.redirect('/src/courses/purchase/success')

  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: "Algo salio mal" })  }
}

export default bookFeedbackSuccess