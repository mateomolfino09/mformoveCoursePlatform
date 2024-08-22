import connectDB from '../../../../config/connectDB';
import { sendEmail } from '../../../../helpers/sendEmail';
import Bill from '../../../../models/billModel';
import Course from '../../../../models/courseModel';
import User from '../../../../models/userModel';
import absoluteUrl from 'next-absolute-url';

const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_PUBLIC_API_KEY // ojo con no poner una process.env.NEXT_PUBLIC_...
});

connectDB();

const bookFeedbackFailure = async (req, res) => {
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
    const adminUsers = await User.find({ rol: 'Admin' });
    const course = await Course.findOne({ id: courseId });
    const bill = await Bill.findOne({ payment_id });

    if (bill)
      res
        .status(409)
        .redirect(
          `/courses/purchase/duplicated/${courseId}`
        );
    else {
      const noti = {
        title: 'Pago fallido',
        message:
          'Debes concretar el pago antes de comenzar a disfrutar del curso',
        link: `/courses/purchase/${course.id}`,
        status: 'red'
      };
      user.notifications.push(noti);
      adminUsers.forEach(async (admin) => {
        admin.notifications.push({
          title: 'Pago fallido',
          message: `Pago fallido de ${user.name}`,
          link: `/courses/${course.id}/1`,
          status: 'red'
        });
        await admin.save();
      });
      await user.save();

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
      const link = `${origin}/home`;
      const title = `<h1 style="color:black">Hubo un error con su compra...</h1>`;
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
        content: `Hubo un error al comprar "${course.name}" con número de órden ${merchant_order_id} e Id de Pago ${payment_id}`,
        message: message,
        to: [{
          email: user.email,
          name: user.name
        }], 
        subject: `Órden nro ${merchant_order_id}`
      });

      res
        .status(401)
        .redirect(
          `/courses/purchase/failure/${courseId}`
        );
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: 'Algo salio mal' });
  }
};

export default bookFeedbackFailure;
