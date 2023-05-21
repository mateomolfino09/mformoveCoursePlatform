import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Bills from '../../../../models/billModel';

connectDB();

export async function getUserBills(req) {
  try {
    const { userToken } = req.cookies;
    const data =  verify(userToken, process.env.NEXTAUTH_SECRET)
    const userId = data.userId

    const bills = await Bills.find({ user: userId })
      .populate({ path: 'course' })
      .lean()
      .exec();
    return JSON.parse(JSON.stringify(bills));
  } catch (err) {
    console.log(err);
  }
}
