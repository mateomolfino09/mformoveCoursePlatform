import { getCourseById } from '../../../api/course/getCourseById';
import connectDB from '../../../../config/connectDB';
import CoursePurchase from '../../../../components/PageComponent/CoursePurchase';
import EditUser from '../../../../components/PageComponent/EditUser';

  export default async function Page({ params }: { params: { id: number }}) {
  connectDB();
  const { id } = params;
  //Chequear performance

    return (
      <EditUser />
    );
  };