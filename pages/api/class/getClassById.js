import connectDB from "../../../config/connectDB" 
import Course from "../../../models/courseModel"
import User from "../../../models/userModel"
import Class from "../../../models/classModel"
import bcrypt from "bcryptjs"

connectDB()

export async function getClassById(id, courseId) {
  try {
    const res = await Class.where('id').equals(id).populate({ path: 'course', match: {id: courseId}}).exec()
    const clase = JSON.parse(JSON.stringify(res[0]))
    return clase
    } catch (err) {
     console.log(err)
    }
}