import {
  ClassTypes,
  CoursesDB,
  IndividualClass,
} from '../../../typings';
import { getCourses } from '../api/course/getCourses';
import connectDB from '../../config/connectDB';
import Home from '../../components/PageComponent/Home';
import { getClassTypes } from '../api/individualClass/getClassTypes';
import getVimeoData from '../api/individualClass/getVimeoFiles';
import { getClasses } from '../api/individualClass/getClasses';


export default async function Page() {
connectDB();
const filters: ClassTypes[] = await getClassTypes();
const classes: IndividualClass[] = await getClasses();


  return (
    <Home filters={filters} classesDB={classes}/>
  );
};

