import User from '../../../../models/userModel';
import { getLatestSubscriptionByEmail } from '../stripe/getLatestSubscriptionByMail';
export async function deleteStripeSubscription(customerEmail?: string) {
    const user = await User.findOne({ email: customerEmail })

    if(customerEmail == "" || !user) return null;

    try {
        const latestSub = await getLatestSubscriptionByEmail(user.email);

        if (!latestSub) {
            return null;
        }

        !latestSub.status ? user.subscription = null : user.subscription = latestSub
        await user.save();
        user.password = null;
        return user;

    } catch (err) {
        console.error('Error creando la sesión de pago:', err);
        return null;
    }
}