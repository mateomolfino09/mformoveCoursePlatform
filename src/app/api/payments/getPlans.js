import connectDB from '../../../config/connectDB';
import Plan from '../../../models/planModel';
import Course from '../../../models/courseModel';
import User from '../../../models/userModel';

connectDB();

export const dynamic = "force-dynamic"; 
export const fetchCache = "force-no-store"

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const plans = await Plan.find({});
      res.status(200).json(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: 'Error fetching plans' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}