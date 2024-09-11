import SelectPlan from '../../components/PageComponent/SelectPlan/SelectPlan';
import { getPlans } from '../api/payments/getPlans';
  
  
  export default async function Page() {

    const plans = await getPlans()
    let origin;

    if (process.env.NODE_ENV != 'production') {
      origin = "https://checkout-sbx.dlocalgo.com"
    } else {
      origin = "https://checkout.dlocalgo.com"
    }

    return (
      <SelectPlan plans={plans} origin={origin}/>
    );
  };
  
  