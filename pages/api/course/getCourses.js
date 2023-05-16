import connectDB from '../../../config/connectDB';
import Course from '../../../models/courseModel';

connectDB();

export async function getCourses() {
  try {
    const res = await Course.find({}).populate('classes');
    const courses = JSON.parse(JSON.stringify(res));
    return courses;
  } catch (err) {
    console.log(err);
  }
}
