import connectDB from '../../../config/connectDB';
import Bills from '../../../models/billModel';
import bcrypt from 'bcryptjs';

connectDB();

export async function getAllBills() {
  try {
    const bills = await Bills.find({})
      .populate({ path: 'course' })
      .populate({ path: 'user' })
      .lean()
      .exec();
    return JSON.parse(JSON.stringify(bills));
  } catch (err) {
    console.log(err);
  }
}
