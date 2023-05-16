import connectDB from '../../../config/connectDB';
import Courses from '../../../models/courseModel';
import User from '../../../models/userModel';

connectDB();

const update = async (req, res) => {
  const { email, update } = req.body;

  //   console.log(req.body)

  try {
    if (req.method === 'PUT') {
      const user = await User.findOne({});
      const adminUsers = await User.find({ rol: 'Admin' });
      const courses = await Courses.find({});

      courses.forEach((course) => {
        newUser.courses.course = course;
      });

      user.update = update;
      adminUsers.forEach(async (admin) => {
        admin.notifications.push({
          title: 'Usuario actualizado',
          message: `Has actualizado al usuario con exito`,
          status: 'green'
        });
        await admin.save();
      });

      const updatedUser = await user.save();

      return res.status(200).json({ message: updatedUser });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.log(err);
  }
};

export default update;
