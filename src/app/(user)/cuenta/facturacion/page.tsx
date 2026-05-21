import Billing from '../../../../components/PageComponent/Billing';
import connectDB from '../../../../config/connectDB';
import { getUserBills } from '../../../api/user/bills/getUserBills';
  
  export default async function Page() {
  connectDB();
  const bills: any = await getUserBills();
  
    return (
      <Billing bills={bills}/>
    );
  };
  
  