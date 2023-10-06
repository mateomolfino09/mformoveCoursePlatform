import connectDB from '../../../../config/connectDB';
import ResetForm from '../../../../components/PageComponent/Reset/ResetForm';
import ResetEmailForm from '../../../../components/PageComponent/ResetEmailTokenForm/ResetForm';

  export default async function Page({ params }: { params: { token: string }}) {
  connectDB();
  const { token } = params;

    return (
      <ResetEmailForm token={token}/>
    );
  };