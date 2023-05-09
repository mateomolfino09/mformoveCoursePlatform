import connectDB from '../../../../config/connectDB'
import Course from '../../../../models/courseModel'
import User from '../../../../models/userModel'
import axios from 'axios'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const mercadopago = require('mercadopago')

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_PUBLIC_API_KEY // ojo con no poner una process.env.NEXT_PUBLIC_...
})

connectDB()

const userPurchase = async (req, res) => {
  const { email, courseId } = req.body
  const user = await User.findOne({ email })
  const course = await Course.findOne({ id: courseId })
  const url = 'https://api.mercadopago.com/checkout/preferences'

  try {
    if (req.method === 'POST') {
      const { host } = req.headers

      let preference = {
        // payer_email : req.body.payer_email,
        payer_email: 'test_user_517283893@testuser.com',
        // items: [
        //   {
        //     title: req.body.description,
        //     unit_price: Number(req.body.price),
        //     quantity: 1,
        //   }
        items: [
          {
            title: course.name,
            description: course.description,
            picture_url: course.image_url,
            category_id: course.id,
            quantity: 1,
            unit_price: Number(course.price)
          }
        ],

        back_urls: {
          // aca poder volver a llamar un api endpoint que redirecciona, por ejemplo si tenes que escribir en la BD, llamar a una lambda, etc. o directamente a una pagina /pages/pagos/success o lo que sea. Yo en este ejemplo llamo a una api endpoint
          success: `${host}/api/course/payments/bookFeedbackSuccess/?courseId=${courseId}&email=${email}`,
          failure: `${host}/api/course/payments/bookFeedbackFailure/?courseId=${courseId}&email=${email}`,
          pending: `${host}/api/course/payments/bookFeedbackPending/?courseId=${courseId}&email=${email}`
        }
      }

      const payment = await axios.post(url, preference, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MERCADO_PAGO_PUBLIC_API_KEY}`
        }
      })

      res.status(200).json({
        data: payment.data
      })
    } else {
      return res.status(401).json({ error: 'Algo salio mal' })
    }
  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: 'Algo salio mal' })
  }
}

export default userPurchase
