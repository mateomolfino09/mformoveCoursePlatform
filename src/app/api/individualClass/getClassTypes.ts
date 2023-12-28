import connectDB from '../../../config/connectDB';
import ClassFilters from '../../../models/classFiltersModel';

connectDB();

export async function getClassTypes() {
  try {
    const res = await ClassFilters.find({})
      .lean()
      .exec();
    const classFilters = JSON.parse(JSON.stringify(res));
    return classFilters;
  } catch (err) {
    console.log(err);
  }
}
