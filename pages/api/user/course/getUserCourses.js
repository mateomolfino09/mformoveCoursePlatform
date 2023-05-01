import connectDB from "../../../../config/connectDB" 
import bcrypt from "bcryptjs"
import Course from "../../../../models/courseModel"
import User from "../../../../models/userModel"
import Class from "../../../../models/classModel"

 connectDB()

 export async function getUserCourses(userId) {
    try {
        const user = await User.findOne({ _id: userId })
        const coursesId = []
        user.courses.forEach(course => {
          if(course.purchased)coursesId.push(course.course)
        });
        const courses = await Course.find({ '_id': { $in: coursesId}}).populate({path: 'classes'}).lean().exec()

        return JSON.parse(JSON.stringify(courses));
      } catch (err) {
       console.log(err)
      }
  }

