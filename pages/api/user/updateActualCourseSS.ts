import connectDB from "../../../config/connectDB" 
import User from "../../../models/userModel"
import Course from "../../../models/courseModel"

import { ConnectionPoolClosedEvent } from "mongodb"
import { CoursesDB, CourseUser, User as UserType } from "../../../typings"


export async function updateActualCourseSS(email: string, courseId: string, actualChapter: number) {
  try {
    connectDB()
    const user: any | null = await User.findOne({ email: email }).exec()
    const courseDB: CoursesDB | null = await Course.findOne({ id: courseId}).exec()

    const index = user?.courses.findIndex((course: CourseUser) => course.course.valueOf() === courseDB?._id.valueOf())

    index != null && user != null ? user.courses[index].actualChapter = actualChapter : null

    user.courses[index].actualTime = 0;

    await user?.save()

    return JSON.parse(JSON.stringify(user));

    } catch (err) {
     console.log(err)
    }
}