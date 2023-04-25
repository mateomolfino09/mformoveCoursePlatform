import connectDB from "../../../config/connectDB";
import Course from "../../../models/courseModel";
import User from "../../../models/userModel";
import Class from "../../../models/classModel";

connectDB();

export async function getCourseById(id) {
  try {
    let course = await Course.findOne({ id: id });
    course = JSON.parse(JSON.stringify(course));
    return course;
  } catch (err) {
    console.log(err);
  }
}
