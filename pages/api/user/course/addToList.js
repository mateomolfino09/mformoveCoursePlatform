import connectDB from '../../../../config/connectDB';
import Courses from '../../../../models/courseModel';
import Users from '../../../../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';

connectDB();

const addToList = async (req, res) => {
  const { courseId, dbUser } = req.body;
  try {
    if (req.method === 'POST') {
      const course = await Courses.findOne({ id: courseId });
      course.likes++;

      await course.save();

      const index = dbUser.courses.findIndex((element) => {
        return element.course === course._id.valueOf();
      });

      dbUser.courses[index].like = true;
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

export default addToList;
