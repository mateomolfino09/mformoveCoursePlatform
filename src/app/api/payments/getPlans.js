import mongoose from 'mongoose';
import connectDB from '../../../config/connectDB';
import Plan from '../../../models/planModel';

export async function getPlans() {
  const db = await connectDB();
  try {
    const plans = await Plan.find({});
    return JSON.parse(JSON.stringify(plans));
  } catch (err) {
    console.error('Error obteniendo planes:', err);
    throw err;
  } finally {
    if (db.connection) {
      await mongoose.disconnect();
      console.log('Conexión cerrada.');
    }
  }
}
