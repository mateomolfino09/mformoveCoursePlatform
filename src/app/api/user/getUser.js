import connectDB from '../../../config/connectDB';
import User from '../../../models/userModel';

connectDB();

export async function getUser(id) {
  try {
    const res = await User.findOne({ id: id });

    const user = JSON.parse(JSON.stringify(res));
    return user;
  } catch (err) {
    console.log(err);
  }
}
