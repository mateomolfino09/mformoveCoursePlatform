import connectDB from "../../../../config/connectDB"
import User from "../../../../models/userModel"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import absoluteUrl from "next-absolute-url"

connectDB()

const token = async (req, res) => {
  try {
    if (req.method === "PUT") {
      const { token } = req.query

      const { email, conEmail } = req.body

      if (email !== conEmail) {
        return res.status(400).json({ error: "Las contraseñas no coinciden" })
      }

      if (token) {
        const decoded = await jwt.verify(token, process.env.NEXTAUTH_SECRET)
        req.user = decoded
      }

      const user = await User.findById(req.user._id)

      if (user) {
        user.email = email

        user.resetToken = undefined
        user.notifications.push({
          title: 'Email reseteado',
          message: `Has cambiado tu email con éxito.`,
          status: 'green'
        })
        await user.save()

        return res.status(200).json({ message: "Se ha actualizado tu email con éxito!" })
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export default token