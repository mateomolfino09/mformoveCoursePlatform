import { getCourseById } from '../../../api/course/getCourseById';
import connectDB from '../../../../config/connectDB';
import CoursePurchase from '../../../../components/PageComponent/CoursePurchase';
import EditUser from '../../../../components/PageComponent/EditUser';
import { getUser } from '../../../api/user/getUser';

  export default async function Page({ params }: { params: { id: number }}) {
  connectDB();
  const { id } = params;
  const user: any = await getUser();
  //Chequear performance

    return (
      <EditUser user={user}/>
    );
  };