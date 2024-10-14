import connectDB from '../../../config/connectDB';
import Plan from '../../../models/planModel';
import Course from '../../../models/courseModel';
import User from '../../../models/userModel';

connectDB();

export async function getPlans() {
  try {
    const res = await Plan.find({});
    const plans = JSON.parse(JSON.stringify(res));
    return plans;
  } catch (err) {
    console.log(err);
  }
}
