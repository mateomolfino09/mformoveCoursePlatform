import bcrypt from 'bcryptjs'
import Courses from '../../../models/courseModel'
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
          const { name, playlistId, imgUrl, password, userEmail } = req.body

        //Existe?
            const user = await Users.findOne({ email: userEmail })

            const exists = await bcrypt.compare(password, user.password)

            if (!exists) {
                return res.status(404).json({ error: "Credenciales incorrectas" })
            }

        //Es Admin?

            if (user.rol !== 'Admin') {
                return res.status(422).json({ error: "Este usuario no tiene permisos para crear un curso" })
            }

            const lastCourse = await Courses.find().sort({_id: -1}).limit(1);
            console.log(JSON.stringify(lastCourse))
                
            const newCourse = await new Courses({
            id: JSON.stringify(lastCourse) != '[]' ? lastCourse[0].id + 1 : 1,
            name: name,
            playlist_code: playlistId,
            image_url: imgUrl       
            }).save()
            res.status(200).json({ message: 'Curso creado correctamente'})
            
        }
      } catch (error) {
        throw new Error(error)

      }
}
