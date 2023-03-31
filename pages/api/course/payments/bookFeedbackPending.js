import connectDB from "../../../../config/connectDB"
import User from "../../../../models/userModel"
import Course from "../../../../models/courseModel"
import axios from 'axios'
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
const mercadopago = require('mercadopago');

mercadopago.configure({
	access_token: process.env.MERCADO_PAGO_PUBLIC_API_KEY // ojo con no poner una process.env.NEXT_PUBLIC_... 
});

connectDB()

const bookFeedbackPending = async (req, res) => {
  try {
    res.redirect('/src/courses/purchase/pending')
  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: "Algo salio mal" })  }
}

export default bookFeedbackPending