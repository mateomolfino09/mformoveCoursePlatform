import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Course from '../../../../models/courseModel';
import User from '../../../../models/userModel';
import { cookies } from 'next/headers'
connectDB();

export async function getUserCourses() {
  try {
    const userToken= cookies().get('userToken');
    const data =  verify(userToken.value, process.env.NEXTAUTH_SECRET)
    const userId = data.userId
    const user = await User.findOne({ _id: userId });
    const coursesId = [];
    user.courses.forEach((course) => {
      if (course.purchased) coursesId.push(course.course);
    });
    const courses = await Course.find({ _id: { $in: coursesId } })
      .populate({ path: 'classes' })
      .lean()
      .exec();

    return JSON.parse(JSON.stringify(courses));
  } catch (err) {
    }
}
