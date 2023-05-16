import connectDB from '../../../../config/connectDB';
import Bills from '../../../../models/billModel';

connectDB();

export async function getUserBills(userId) {
  try {
    const bills = await Bills.find({ user: userId })
      .populate({ path: 'course' })
      .lean()
      .exec();
    return JSON.parse(JSON.stringify(bills));
  } catch (err) {
    console.log(err);
  }
}
