import connectDB from '../../../../config/connectDB';
import Courses from '../../../../models/courseModel';
import User from '../../../../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';

connectDB();
const token = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { email } = req.body;
      const user = await User.find({ email }).lean().exec();

      console.log(user);

      if (user.length != 0)
        return res
          .status(409)
          .json({ message: 'Ya hay un usuario registrado con este email.' });

      return res.status(200).json({ message: 'Avanza' });
    }
  } catch (error) {
    console.log(error);
  }
};

export default token;
