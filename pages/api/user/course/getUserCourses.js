import connectDB from "../../../../config/connectDB" 
import bcrypt from "bcryptjs"
import Course from "../../../../models/courseModel"
import Class from "../../../../models/classModel"

 connectDB()

 export async function getUserCourses(userId) {
    try {
        const courses = await Course.find({ user: userId }).populate({path: 'classes'}).lean().exec()
        console.log(courses)
        return JSON.parse(JSON.stringify(courses));
      } catch (err) {
       console.log(err)
      }
  }

