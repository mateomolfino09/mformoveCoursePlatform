import connectDB from '../../../config/connectDB';
import IndividualClass from '../../../models/individualClassModel';
import User from '../../../models/userModel';
import ClassFilters from '../../../models/classFiltersModel';

connectDB();

export async function getClassesByType(classType: string = "") {
  try {
    const res = await IndividualClass.find({type: { $regex: classType, $options: 'i' }})
    const classes = JSON.parse(JSON.stringify(res));
    return classes;
  } catch (err) {
    console.log(err);
  }
}
