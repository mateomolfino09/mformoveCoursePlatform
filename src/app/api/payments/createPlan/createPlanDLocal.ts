import connectDB from '../../../../config/connectDB';
import dLocalApi from '../dlocalConfig';
import Plan from '../../../../models/planModel';
import { getCurrentURL } from '../../assets/getCurrentURL';

connectDB();

interface Props {
    name: string,
    currency: string,
    description: string,
    amount: number,
    frequency_type: string
}

export async function createPlanDlocal({name,
    currency,
    description,
    amount,
    frequency_type}: Props) {
  try {
    let origin = getCurrentURL();

    const response = await dLocalApi.post('/subscription/plan', {
        name,
        currency,
        description,
        amount,
        frequency_type,
        frequency_value: 1,
        success_url: `${origin}/payment/success`,
        error_url: `${origin}/payment/error`,
        back_url: `${origin}/payment/back`
      });

      const data = response.data;

      const frequency_label =
        frequency_type === 'MONTHLY' ? 'Mensual' : 'Anual';

      let newPlan = await new Plan({
        id: data?.id,
        name,
        merchant_id: data?.merchant_id,
        description,
        currency,
        country: data?.country,
        amount,
        error_url: data.error_url,
        success_url: data.success_url,
        back_url: data.back_url,
        frequency_type,
        frequency_value: data.frequency_value,
        frequency_label,
        active: data?.active,
        plan_token: data?.plan_token,
        free_trial_days: data?.free_trial_days
      }).save();

      return newPlan;
  } catch (err) {
    console.log(err);
  }
}