import Users from '../../../../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import absoluteUrl from 'next-absolute-url';
import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import dLocalApi from '../dlocalTest';
import mailchimp from "@mailchimp/mailchimp_marketing";

export async function POST(req) {
    connectDB();
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_API_SERVER,
    });
    const { email, planId } = await req.json();
    try {
      if (req.method === 'POST') {

        console.log(email)

  
        const user = await Users.findOne({ email });
  
        if (!user) {
          return NextResponse.json({ message: 'Usuario no encontrado'}, { status: 404 })
        }

        if(user?.subscription != null && user?.subscription.active) {
          const response = await dLocalApi.get(`/subscription/plan/${planId}/subscription/${user.subscription.id}/execution/all`, {
            planId,
            subscriptionId: user.subscription.id
            });  
          let total = response?.data?.total_elements;
          let lastOcurrence = response?.data?.data[total - 1];
          console.log(lastOcurrence)
          if(lastOcurrence?.status === "COMPLETED") {
            return NextResponse.json({ message: 'Ya estas subscripto y tus pagos se realizaron con éxito.', type: 'error', success: false}, { status: 401 })
          }
          else {
            user.subscription = null;
            const res = await dLocalApi.patch(`/subscription/plan/${planId}/subscription/${user.subscription.id}/deactivate`, {
              planId,
              subscriptionId
              });  

            const resm = await mailchimp.lists.updateListMember(
              process.env.MAILCHIMP_RUTINAS_AUDIENCE_ID,
              hashedEmail,
              {
                  email_address: user.email,
                  merge_fields: {
                      FNAME: "",
                      LNAME: ""
                      },
                  vip: false
              }
            );

            const resmtag = await mailchimp.lists.updateListMemberTags(
              process.env.MAILCHIMP_RUTINAS_AUDIENCE_ID,
              hashedEmail,
              { tags: [{ name: "VIP", status: "inactive" }] },{ tags: [{ name: "Member", status: "active" }] }
            );

            await user.save()
          }

        }
    
        const token = jwt.sign(
        { userId: user._id },
        process.env.NEXTAUTH_SECRET,
        {
            expiresIn: '30d'
        }
        );

        const planToken = jwt.sign(
          { planId: planId },
          process.env.NEXTAUTH_SECRET,
          {
              expiresIn: '30d'
          }
          );

        return NextResponse.json({
        token,
        planToken,
        success: true
        }, { status: 201 })
  
      } else {
        return NextResponse.json({ message: 'Error inesperado, vuelva a intentar', type: 'error'}, { status: 401 })
      }
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: 'Error inesperado, vuelva a intentar', type: 'error'}, { status: 500 })
    }
  };