import {
  CoursesDB,
} from '../../../typings';
import { getCourses } from '../api/course/getCourses';
import connectDB from '../../config/connectDB';
import Home from '../../components/PageComponent/Home';


export default async function Page() {
connectDB();
const coursesDB: CoursesDB[] = await getCourses();

  return (
    <Home coursesDB={coursesDB}/>
  );
};

