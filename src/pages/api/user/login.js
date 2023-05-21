import connectDB from '../../../config/connectDB';
import Users from '../../../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

connectDB();

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (req.method === 'POST') {
      if (!email || !password) {
        return res.status(422).json({ error: 'Rellene ambos campos porfavor' });
      }

      const user = await Users.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ message: 'La combinación usuario contraseña es incorrecta' });
      }

      if (user.validEmail === 'not') {
        return res.status(404).json({
          message: 'Debe confirmar su cuenta antes de ingresar al sitio',
          validate: true
        });
      }

      const exists = await bcrypt.compare(password, user.password);

      if (exists) {
        const token = jwt.sign(
          { userId: user._id },
          process.env.NEXTAUTH_SECRET,
          {
            expiresIn: '30d'
          }
        );

        user.token = `${token}`
        await user.save()

        res.status(201).json({
          login: true,
          token
        });
      }

      if (!exists) {
        return res
          .status(401)
          .json({ message: 'La combinación usuario contraseña es incorrecta' });
      }
    } else {
      return res
        .status(401)
        .json({ error: 'La combinación usuario contraseña es incorrecta' });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Error inesperado. Vuelva a intentar.' });
  }
};

export default login;
