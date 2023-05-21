import Course from '../../../models/courseModel';
import User from '../../../models/userModel';
import { CourseUser, CoursesDB, User as UserType } from '../../../../typings';
import { verify } from 'jsonwebtoken';

export async function updateActualCourseSS(
  req: any,
  courseId: string,
  actualChapter: number
) {
  // connectDB()
  try {
    const { userToken } = req.cookies;

    const data: any =  verify(userToken, process.env.NEXTAUTH_SECRET as string)

    const user = await User.findOne({ _id: data.userId });
    const courseDB: CoursesDB | null = await Course.findOne({
      id: courseId
    }).exec();

    const index = user?.courses.findIndex(
      (course: CourseUser) =>
        course.course.valueOf() === courseDB?._id.valueOf()
    );

    index != null && user != null
      ? (user.courses[index].actualChapter = actualChapter)
      : null;

    user.courses[index].actualTime = 0;

    await user?.save();

    return JSON.parse(JSON.stringify(user));
  } catch (err) {
    console.log(err);
  }
}
