import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import User from '../../../../models/userModel';
import { NextResponse } from 'next/server';
import dLocalApi from '../dlocalConfig';
import absoluteUrl from 'next-absolute-url';
import mailchimp from "@mailchimp/mailchimp_marketing";
import { generateMd5 } from '../../helper/generateMd5'
import jwt from 'jsonwebtoken';
import { getLatestSubscriptionByEmail } from '../stripe/getLatestSubscriptionByMail';
import { subscribeUserToMailchimp } from '../mailchimp/subscribeUserToMailchimp';

connectDB();
mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_API_SERVER,
  });

export async function PUT(req) {
    const {
        idUser, 
        planId
        } = await req.json();  
  try { 
      if (req.method === 'PUT') {
        //Me trae por defecto cuando Id es undefined
        const user = await User.findOne({ _id: idUser });

        let planIdDecoded = '';

        if (planId) {
            const decoded = await jwt.verify(planId, process.env.NEXTAUTH_SECRET);
            planIdDecoded = decoded.planId
          }

        if(!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

        }

        const plan = await Plan.findOne({ id: planIdDecoded });

        //CASO STRIPE
        if(plan?.provider == "stripe") {
            const latestSub = await getLatestSubscriptionByEmail(user.email);

            if (!latestSub) {
                return NextResponse.json({ success: false, message: "No hay suscripciones activas" }, { status: 404 });
            }
    
            const hashedEmail = generateMd5(user.email);

            const res = await subscribeUserToMailchimp(user, hashedEmail)

            if(res.success) {
                user.subscription = latestSub;
                user.freeSubscription = null;
                await user.save();
        
                user.password = null;
        
                return NextResponse.json({ success: true, user, message: res.message }, { status: 200 });
            }
            else {
                return NextResponse.json({ error: res.error}, { status: 401 })
            } 
        }
        //CASO DLOCAL
        else {
            let subsFromAPI = []
            let response = await dLocalApi.get(`/subscription/plan/${planIdDecoded}/subscription/all`);  
            let data = response.data.data;
            subsFromAPI = [...data]
    
            let subToAdd = subsFromAPI.reduce((max, current) => {
                return current.created_at > max.created_at ? current : max;
            }, subsFromAPI[0]); 
    
            const hashedEmail = generateMd5(user.email)

            const res = await subscribeUserToMailchimp(user, hashedEmail)

            if(res.success) {
                let newSub = {
                    id: subToAdd?.id,
                    planId: subToAdd.plan.id,
                    subscription_token: subToAdd.subscription_token,
                    status: subToAdd?.status,
                    payment_method_code: subToAdd?.payment_method_code,
                    client_id: subToAdd?.client_id,
                    success_url:subToAdd?.success_url,
                    client_first_name: subToAdd?.client_first_name,
                    client_last_name: subToAdd?.client_last_name,
                    client_document_type: subToAdd?.client_document_type,
                    client_document: subToAdd?.client_document,
                    client_email: subToAdd?.client_email,
                    created_at: subToAdd?.created_at,
                    active: subToAdd?.active,
                    }
            
                user.subscription = newSub
                user.freeSubscription = null
    
                await user.save()
                
                user.password = null
        
                return NextResponse.json({ success: true, user, message: res.message }, { status: 200 });
            }
            else {
                return NextResponse.json({ error: res.error}, { status: 401 })
            }
        }
    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    return NextResponse.json({ error: 'Algo salio mal', message }, { status: 401 })
}
};
