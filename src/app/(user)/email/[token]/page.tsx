import { getCourseById } from '../../../api/course/getCourseById';
import connectDB from '../../../../config/connectDB';
import CoursePurchase from '../../../../components/PageComponent/CoursePurchase';
import EmailVerification from '../../../../components/PageComponent/EmailVerification';

  export default async function Page({ params }: { params: { token: string }}) {
  connectDB();
  const { token } = params;

    return (
      <EmailVerification token={token}/>
    );
  };