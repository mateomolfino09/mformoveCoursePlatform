import {
    CoursesDB, Plan,
  } from '../../../../../typings';
  import { getPlans } from '../../../api/payments/plans/route';
  import connectDB from '../../../../config/connectDB';
import AllCourses from '../../../../components/PageComponent/AllCourses';
import AllPlans from '../../../../components/PageComponent/AdminMembership/AllPlans';
  
  
  export default async function Page() {
  connectDB();
  const plans: Plan[] = await getPlans();
  
    return (
      <AllPlans plans={plans}/>
    );
  };