import connectDB from "../../../config/connectDB"
import User from "../../../models/userModel"
import jwt from "jsonwebtoken"
import absoluteUrl from "next-absolute-url"
import { sendEmail } from "../../../helpers/sendEmail"

 connectDB()



const changeEmail = async (req, res) => {

  try {
    if (req.method === "POST") {
      const { email, newEmail } = req.body

      const user = await User.findOne({ email })

      if (!user) {
        res.status(404).json({ error: "email not found" })
      }

      const token = jwt.sign({ _id: user._id }, process.env.NEXTAUTH_SECRET, {
        expiresIn: "30d",
      })

      user.resetToken = token
      await user.save()

      const { origin } = absoluteUrl(req)
      const link = `${origin}/src/user/resetEmail/${token}`

      const message = `<div>Haz click en el link para resetear tu email, si el link no funciona pegalo en el buscador!.</div></br>
    <div>link:${link}</div>`

      await sendEmail({
        to: 'mateomolfino09@gmail.com',
        name: user.name,
        // to: newEmail,
        subject: "Resetear Email",
        message: message

      })

      return res.status(200).json({
        message: `Email enviado a ${user.email}, porfavor checkea tu email`,
      })
    }
  } catch (error) {
    console.log(error)
  }
}

export default changeEmail