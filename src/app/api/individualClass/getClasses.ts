import connectDB from '../../../config/connectDB';
import IndividualClass from '../../../models/individualClassModel';
import User from '../../../models/userModel';
import ClassFilters from '../../../models/classFiltersModel';

connectDB();

export async function getClasses(search: string = "") {
  try {
    let res;
    search != "" 
    ? res = await IndividualClass.find({name: { $regex: search, $options: 'i' }})
    : res = await IndividualClass.find({})
    const classes = JSON.parse(JSON.stringify(res));
    return classes;
  } catch (err) {
    console.log(err);
  }
}
