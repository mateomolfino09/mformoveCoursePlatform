import connectDB from '../../../config/connectDB';
import Course from '../../../models/courseModel';

connectDB();

export async function getCourseById(id) {
  try {
    let course = await Course.findOne({ id: id })
      .populate('classes')
      .lean()
      .exec();
    course = JSON.parse(JSON.stringify(course));
    return course;
  } catch (err) {
    console.log(err);
  }
}
