import connectDB from '../../../config/connectDB';
import User from '../../../models/userModel';

connectDB();

const getUserById = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const id = req.query.getUserById;
      const user = await User.findOne({ _id: id });
      return res.status(200).send(user);
    }
  } catch (err) {
    console.log(err);
  }
};

export default getUserById;
