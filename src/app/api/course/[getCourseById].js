import connectDB from '../../../config/connectDB';
import Course from '../../../models/courseModel';

connectDB();
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const id = req.query.getCourseById;
      const course = await Course.findOne({ _id: id });
      return res.status(200).send(course);
    }
  } catch (error) {
    return res.status(404).json({ error });
  }
}
