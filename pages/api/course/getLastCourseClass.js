import connectDB from '../../../config/connectDB'
import Class from '../../../models/classModel'
import Course from '../../../models/courseModel'
import User from '../../../models/userModel'
import bcrypt from 'bcryptjs'

connectDB()

export async function getLastCourseClass(id) {
  try {
    const res = await Course.findOne({ id })
    return res.classes.length
  } catch (err) {
    console.log(err)
  }
}
