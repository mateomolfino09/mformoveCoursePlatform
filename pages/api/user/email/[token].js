import connectDB from "../../../../config/connectDB"
import User from "../../../../models/userModel"
import Courses from '../../../../models/courseModel'
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import absoluteUrl from "next-absolute-url"

connectDB()
const token = async (req, res) => {
  try {
    if (req.method === "PUT") {
      const { token } = req.query
      const courses = await Courses.find({ })

      if (token) {
        const decoded = await jwt.verify(token, process.env.NEXTAUTH_SECRET)
        req.user = decoded
      }
      if (!token) {
        return res.status(200).json({ message: "no Token" })
      }

      const user = await User.findById(req.user._id)

      if (user) {
        user.validEmail = "yes"
        user.emailToken = undefined
        user.courses = [];

        courses.forEach(course => {
          user.courses.push({
            course,
            like: false,
            purchased: user.rol === 'Admin' ? true : false
          })
        });

        await user.save()

        return res.status(200).json({ message: "Cuenta verificada con éxito" })
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export default token