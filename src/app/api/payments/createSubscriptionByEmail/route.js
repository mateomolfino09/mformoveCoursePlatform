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

connectDB();
mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_API_SERVER,
  });

export async function PUT(req) {
    const {
        email, 
        planId
        } = await req.json();  
  try { 
      if (req.method === 'PUT') {
        //Me trae por defecto cuando Id es undefined
        const user = await User.findOne({ email: email });
        const hashedEmail = generateMd5(email)
        const MailchimpServer = process.env.MAILCHIMP_API_SERVER;
        const MailchimpAudience = process.env.MAILCHIMP_PLATFORM_AUDIENCE_ID;
        const MailchimpNewsletterAudience = process.env.MAILCHIMP_RUTINAS_AUDIENCE_ID;
        const customUrl = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpAudience}/members`;
        const customNewsletterUrl = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpNewsletterAudience}/members`;
        if(!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }
        
        let subsFromAPI = []
        let response = await dLocalApi.get(`/subscription/plan/${planId}/subscription/all`);  
        let data = response.data.data;
        subsFromAPI = [...data]

        let subToAdd = subsFromAPI.filter((item) => {
            return item.client_email == email
        })[0]

        if(!subToAdd) {
          return NextResponse.json({ error: 'Subscriptor no encontrado' }, { status: 404 })
        }

        if(subToAdd?.active) {
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

            const resmtag = await mailchimp.lists.
              updateListMemberTags(
              MailchimpNewsletterAudience,
              hashedEmail,
              { tags: [{ name: "VIP", status: "active" }]}
              );

            user.password = null
            return NextResponse.json({ success: true, user: user, message: "Subscriptor creado con éxito. Chequea tu email :)" }, { status: 200 })

        }
        else {
          if(user.subscription && user.subscription.planId == planId) {
            user.subscription = null;
            await user.save()

            const resmtag2 = await mailchimp.lists.updateListMemberTags(
              MailchimpNewsletterAudience,
              hashedEmail,
              { tags: [{ name: "VIP", status: "inactive" }]}
              );

              return NextResponse.json({ error: true, message: "No se ha encontrado una compra a este nombre. Eliminamos la subscripción"}, { status: 200 })
          }
          return NextResponse.json({ error: true, message: "No se ha encontrado una compra a este nombre."}, { status: 404 })
        }
    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
}
};
