import AdminMembershipIndex from '../../../components/PageComponent/AdminMembership/AdminMembershipIndex';
import connectDB from '../../../config/connectDB';

  export default async function Page() {
  connectDB();
  //Chequear performance

    return (
      <AdminMembershipIndex />
    );
  };