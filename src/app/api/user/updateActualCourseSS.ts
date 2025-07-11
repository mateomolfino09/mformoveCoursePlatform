import Course from '../../../models/courseModel';
import User from '../../../models/userModel';
import { CourseUser, CoursesDB, User as UserType } from '../../../../typings';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function updateActualCourseSS(
  courseId: string,
  actualChapter: number
) {
  // connectDB()
  try {
    const userToken= cookies().get('userToken')?.value;

    const data: any =  verify(userToken as any, process.env.NEXTAUTH_SECRET as string)

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
    }
}
