import { getCurrentURL } from '../../assets/getCurrentURL';
import { stripe } from '../stripe/stripeConfig';
import User from '../../../../models/userModel';
import { getLatestSubscriptionByEmail } from '../stripe/getLatestSubscriptionByMail';
import { generateMd5 } from '../../helper/generateMd5';
import { subscribeUserToMailchimp } from '../mailchimp/subscribeUserToMailchimp';

export async function updateStripeSubscription(customerEmail?: string) {
    const user = await User.findOne({ email: customerEmail })

    if(customerEmail == "" || !user) return null;

    try {
        const latestSub = await getLatestSubscriptionByEmail(user.email);

        if (!latestSub) {
            return null;
        }
        
        user.subscription = latestSub;
        if (user.validEmail !== 'yes') {
          user.validEmail = 'yes';
          user.emailToken = undefined;
        }
        await user.save();
        user.password = null;
        return latestSub;

    } catch (err) {
        console.error('Error creando la sesión de pago:', err);
        return null;
    }
}