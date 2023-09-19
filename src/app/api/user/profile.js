import { cookies } from 'next/headers';
import connectDB from '../../../config/connectDB';
import User from '../../../models/userModel';
import { verify } from 'jsonwebtoken'

connectDB();

const profile = async (req, res) => {
  try {
    const userToken= cookies().get('userToken').value;

      const data =  verify(userToken, process.env.NEXTAUTH_SECRET)

      const user = await User.findOne({ _id: data.userId });

      user ? user.password = undefined : null;

      return res.status(200).send(user);
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
};

export default profile;
