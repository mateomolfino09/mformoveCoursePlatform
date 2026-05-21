import Billing from '../../../components/PageComponent/AdminBilling';
import connectDB from '../../../config/connectDB';
import { getAllBills } from '../../api/admin/getAllBills';

  export default async function Page() {
  connectDB();
  const bills = await getAllBills()
  //Chequear performance

    return (
      <Billing bills={bills} />
    );
  };