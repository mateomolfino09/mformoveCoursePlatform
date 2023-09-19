import Failure from '../../../../../components/PageComponent/Failure';
import connectDB from '../../../../../config/connectDB';
import { getCourseById } from '../../../../api/course/getCourseById';
  
  export default async function Page({ params }: { params: { courseId: number }}) {
  connectDB();
  const { courseId } = params
  const course = await getCourseById(courseId);  
    return (
      <Failure course={course}/>
    );
  };
  
  