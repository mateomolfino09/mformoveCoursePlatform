import bcrypt from 'bcryptjs'
import Courses from '../../../models/courseModel'
import Classes from '../../../models/classModel'

import Users from '../../../models/userModel'
import mongoose from 'mongoose'
import connectDB from '../../../config/connectDB'
import jwt from "jsonwebtoken"
import absoluteUrl from "next-absolute-url"
import { sendEmail } from "../../../helpers/sendEmail"

connectDB()



const updateCourses =  async (req, res) => {
    try {
      if (req.method === "PUT") {
        const courses = await Courses.find({  })

        for (let index = 0; index < courses.length; index++) {
          const course = courses[index];
          const youtubeURL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${course.playlist_code}&maxResults=50&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`

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
            course: course   
            }).save()

            course.classes.push(newClass)
            await course.save()

          }
        }
        return res.status(200).send({ message: 'hola'})
      } else {
        return res.status(401).json({ error: "Algo salio mal" })
      }
    } catch (err) {
      console.log(err)
      return res.status(401).json({ error: "Algo salio mal" })  }
  }

// export default async(req,res) => {
//     try {
//         if (req.method === "POST") {
//             const courses = await Courses.find({})
//             console.log(courses)

//         //Existe?


//             res.status(200).json({ message: 'Curso editado correctamente'})
            
//         }
//       } catch (error) {
//         console.log(error)

//       }
// }

export default updateCourses