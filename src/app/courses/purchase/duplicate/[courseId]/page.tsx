import Duplicate from '../../../../../components/PageComponent/Duplicate';
import connectDB from '../../../../../config/connectDB';
import { getCourseById } from '../../../../api/course/getCourseById';
  
  export default async function Page({ params }: { params: { courseId: number }}) {
  connectDB();
  const { courseId } = params
  const course = await getCourseById(courseId);  
    return (
      <Duplicate course={course}/>
    );
  };
  
  