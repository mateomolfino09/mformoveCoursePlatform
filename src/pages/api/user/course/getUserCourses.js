import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Course from '../../../../models/courseModel';
import User from '../../../../models/userModel';

connectDB();

export async function getUserCourses(req) {
  try {
    const { userToken } = req.cookies;
    const data =  verify(userToken, process.env.NEXTAUTH_SECRET)
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
    console.log(err);
  }
}
