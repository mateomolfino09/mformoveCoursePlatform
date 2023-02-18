import connectDB from "../../../config/connectDB" 
import User from "../../../models/userModel"
import { ConnectionPoolClosedEvent } from "mongodb"
import { CourseUser, User as UserType } from "../../../typings"

 connectDB()

 const updateActualCourse = async (req: any, res: any) => {
    try {
        if (req.method === "POST") {
            const { email, courseId, actualChapter } = req.body
            const user: any | null = await User.findOne({ email: email })

            const index = user?.courses.findIndex((course: CourseUser) => course.course.valueOf() === courseId)

            index != null && user != null ? user.courses[index].actualChapter = actualChapter : null

            user.courses[index].actualTime = 0;

            await user?.save()

            console.log()
            return res.status(200).send(user)
        }
    } catch (err) {
     console.log(err)
    }
}

export default updateActualCourse
