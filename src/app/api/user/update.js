import connectDB from '../../../config/connectDB';
import User from '../../../models/userModel';

connectDB();

const update = async (req, res) => {
  const { email, update } = req.body;

  if (req.method === 'PUT') {
    const user = await User.findOne({});
    const adminUsers = await User.find({ rol: 'Admin' });

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
};

export default update;
