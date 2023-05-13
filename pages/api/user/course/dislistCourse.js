import connectDB from '../../../../config/connectDB';
import Courses from '../../../../models/courseModel';
import Users from '../../../../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';

connectDB();

const dislistCourse = async (req, res) => {
  const { courseId, userId } = req.body;
  try {
    if (req.method === 'PUT') {
      const dbUser = await Users.findOne({ _id: userId.valueOf() });
      const course = await Courses.findOne({ id: courseId });

      const index = dbUser.courses.findIndex((element) => {
        return element.course.valueOf() === course._id.valueOf();
      });

      dbUser.courses[index].inList = false;

      await dbUser.save();

      return res.status(200).send(dbUser);
    } else {
      return res.status(401).json({ error: 'Algo salio mal' });
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: 'Algo salio mal' });
  }
};

export default dislistCourse;
