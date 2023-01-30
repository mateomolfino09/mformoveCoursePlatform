

import connectDB from "../../../config/connectDB"
import User from "../../../models/userModel"
import Courses from "../../../models/courseModel"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

 connectDB()

const update = async (req, res) => {
  const { email, update } = req.body

  //   console.log(req.body)

  try {
    if (req.method === "PUT") {
      const user = await User.findOne({ })
      const courses = await Courses.find({ })

      courses.forEach(course => {
        newUser.courses.course = course
      });

      user.update = update

      const updatedUser = await user.save()

      return res.status(200).json({ message: updatedUser })
    } else {
      return res.status(401).json({ error: "Invalid credentials" })
    }
  } catch (err) {
    console.log(err)
  }
}

export default update