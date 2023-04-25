import connectDB from "../../../../config/connectDB"
import User from "../../../../models/userModel"
import Course from "../..//../../models/courseModel"
import Class from "../../../../models/classModel"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import absoluteUrl from "next-absolute-url"

connectDB()
const token = async (req, res) => {
  try {
    if (req.method === "PUT") {
      const { token } = req.query
      const courses = await Course.find({ }).populate('classes')     

      if (token) {
        const decoded = await jwt.verify(token, process.env.NEXTAUTH_SECRET)
        req.user = decoded
      }
      if (!token) {
        return res.status(200).json({ message: "no Token" })
      }

      const user = await User.findById(req.user._id)

      if (user && user.validEmail != "yes" ) {
        user.validEmail = "yes"
        user.emailToken = undefined
        user.courses = [];
        let userClass = [];

        user.notifications.push({
          title: 'Usuario creado',
          message: `¡Te damos la bienvenida a Lavis Academy ${user.name}!`,
          status: 'green'
        })

        const adminUsers = await User.find({
          rol: 'Admin'
        })
        adminUsers.forEach(async (user) => {
          user.notifications.push({
            title: 'Usuario creado',
            message: `¡Le damos la bienvenida a ${user.name} a Lavis Academy!`,
            status: 'green'
          })
          await user.save()

        })


        courses.forEach(course => {

          course.classes.forEach(clase => {
            userClass.push({
              class: clase,
              id: clase.id,
              actualTime: 0,
              like: false
            })
          });

          user.courses.push({
            course,
            like: false,
            purchased: user.rol === 'Admin' ? true : false,
            classes: userClass
          })
        });

        await user.save()

        return res.status(200).json({ message: "Cuenta verificada con éxito" })
      }
      else if(user && user.validEmail == "yes") {
        return res.status(401).json({ error: "Esta cuenta ya fue verificada" })
      }
      else res.status(500).json({ error: "Hubo un error al verificar su cuenta" })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ })
  }
}

export default token