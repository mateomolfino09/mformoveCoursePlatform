import connectDB from '../../../config/connectDB';
import Question from '../../../models/questionModel';
import dLocalApi from './dlocalTest';

connectDB();

export async function getUserSubscription(user) {
  try {
    const response = await dLocalApi.get(`/subscription/plan/${user.subscription.planId}/subscription/${user.subscription.id}/execution/all`, {
        planId: user.subscription.planId,
        subscriptionId: user.subscription.id
        });  
      let total = response?.data?.total_elements;
      let lastOcurrence = response?.data?.data[total - 1];
      console.log(lastOcurrence)
      return lastOcurrence;
  } catch (err) {
    console.log(err);
  }
}