import connectDB from "../../../config/connectDB" 
import Course from "../../../models/courseModel"
import User from "../../../models/userModel"
import Class from "../../../models/classModel"
import bcrypt from "bcryptjs"

connectDB()

export async function getLastCourseClass(id) {
  try {
    const res = await Course.findOne({ id })
    console.log(res.classes.length)
    return res.classes.length
    } catch (err) {
     console.log(err)
    }
}