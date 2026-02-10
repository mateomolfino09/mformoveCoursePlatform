import jwt, { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import { NextResponse } from 'next/server';
import dLocalApi from '../dlocalConfig';
import { isToday, isTodayLastHour } from '../../assets/isTodayLastHour';
import { generateMd5 } from '../../helper/generateMd5';
import User from '../../../../models/userModel';
import { generatePassword } from '../../assets/randomPasswordGenerator';
import bcrypt from 'bcryptjs';
import mailchimp from "@mailchimp/mailchimp_marketing";

connectDB();
mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_API_SERVER,
  });

export async function POST(req) {
    const {
        email, planId, name, gender, country
        } = await req.json();  
  try { 
      if (req.method === 'POST') {
        const user = await User.findOne({ email: email });
        const hashedEmail = generateMd5(email)
        const response = await dLocalApi.get(`/subscription/plan/${planId}/subscription/all`);  
        const data = response.data.data;
        let clientLastBought = data.filter(x => x.client_email == email && x.active)[0];
        const MailchimpServer = process.env.MAILCHIMP_API_SERVER;
        const MailchimpAudience = process.env.MAILCHIMP_PLATFORM_AUDIENCE_ID;
        const MailchimpNewsletterAudience = process.env.MAILCHIMP_RUTINAS_AUDIENCE_ID;
        const customUrl = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpAudience}/members`;
        const customNewsletterUrl = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpNewsletterAudience}/members`;


        //en caso de que no haya compra elimino al usuario de los vips
        if(!clientLastBought) {
          return NextResponse.json({ error: true, message: "No se ha encontrado una compra a este nombre."}, { status: 404 })
        }

        let when = clientLastBought.created_at;
        let update = clientLastBought.updated_at;

        let isTLH = isToday(when) || isToday(update)

        if(isTLH) {

            //create Subscription

            if (user) {

              //si hay usuario no necesariamente hay subscripcion

              if(!user.subscription && !user.freeSubscription) {
                //CASO NO SUBSCRIPTO
                //Subscribo a ambas Newsletter
                const res = await mailchimp.lists.setListMember(
                  MailchimpNewsletterAudience,
                  hashedEmail,
                  {
                      email_address: email,
                      merge_fields: {
                          FNAME: "",
                          LNAME: "",
                          PASSWORD: user.password
                          },
                      status_if_new: "subscribed",
                      status: "subscribed",
                      tags: ["VIP", "RUTINA", "PLATAFORMA"],
                      vip: true
                  }
                  );
              }
              else {
                //CASO SUBSCRIPTO
                const resmtag = await mailchimp.lists.updateListMemberTags(
                MailchimpNewsletterAudience,
                hashedEmail,
                { tags: [{ name: "VIP", status: "active" }]}
                );
              }

                let newSub = {
                    id: clientLastBought?.id,
                    planId: clientLastBought.plan.id,
                    subscription_token: clientLastBought.subscription_token,
                    status: clientLastBought?.status,
                    payment_method_code: clientLastBought?.payment_method_code,
                    client_id: clientLastBought?.client_id,
                    success_url:clientLastBought?.success_url,
                    client_first_name: clientLastBought?.client_first_name,
                    client_last_name: clientLastBought?.client_last_name,
                    client_document_type: clientLastBought?.client_document_type,
                    client_document: clientLastBought?.client_document,
                    client_email: clientLastBought?.client_email,
                    created_at: clientLastBought?.created_at,
                    active: clientLastBought?.active,
                    }
            
                    user.subscription = newSub
                    user.freeSubscription = null
                    if (user.validEmail !== 'yes') {
                      user.validEmail = 'yes';
                      user.emailToken = undefined;
                    }
                    await user.save()
                    
                return NextResponse.json({ message: `Usuario subscripto a NewsLetter VIP con éxito.`, newSub, success: true}, { status: 200 })

            }
             
            const password = generatePassword(16);
            const HashedPassword = await bcrypt.hash(password, 12);
      
            const newUser = await new User({
              email: email,
              password: HashedPassword,
              name: name,
              gender: gender,
              country: country
            });
      
            newUser.validEmail = 'yes';
            newUser.emailToken = undefined;
      
            newUser.notifications.push({
              title: 'Usuario creado',
              message: `¡Te damos la bienvenida a MForMove ${newUser.name}!`,
              status: 'green'
            });
      
            newUser.admin = {
              active: false,
            };
      
            const adminUsers = await User.find({
              rol: 'Admin'
            });
            adminUsers.forEach(async (user) => {
              user.notifications.push({
                title: 'Usuario creado',
                message: `¡Le damos la bienvenida a ${newUser.name} a MForMove!`,
                status: 'green'
              });
              await user.save();
            });
      
            await newUser.save();
      
            //SUBSCRIBO A MAILCHIMP PLATFORMA  
          
            const res = await mailchimp.lists.setListMember(
                MailchimpNewsletterAudience,
                hashedEmail,
            {
                email_address: email,
                merge_fields: {
                    FNAME: "",
                    LNAME: "",
                    PASSWORD: password
                    },
                status_if_new: "subscribed",
                status: "subscribed",
                tags: ["VIP", "RUTINA", "PLATAFORMA"],
                vip: true
            }
            );

            const resmtag = await mailchimp.lists.updateListMemberTags(
            MailchimpNewsletterAudience,
            hashedEmail,
            { tags: [{ name: "VIP", status: "active" }] }
            );

            let newSub = {
                id: clientLastBought?.id,
                planId: clientLastBought.plan.id,
                subscription_token: clientLastBought.subscription_token,
                status: clientLastBought?.status,
                payment_method_code: clientLastBought?.payment_method_code,
                client_id: clientLastBought?.client_id,
                success_url:clientLastBought?.success_url,
                client_first_name: clientLastBought?.client_first_name,
                client_last_name: clientLastBought?.client_last_name,
                client_document_type: clientLastBought?.client_document_type,
                client_document: clientLastBought?.client_document,
                client_email: clientLastBought?.client_email,
                created_at: clientLastBought?.created_at,
                active: clientLastBought?.active,
                }
        
                newUser.subscription = newSub
                newUser.freeSubscription = null
            await newUser.save()
            newUser.password = null;
      
      
            return NextResponse.json({ message: `Usuario subscripto a NewsLetter VIP con éxito.`, newSub, success: true }, { status: 200 })

        }
        else {
            return NextResponse.json({ error: true, message: "No hay compras hechas hoy asociadas a este email."}, { status: 404 })
        }

    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
}
};
