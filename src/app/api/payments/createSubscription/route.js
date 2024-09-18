import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import User from '../../../../models/userModel';
import { NextResponse } from 'next/server';
import dLocalApi from '../dlocalTest';
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

        let subsFromAPI = []
        let response = await dLocalApi.get(`/subscription/plan/${planIdDecoded}/subscription/all`);  
        let data = response.data.data;
        subsFromAPI = [...data]

        let subToAdd = subsFromAPI.reduce((max, current) => {
            return current.created_at > max.created_at ? current : max;
        }, subsFromAPI[0]); 

        const hashedEmail = generateMd5(user.email)

        const res = await mailchimp.lists.setListMember(
            process.env.MAILCHIMP_RUTINAS_AUDIENCE_ID,
            hashedEmail,
            {
                email_address: user.email,
                merge_fields: {
                    FNAME: "",
                    LNAME: ""
                    },
                status_if_new: "subscribed",
                tags: ["VIP"],
                vip: true
            }
            );

            const resmtag = await mailchimp.lists.updateListMemberTags(
            process.env.MAILCHIMP_RUTINAS_AUDIENCE_ID,
            hashedEmail,
            { tags: [{ name: "VIP", status: "active" }] }
            );

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
                return NextResponse.json({ success: true, user: user, message: "Subscriptor creado con éxito. Chequea tu email :)" }, { status: 200 })
    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
}
};
