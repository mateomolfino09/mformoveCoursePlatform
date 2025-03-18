import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import User from '../../../../models/userModel';
import { NextResponse } from 'next/server';
import absoluteUrl from 'next-absolute-url';
import mailchimp from "@mailchimp/mailchimp_marketing";
import { generateMd5 } from '../../helper/generateMd5';


connectDB();
mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_API_SERVER,
  });

export async function PUT(req) {
    const {
        email, 
        } = await req.json();  
  try { 
      if (req.method === 'PUT') {
        //Me trae por defecto cuando Id es undefined
        const user = await User.findOne({ email: email });

        if(!user) {
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 })

        }

        if(user?.subscription?.active || user?.freeSubscription?.active) {
            return NextResponse.json({ message: 'Ya estas subscripto' }, { status: 401 })
        }

        const MailchimpKey = process.env.MAILCHIMP_API_KEY;
        const MailchimpServer = process.env.MAILCHIMP_API_SERVER;
        const MailchimpNewsletterAudience = process.env.MAILCHIMP_RUTINAS_AUDIENCE_ID;

        const customUrl = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpNewsletterAudience}/members`;
        const hashedEmail = generateMd5(email)

        const res = await mailchimp.lists.setListMember(
          MailchimpNewsletterAudience,
          hashedEmail,
          {
              email_address: email,
              merge_fields: {
                  FNAME: user.name,
                  LNAME: "",
                  },
              status_if_new: "subscribed",
              status: "subscribed",
              tags: ["RUTINA", "PLATAFORMA"],
          })

        console.log(res)

        if(res.status == "subscribed") {
            let newSub = {
                email: user?.email,
                active: true,
            }
    
            user.freeSubscription = newSub
            await user.save()
            user.password = null;

    
            return NextResponse.json({ success: true, user: user, message: "Subscriptor creado con éxito. Chequea tu email :)" }, { status: 200 })
        }
        else {
            return NextResponse.json({ success: false, user: user, message: res.detail }, { status: 400 })
        }



    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
}
};
