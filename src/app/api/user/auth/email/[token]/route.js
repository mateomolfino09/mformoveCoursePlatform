import connectDB from '../../../../../../config/connectDB';
import User from '../../../../../../models/userModel';
import Course from '../../../../../../models/courseModel';
import Class from '../../../../../../models/classModel';
import IndividualClass from '../../../../../../models/individualClassModel';

import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

connectDB();
export async function PUT(req, { params }) {
  try {
    const { token } = params

    if (req.method === 'PUT') {
      const courses = await Course.find({}).populate('classes');

      if (token) {
        const decoded = await jwt.verify(token, process.env.NEXTAUTH_SECRET);
        req.user = decoded;
      }
      if (!token) {
        return NextResponse.json({ message: 'no Token'}, { status: 404 })
      }
      const user = await User.findById(req.user._id);

      if (user && user.validEmail != 'yes') {
        user.validEmail = 'yes';
        user.emailToken = undefined;
        user.courses = [];
        let userClass = [];

        user.notifications.push({
          title: 'Usuario creado',
          message: `¡Te damos la bienvenida a Lavis Academy ${user.name}!`,
          status: 'green'
        });

        user.admin = {
          active: false,
          coursesAvailable: 3
        };

        const adminUsers = await User.find({
          rol: 'Admin'
        });
        adminUsers.forEach(async (user) => {
          user.notifications.push({
            title: 'Usuario creado',
            message: `¡Le damos la bienvenida a ${user.name} a Lavis Academy!`,
            status: 'green'
          });
          await user.save();
        });

        courses.forEach((course) => {
          course.classes.forEach((clase) => {
            userClass.push({
              class: clase,
              id: clase.id,
              actualTime: 0,
              like: false
            });
          });

          user.courses.push({
            course,
            like: false,
            purchased: user.rol === 'Admin' ? true : false,
            classes: userClass
          });
        });

        await user.save();
        return NextResponse.json({ message: 'Cuenta verificada con éxito'}, { status: 200 })
      } else if (user && user.validEmail == 'yes') {
        return NextResponse.json({ error: 'Esta cuenta ya fue verificada'}, { status: 401 })
      } else
      return NextResponse.json({ error: 'Hubo un error al verificar su cuenta'}, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Hubo un error al verificar su cuenta'}, { status: 500 })
  }
};
