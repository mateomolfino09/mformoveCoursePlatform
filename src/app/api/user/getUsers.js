import connectDB from '../../../config/connectDB';
import User from '../../../models/userModel';

connectDB();

export async function getUsers() {
  try {
    const res = await User.find({});
    const users = JSON.parse(JSON.stringify(res));
    return users;
  } catch (err) {
    }
}
