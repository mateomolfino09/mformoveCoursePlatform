import {
    CoursesDB,
  } from '../../../typings';
  import { getCourses } from '../api/course/getCourses';
  import connectDB from '../../config/connectDB';
import Courses from '../../components/PageComponent/Courses/Courses';
  
  
  export default async function Page() {
  connectDB();
  const coursesDB: CoursesDB[] = await getCourses();
  
    return (
      <Courses coursesDB={coursesDB}/>
    );
  };
  
  