import connectDB from "../../../config/connectDB"
import User from "../../../models/userModel"
import jwt from "jsonwebtoken"
import absoluteUrl from "next-absolute-url"
import { sendEmail } from "../../../helpers/sendEmail"
import validateCaptcha from './validateCaptcha'

 connectDB()



const forget = async (req, res) => {

  try {
    if (req.method === "POST") {
      const { email, captcha } = req.body

      const user = await User.findOne({ email })

      if (!user) {
        return res.status(404).json({ error: "No hemos encontrado ningún usuario con ese email" })
      }

      const validCaptcha = await validateCaptcha(captcha)
        
      if (!validCaptcha) {
        return res.status(422).json({
          error: "Captcha Invalido",
        });
      }

      const token = jwt.sign({ _id: user._id }, process.env.NEXTAUTH_SECRET, {
        expiresIn: "30d",
      })

      user.resetToken = token
      await user.save()

      const { origin } = absoluteUrl(req)
      const link = `${origin}/src/user/reset/${token}`

      const message = `<div>Haz click en el link para resetear tu contraseña, si el link no funciona pegalo en el buscador!.</div></br>
    <div>link:${link}</div>`

      let resp = await sendEmail({
        name: user.name,
        to: user.email,
        subject: "Resetear Contraseña",
        message: message
      })

      console.log(resp)

      return res.status(200).json({
        message:  `Se ha enviado un mail a ${user.email}, revisa tu correo porfavor.`,
      })

    }
  } catch (error) {
    return res.status(500).json({
      message:  `Hubo un error al enviar un mail a tu cuenta`,
    })
  }
}

export default forget