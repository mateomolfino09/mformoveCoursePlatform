import bcrypt from 'bcryptjs'
import Users from '../../../models/userModel'
import mongoose from 'mongoose'
import connectDB from '../../../config/connectDB'
import jwt from "jsonwebtoken"
import absoluteUrl from "next-absolute-url"
import { sendEmail } from "../../../helpers/sendEmail"

connectDB()

export default async(req,res) => {
    try {
        if (req.method === "POST") {
          const { email, password, firstname, lastname } = req.body
    
          const user = await Users.findOne({ email: email })
    
          if (user) {
            return res.status(422).json({ error: "Este usuario ya fue registrado" })
          }
    
          const HashedPassword = await bcrypt.hash(password, 12)
          const newUser = await new Users({
            email: email,
            password: HashedPassword,
            name: `${firstname} ${lastname}`
          }).save()
          res.status(200).json({ message: 'Usuario registrado correctamente'})
    
          const token = jwt.sign({ _id: newUser._id }, process.env.NEXTAUTH_SECRET, {
            expiresIn: "30d",
          })
    
        //   console.log(token)
    
          newUser.emailToken = token
          await newUser.save()
    
          const { origin } = absoluteUrl(req)
          const link = `${origin}/src/user/email/${token}`
    
          const message = `<div>Haga Click en el link para verificar su cuenta, si el link no funciona pegalo en el buscador!</div></br>
        <div>link:${link}</div>`
    
          await sendEmail({
            to: newUser.email,
            subject: "Confirmar Mail",
            text: message,
          })
    
          return res.status(200).json({
            message: `Email enviado a ${newUser.email}, porfavor chequea tu correo.`,
          })
        }
      } catch (error) {
        throw new Error(error)
      }
}
