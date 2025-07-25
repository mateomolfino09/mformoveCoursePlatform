import connectDB from '../../../config/connectDB';
import User from '../../../models/userModel';

connectDB();

const validateCourse = async (req, res) => {
  const { email, course } = req.body;

  try {
    if (req.method === 'PUT') {
      const user = await User.find().byCourse(course.id);
      if (user === null)
        return res.status(402).json({ message: 'curso no comprado' });
      else {
        const index = user.courses.indexOf(course);
        if (user.courses[index].purchased === true)
          res.status(200).json({ message: 'todo en orden' });
      }
    } else {
      return res.status(401).json({ error: 'Invalid' });
    }
  } catch (err) {
    }
};

export default validateCourse;
