import connectDB from '../../../config/connectDB';
import IndividualClass from '../../../models/individualClassModel';
import User from '../../../models/userModel';
import ClassFilters from '../../../models/classFiltersModel';

connectDB();

export async function getClassByUrl(url: string = "") {
  try {
    let res = await IndividualClass.findOne({video_url: `/videos/${url}`})
    const classes = JSON.parse(JSON.stringify(res));
    return classes;
  } catch (err) {
    console.log(err);
  }
}
