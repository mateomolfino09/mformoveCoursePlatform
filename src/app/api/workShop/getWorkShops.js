import connectDB from '../../../config/connectDB';
import WorkShop from '../../../models/workshopModel';


connectDB();

export async function getWorkShops() {
  try {
    const res = await WorkShop.find({}).populate('classes');
    const workShops = JSON.parse(JSON.stringify(res));
    return workShops;
  } catch (err) {
    console.log(err);
  }
}
