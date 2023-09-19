import { updateActualCourseSS } from '../../../api/user/updateActualCourseSS';
import { getQuestionsFromClass } from '../../../api/question/getAllQuestions';
import { getClassById } from '../../../api/class/getClassById';
import { getCourseById } from '../../../api/course/getCourseById';
import { getUserCourses } from '../../../api/user/course/getUserCourses';
import { CoursesDB } from '../../../../../typings';
import connectDB from '../../../../config/connectDB';
import Course from '../../../../components/PageComponent/Course';

  export default async function Page({ params }: { params: { id: string, classId: number }}) {
  connectDB();
  const { classId, id } = params;
  const clase = await getClassById(classId, id);
  const classUId = clase._id;
  const courseId = clase.course.id;
  const courseDB = await getCourseById(courseId);
  const user: any = await updateActualCourseSS(id, classId);
  const questions = await getQuestionsFromClass(classUId);
  const coursesDB: CoursesDB[] = await getUserCourses();
  
    return (
      <Course clase={clase} user={user} courseDB={courseDB} questions={questions}/>
    );
  };
  
  