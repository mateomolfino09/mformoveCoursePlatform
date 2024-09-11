import connectDB from '../../../../config/connectDB';
import { sendEmail } from '../../../../helpers/sendEmail';
import Bill from '../../../../models/billModel';
import Course from '../../../../models/courseModel';
import User from '../../../../models/userModel';
import absoluteUrl from 'next-absolute-url';
import { getCurrentURL } from '../../assets/getCurrentURL';

const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_PUBLIC_API_KEY // ojo con no poner una process.env.NEXT_PUBLIC_...
});

connectDB();

const bookFeedbackSuccess = async (req, res) => {
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

    const index = user.courses.findIndex((element) => {
      return element.course.valueOf() === course._id.valueOf();
    });

    console.log(index);

    user.courses[index].purchased = true;

    const noti = {
      title: 'Curso adquirido con éxito',
      message: '¡Ya puedes ver el curso!',
      link: `/courses/${course.id}/1`,
      status: 'green'
    };
    user.notifications.push(noti);

    adminUsers.forEach(async (admin) => {
      admin.notifications.push({
        title: 'Pago Concreteado',
        message: `Pago concretado por ${user.name} de importe ${course.price}`,
        status: 'green'
      });
      await admin.save();
    });

    await user.save();

    const bill = await Bill.findOne({ payment_id });

    if (bill)
      res
        .status(409)
        .redirect(
          `/courses/purchase/duplicated/${courseId}`
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

      let origin = getCurrentURL();
      const link = `${origin}/home`;
      const title = `<h1 style="color:black">¡Compra Realizada con éxito!</h1>`;
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
        content: `Has adquirido el Curso "${course.name}" con número de órden ${merchant_order_id} e Id de Pago ${payment_id}`,
        message: message,
        to: [{
          email: user.email,
          name: user.name
        }], 
        subject: `Órden nro ${merchant_order_id}`
      });

      res
        .status(200)
        .redirect(
          `/courses/purchase/success/${courseId}`
        );
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: 'Algo salio mal' });
  }
};

export default bookFeedbackSuccess;
