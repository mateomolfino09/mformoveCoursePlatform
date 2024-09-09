import {
    ClassTypes,
  } from '../../../typings';
import Membership from '../../components/PageComponent/Membership/Membership';
  import connectDB from '../../config/connectDB';
  import dLocalApi from '../api/payments/dlocalTest';
import { getPlans } from '../api/payments/getPlans';
  
  
  export default async function Page() {

    const plans = await getPlans()
    let origin;
    if (process.env.NODE_ENV === 'development') {
      origin = "https://checkout-sbx.dlocalgo.com"
    } else {
      origin = "https://checkout.dlocalgo.com"
    }

  
    return (
      <Membership plans={plans} origin={origin}/>
    );
  };
  
  