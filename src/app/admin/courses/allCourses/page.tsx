import {
    CoursesDB,
  } from '../../../../../typings';
  import { getCourses } from '../../../api/course/getCourses';
  import connectDB from '../../../../config/connectDB';
  import Home from '../../../../components/PageComponent/Home';
import AllCourses from '../../../../components/PageComponent/AllCourses';
  
  
  export default async function Page() {
  connectDB();
  const courses: CoursesDB[] = await getCourses();
  
    return (
      <AllCourses courses={courses}/>
    );
  };