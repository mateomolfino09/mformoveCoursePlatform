import connectDB from '../../../config/connectDB'
import Course from '../../../models/courseModel'
import User from '../../../models/userModel'
import { CourseUser, CoursesDB, User as UserType } from '../../../typings'
import { ConnectionPoolClosedEvent } from 'mongodb'

export async function updateActualCourseSS(
  email: string,
  courseId: string,
  actualChapter: number
) {
  // connectDB()
  try {
    const user: any | null = await User.findOne({ email: email }).exec()
    const courseDB: CoursesDB | null = await Course.findOne({
      id: courseId
    }).exec()

    const index = user?.courses.findIndex(
      (course: CourseUser) =>
        course.course.valueOf() === courseDB?._id.valueOf()
    )

    index != null && user != null
      ? (user.courses[index].actualChapter = actualChapter)
      : null

    user.courses[index].actualTime = 0

    await user?.save()

    return JSON.parse(JSON.stringify(user))
  } catch (err) {
    console.log(err)
  }
}
