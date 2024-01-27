import SelectPlan from '../../components/PageComponent/SelectPlan/SelectPlan';
import { getPlans } from '../api/payments/getPlans';
  
  
  export default async function Page() {

    const plans = await getPlans()

  
    return (
      <SelectPlan plans={plans} />
    );
  };
  
  