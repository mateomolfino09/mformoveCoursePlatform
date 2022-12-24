import bcrypt from 'bcryptjs'
import Users from '../../../models/userModel'
import mongoose from 'mongoose'
import connectDB from '../../../config/connectDB'

connectDB()

export default async(req,res) => {
    try {
        if (req.method === "POST") {
          console.log(req.body)
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
    
        //   const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
        //     expiresIn: "30d",
        //   })
    
        //   console.log(token)
    
        //   newUser.emailToken = token
        //   await newUser.save()
    
        //   const { origin } = absoluteUrl(req)
        //   const link = `${origin}/src/user/email/${token}`
    
        //   const message = `<div>Click on the link below to verify your email, if the link is not working then please paste into the browser.</div></br>
        // <div>link:${link}</div>`
    
          // console.log("message", message)
    
          // console.log("here")
    
        //   await sendEmail({
        //     to: newUser.email,
        //     subject: "Password Reset",
        //     text: message,
        //   })
    
        //   return res.status(200).json({
        //     message: `Email sent to ${newUser.email}, please check your email`,
        //   })
        }
      } catch (error) {
        throw new Error(error)
      }
}
