import { getCurrentURL } from '../../assets/getCurrentURL';
import { stripe } from '../stripe/stripeConfig';
import User from '../../../../models/userModel';
import { getLatestSubscriptionByEmail } from '../stripe/getLatestSubscriptionByMail';
import { generateMd5 } from '../../helper/generateMd5';
import { subscribeUserToMailchimp } from '../mailchimp/subscribeUserToMailchimp';

export async function createStripeSubscription(customerEmail?: string) {
    const user = await User.findOne({ email: customerEmail })

    if(customerEmail == "" || !user) return null;

    if(user?.subscription?.active) {
        if (user.validEmail !== 'yes') {
          user.validEmail = 'yes';
          user.emailToken = undefined;
          await user.save();
        }
        return user;
    }

    try {
        const latestSub = await getLatestSubscriptionByEmail(user.email);

        if (!latestSub) {
            return null;
        }

        const hashedEmail = generateMd5(user.email);
        const res = await subscribeUserToMailchimp(user, hashedEmail)

        if(res.success) {
            // Inicializar onboarding si no existe
            if (!latestSub.onboarding) {
              latestSub.onboarding = {
                contratoAceptado: false,
                tutorialBitacoraCompletado: false,
                practicasSemanales: []
              };
            }
            
            user.subscription = latestSub;
            user.freeSubscription = null;
            if (user.validEmail !== 'yes') {
              user.validEmail = 'yes';
              user.emailToken = undefined;
            }
            await user.save();
    
            user.password = null;
    
            return user;
        }
        else {
            return null;
        } 
    } catch (err) {
        console.error('Error creando la sesión de pago:', err);
        return null;
    }
}