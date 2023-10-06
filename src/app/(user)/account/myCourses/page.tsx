import {
    CoursesDB,
  } from '../../../../../typings';
import MyCourses from '../../../../components/PageComponent/MyCourses';
import connectDB from '../../../../config/connectDB';
import { getUserCourses } from '../../../api/user/course/getUserCourses';
  
  
  export default async function Page() {
  connectDB();
  const coursesDB: CoursesDB[] = await getUserCourses();
  
    return (
      <MyCourses courses={coursesDB}/>
    );
  };
  
  