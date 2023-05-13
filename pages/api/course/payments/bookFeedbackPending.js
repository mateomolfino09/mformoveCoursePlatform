import connectDB from '../../../../config/connectDB';
import { sendEmail } from '../../../../helpers/sendEmail';
import Bill from '../../../../models/billModel';
import Course from '../../../../models/courseModel';
import User from '../../../../models/userModel';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';

const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_PUBLIC_API_KEY // ojo con no poner una process.env.NEXT_PUBLIC_...
});

connectDB();

const bookFeedbackPending = async (req, res) => {
  const {
    email,
    courseId,
    payment_id,
    merchant_order_id,
    preference_id,
    collection_id,
    payment_type,
    processing_mode,
    createdAt,
    status
  } = req.query;
  try {
    console.log(req.query);
    const user = await User.findOne({ email });
    const course = await Course.findOne({ id: courseId });
    const adminUsers = await User.find({ rol: 'Admin' });

    const bill = await Bill.findOne({ payment_id });

    const noti = {
      title: 'Pago pendiente',
      message:
        'Debes esperar hasta que termine el pago para comenzar a disfrutar del curso',
      link: `src/courses/purchase/${course.id}`,
      status: 'yellow'
    };
    user.notifications.push(noti);
    adminUsers.forEach(async (admin) => {
      admin.notifications.push({
        title: 'Pago Pendiente',
        message: `Pago pendiente de ${user.name}`,
        status: 'yellow'
      });
      await admin.save();
    });
    await user.save();

    if (bill)
      res
        .status(409)
        .redirect(
          `/src/courses/purchase/duplicated/?courseId=${courseId}&email=${email}`
        );
    else {
      const newBill = await new Bill({
        user,
        course,
        payment_id,
        merchant_order_id,
        preference_id,
        collection_id,
        payment_type,
        processing_mode,
        createdAt,
        status,
        amount: course.price,
        currency: course.currency
      }).save();

      const { origin } = absoluteUrl(req);
      const link = `${origin}/src/home`;
      const title = `<h1 style="color:black">Pago pendiente.</h1>`;
      const message = `
      <div>     
      <div>
      <button style="background-color:black; border:none;border-radius: 4px;width:100%; padding:14px 0px; margin-bottom:15px">
       <a style="color:white; text-decoration: none; font-weight:700; font-size:14px" href="${link}">Volver al sitio </a>
      </button>
      </div>
      <p style="font-size:14px;font-weight:700;color:#221f1f;margin-bottom:24px">El equipo de Video Stream.</p>
      <hr style="height:2px;background-color:#221f1f;border:none">       
     </div>`;

      let resp = sendEmail({
        title: `${title}`,
        name: `Hola, ${user.name}:`,
        content: `El pago del curso "${course.name}" está pendiente.`,
        message: message,
        to: `Lavis te envió este mensaje a [${user.email}] como parte de tu membresía.`,
        subject: `Órden nro ${merchant_order_id}`
      });

      res
        .status(401)
        .redirect(
          `/src/courses/purchase/pending/?courseId=${courseId}&email=${email}`
        );
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: 'Algo salio mal' });
  }
};

export default bookFeedbackPending;
