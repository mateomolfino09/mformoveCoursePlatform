import bcrypt from 'bcryptjs'
import Courses from '../../../models/courseModel'
import Users from '../../../models/userModel'
import Classes from '../../../models/classModel'
import mongoose from 'mongoose'
import connectDB from '../../../config/connectDB'
import jwt from "jsonwebtoken"
import absoluteUrl from "next-absolute-url"
import { sendEmail } from "../../../helpers/sendEmail"

connectDB()

const createCourse = async(req,res) => {
    try {
        if (req.method === "POST") {
          const { name, playlistId, imgUrl, password, userEmail } = req.body

        //Existe?
            const user = await Users.findOne({ email: userEmail })
            const users = await Users.find({  })

            const exists = await bcrypt.compare(password, user.password)

            if (!exists) {
                return res.status(404).json({ error: "Credenciales incorrectas" })
            }

        //Es Admin?

            if (user.rol !== 'Admin') {
                return res.status(422).json({ error: "Este usuario no tiene permisos para crear un curso" })
            }

            //Busco ultimo curso

            const lastCourse = await Courses.find().sort({_id: -1}).limit(1);
                
            const newCourse = await new Courses({
            id: JSON.stringify(lastCourse) != '[]' ? lastCourse[0].id + 1 : 1,
            name: name,
            playlist_code: playlistId,
            image_url: imgUrl       
            }).save()

            //Traigo clases de YT

            const youtubeURL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${newCourse.playlist_code}&maxResults=50&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`

            const initial = await fetch(youtubeURL);
            const data = await initial.json()
            const items = data.items
  
            for (let index = 0; index < items.length; index++) {
              const item = items[index];
  
              const newClass = await new Classes({
              id: index + 1,
              name: item.snippet.title,
              class_code: item.snippet.resourceId.videoId,
              image_url: item.snippet.thumbnails.standard.url,
              course: newCourse   
              }).save()

              newCourse.classes.push(newClass)
              await newCourse.save()
  
            }

            //Agrego curso a Usuarios

            users.forEach(async (user) => {
              user.courses.push({
                course: newCourse,
                purchased: user.rol === 'Admin' ? true : false,
                like: false
              })
              //Optimizar
              await user.save()
            })


            res.status(200).json({ message: 'Curso creado correctamente'})
            
        }
      } catch (error) {
        console.log(error.message)

      }
}

export default createCourse
