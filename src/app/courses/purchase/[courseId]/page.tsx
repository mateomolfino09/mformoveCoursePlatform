import { getCourseById } from '../../../api/course/getCourseById';
import connectDB from '../../../../config/connectDB';
import CoursePurchase from '../../../../components/PageComponent/CoursePurchase';

  export default async function Page({ params }: { params: { courseId: number }}) {
  connectDB();
  const { courseId } = params;
  const course = await getCourseById(courseId);

  
    return (
      <CoursePurchase course={course}/>
    );
  };