import bcrypt from 'bcryptjs'
import Users from '../../../models/userModel'
import Courses from '../../../models/courseModel'
import mongoose from 'mongoose'
import connectDB from '../../../config/connectDB'
import jwt from "jsonwebtoken"
import absoluteUrl from "next-absolute-url"
import { sendEmail } from "../../../helpers/sendEmail"

connectDB()

const resendTokenValidate = async(req,res) => {
    try {
        if (req.method === "POST") {
          const { email } = req.body
    
          const user = await Users.findOne({ email: email })
          
          if (!user) {
            return res.status(404).json({ error: "No se encontró este usuario" })
          }
          if (!user.validEmail === 'not') {
            return res.status(422).json({ error: "Este usuario ya fue verificado" })
          }
    
          const token = jwt.sign({ _id: user._id }, process.env.NEXTAUTH_SECRET, {
            expiresIn: "30d",
          })
        
          user.emailToken = token

          await user.save()
    
          const { origin } = absoluteUrl(req)
          const link = `${origin}/src/user/email/${token}`
    
          const message = `<div>Haga Click en el link para verificar su cuenta, si el link no funciona pegalo en el buscador!</div></br>
        <div>link:${link}</div>`
    
          await sendEmail({
            to: user.email,
            subject: "Confirmar Mail",
            text: message,
          })

          return res.status(200).json({ message: `Email enviado a ${user.email}, porfavor chequea tu correo.`})

        }
      } catch (error) {
        console.log(error.message)
      }
}

export default resendTokenValidate
