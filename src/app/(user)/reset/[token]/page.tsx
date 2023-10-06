import { getCourseById } from '../../../api/course/getCourseById';
import connectDB from '../../../../config/connectDB';
import CoursePurchase from '../../../../components/PageComponent/CoursePurchase';
import ResetPassword from '../../../../components/PageComponent/ResetPassword';
import ResetForm from '../../../../components/PageComponent/Reset/ResetForm';

  export default async function Page({ params }: { params: { token: string }}) {
  connectDB();
  const { token } = params;

    return (
      <ResetForm token={token}/>
    );
  };