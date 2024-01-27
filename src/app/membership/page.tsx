import {
    ClassTypes,
  } from '../../../typings';
import Membership from '../../components/PageComponent/Membership/Membership';
  import connectDB from '../../config/connectDB';
  import dLocalApi from '../api/payments/dlocalTest';
import { getPlans } from '../api/payments/getPlans';
  
  
  export default async function Page() {

    const plans = await getPlans()

  
    return (
      <Membership plans={plans} />
    );
  };
  
  