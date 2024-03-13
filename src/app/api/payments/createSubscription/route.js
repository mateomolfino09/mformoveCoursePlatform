import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import User from '../../../../models/userModel';
import { NextResponse } from 'next/server';
import dLocalApi from '../dlocalTest';
import absoluteUrl from 'next-absolute-url';


connectDB();

export async function POST(req) {
    const {
        idUser, 
        } = await req.json();  
  try { 
      if (req.method === 'PUT') {
        const plans = await Plan.find({}).lean().exec();
        const user = await User.find({ _id: idUser }).lean().exec();

        const subsFromAPI = []

        plans.forEach(async p => {
            const response = await dLocalApi.get(`/subscription/plan/${p.id}/subscription/all`);  
            const data = response.data;
            subsFromAPI = [...subsFromAPI, ...data]
        });

        // const subToAdd = subsFromAPI.filter((subFromApi) => subs.findIndex((v) => v.id == subFromApi.id) == -1)
        const subToAdd = subsFromAPI.reduce((max, current) => {
            return current.created_at > max.created_at ? current : max;
        }, subsFromAPI[0]); 

        console.log(subToAdd)

        const newSub = {
        id: subToAdd?.id,
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
        user: user._id
        }

        user.subscription = newSub

        return NextResponse.json({ success: true, user: user, message: "Subscriptor creado con éxito" }, { status: 200 })


    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
}
};
