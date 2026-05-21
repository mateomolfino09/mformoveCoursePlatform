import connectDB from '../../../../config/connectDB';
import ResetPassword from '../../../../components/PageComponent/ResetPassword';
import ResetForm from '../../../../components/PageComponent/Reset/ResetForm';

  export default async function Page({ params }: { params: { token: string }}) {
  connectDB();
  const { token } = params;

    return (
      <ResetForm token={token}/>
    );
  };