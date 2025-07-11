import connectDB from '../../../config/connectDB';
import Course from '../../../models/courseModel';

connectDB();

export async function getLastCourseClass(id) {
  try {
    const res = await Course.findOne({ id });
    return res.classes.length;
  } catch (err) {
    }
}
