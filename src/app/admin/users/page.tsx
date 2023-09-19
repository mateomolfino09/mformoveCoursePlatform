import ShowUsers from '../../../components/PageComponent/AdminUsers';
import connectDB from '../../../config/connectDB';
import { getConfirmedUsers } from '../../api/user/getConfirmedUsers';

  export default async function Page() {
  connectDB();
  const users: any = await getConfirmedUsers();
  //Chequear performance

    return (
      <ShowUsers users={users}/>
    );
  };