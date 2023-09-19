'use client'
import Success from '../../../../components/PageComponent/Success';
import connectDB from '../../../../config/connectDB';
import { getCourseById } from '../../../api/course/getCourseById';
import { useSearchParams } from 'next/navigation'
  
  export default async function Page() {
  connectDB();
  const searchParams = useSearchParams()
  const courseId = searchParams?.get('courseId')
  const course = await getCourseById(courseId);  
    return (
      <Success course={course}/>
    );
  };
  
  