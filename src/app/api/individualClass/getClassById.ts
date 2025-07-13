import connectDB from '../../../config/connectDB';
import IndividualClass from '../../../models/individualClassModel';
import User from '../../../models/userModel';
import ClassFilters from '../../../models/classFiltersModel';

connectDB();

export async function getClassById(id: string = "") {
  try {
    let res = await IndividualClass.findOne({id: id})
    const classes = JSON.parse(JSON.stringify(res));
    return classes;
  } catch (err) {
    }
}
