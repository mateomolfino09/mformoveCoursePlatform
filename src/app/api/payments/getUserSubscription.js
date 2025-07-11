import connectDB from '../../../config/connectDB';
import Question from '../../../models/questionModel';
import dLocalApi from './dlocalConfig';

connectDB();

export async function getUserSubscription(user) {
  try {
    const response = await dLocalApi.get(`/subscription/plan/all`);  
      let data = response?.data.data.filter(x => x.active == true);
      let subs = [];

      for(const p of data) {
        const response = await dLocalApi.get(`/subscription/plan/${p.id}/subscription/all`);  
        const subscriptions = response.data.data
        subs.push(...subscriptions);
      }

      const userSub = subs.filter(x => x.client_email === user.email)[0];

      if(userSub) {
        const response = await dLocalApi.get(`/subscription/plan/${userSub.plan.id}/subscription/${userSub.id}/execution/all`, {
          planId: userSub.plan.id,
          subscriptionId: userSub.id
          });  
          let total = response?.data?.total_elements;
          let lastOcurrence = response?.data?.data[total - 1];

          let newSub = {
            id: lastOcurrence?.subscription?.id,
            planId: lastOcurrence?.subscription.plan.id,
            subscription_token: lastOcurrence?.subscription.subscription_token,
            status: lastOcurrence?.subscription?.status,
            payment_method_code: lastOcurrence?.subscription?.payment_method_code,
            client_id: lastOcurrence?.subscription?.client_id,
            success_url:lastOcurrence?.subscription?.success_url,
            client_first_name: lastOcurrence?.subscription?.client_first_name,
            client_last_name: lastOcurrence?.subscription?.client_last_name,
            client_document_type: lastOcurrence?.subscription?.client_document_type,
            client_document: lastOcurrence?.subscription?.client_document,
            client_email: lastOcurrence?.subscription?.client_email,
            created_at: lastOcurrence?.subscription?.created_at,
            active: lastOcurrence?.subscription?.active,
            }

            return newSub;
      }
      return null;
  } catch (err) {
    }
}