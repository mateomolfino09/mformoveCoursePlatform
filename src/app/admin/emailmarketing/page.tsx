import { CoursesDB } from '../../../../typings';
import EmailMarketing from '../../../components/PageComponent/EmailMarketing/EmailMarketing';
import connectDB from '../../../config/connectDB';
import { getCourses } from '../../api/course/getCourses';

  export default async function Page() {
  connectDB();
  const coursesDB: CoursesDB[] = await getCourses();
  //Chequear performance

    return (
      <EmailMarketing courses={coursesDB}/>
    );
  };