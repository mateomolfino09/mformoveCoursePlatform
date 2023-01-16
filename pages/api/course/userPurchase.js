

import connectDB from "../../../config/connectDB"
import User from "../../../models/userModel"
import Course from "../../../models/courseModel"

import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

connectDB()

export default async (req, res) => {
  const { email, courseName } = req.body

  //   console.log(req.body)

  try {
    if (req.method === "PUT") {
      const user = await User.findOne({ email })
      const course = await Course.findOne({ courseName })

      course.users.push(user)

      await course.save()

      return res.status(200).json({ message: `Felicitaciones! Has comprado ${courseName}` })
    } else {
      return res.status(401).json({ error: "Algo salio mal" })
    }
  } catch (err) {
    return res.status(401).json({ error: "Algo salio mal" })  }
}