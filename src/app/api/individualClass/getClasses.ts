import connectDB from '../../../config/connectDB';
import IndividualClass from '../../../models/individualClassModel';
import User from '../../../models/userModel';
import ClassFilters from '../../../models/classFiltersModel';

connectDB();

export async function getClasses() {
  try {
    const res = await IndividualClass.find({});
    console.log(res)
    const classes = JSON.parse(JSON.stringify(res));
    return classes;
  } catch (err) {
    console.log(err);
  }
}
