import connectDB from '../../../../config/connectDB';
import User from '../../../../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';

connectDB();

const token = async (req, res) => {
  try {
    if (req.method === 'PUT') {
      const { token } = req.query;

      const { password, conPassword } = req.body;

      if (password !== conPassword) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
      }
      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: 'La contraseña debe tener almenos 6 caracteres' });
      }

      if (token) {
        const decoded = await jwt.verify(token, process.env.NEXTAUTH_SECRET);
        req.user = decoded;
      }

      const user = await User.findById(req.user._id);

      if (user) {
        user.password = await bcrypt.hash(password, 12);

        user.resetToken = undefined;
        user.notifications.push({
          title: 'Password reseteada',
          message: `Has cambiado tu contraseña con éxito.`,
          status: 'green'
        });
        await user.save();

        return res
          .status(200)
          .json({ message: 'Se ha actualizado tu contraseña con éxito!' });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export default token;
