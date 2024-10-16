import connectDB from '../../../config/connectDB';
import Plan from '../../../models/planModel';
import Course from '../../../models/courseModel';
import User from '../../../models/userModel';

connectDB();

// Configuraciones para la caché y la dinámica de la función
export const dynamic = "force-dynamic"; 
export const fetchCache = "force-no-store";

export async function getPlans() {
  try {
    const plans = await Plan.find({});
    return JSON.parse(JSON.stringify(plans));
  } catch (err) {
    console.error("Error fetching plans:", err);
    return [];
  }
}
