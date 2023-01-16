import connectDB from "../../../config/connectDB" 
import Course from "../../../models/courseModel"
import bcrypt from "bcryptjs"
import { ConnectionPoolClosedEvent } from "mongodb"

 connectDB()

export async function getCourses() {
  try {
    const res = await Course.find({})
    const courses = JSON.parse(JSON.stringify(res))
    return courses
    } catch (err) {
     console.log(err)
    }
}