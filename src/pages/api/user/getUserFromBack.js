import { verify } from 'jsonwebtoken';
import connectDB from '../../../config/connectDB';
import User from '../../../models/userModel';

connectDB();

export async function getUserFromBack(req) {
  try {
    const {token} = req.cookies;
    let user = null
  
    if (token != null) {
      user =  verify(token, process.env.NEXTAUTH_SECRET)
      const userId = user.userId;
      user = await User.findOne({ _id: userId }).lean().exec();
    } 
    // 
    if (!user) return null;
    user.password = undefined;
    return JSON.parse(JSON.stringify(user));
  } catch (err) {
    console.log(err);
  }
}
