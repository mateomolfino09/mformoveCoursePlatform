import connectDB from "../../../config/connectDB" 
import Course from "../../../models/courseModel"
import User from "../../../models/userModel"
import Class from "../../../models/classModel"
import bcrypt from "bcryptjs"

connectDB()

const saveTime =  async (req, res) => {
    const { actualTime, email, courseId, classId} = req.body

    try {
      if (req.method === "POST" && actualTime != undefined) {
        const user = await User.findOne({email: email})
        const course = await Course.findOne({id: courseId})

        const coursecourse = course._id.valueOf()
        
        const index = user.courses.findIndex((course) => 
            course.course.valueOf() == coursecourse
        )
        user.courses[index].classes[classId - 1].actualTime = actualTime;
        await user.save()
        return res.status(200).send({ user })
      } else {
        return res.status(401).json({ error: "Algo salio mal" })
      }
    } catch (err) {
      console.log(err)
      return res.status(401).json({ error: "Algo salio mal" })  }
  }
  
  export default saveTime