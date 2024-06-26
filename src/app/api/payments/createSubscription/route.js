import { verify } from 'jsonwebtoken';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import User from '../../../../models/userModel';
import { NextResponse } from 'next/server';
import dLocalApi from '../dlocalTest';
import absoluteUrl from 'next-absolute-url';


connectDB();

export async function PUT(req) {
    const {
        idUser, 
        } = await req.json();  
  try { 
      if (req.method === 'PUT') {
        let plans = await Plan.find({}).lean().exec();
        //Me trae por defecto cuando Id es undefined
        const user = await User.findOne({ _id: idUser });

        if(!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

        }

        if(user?.subscription?.active) {
            return NextResponse.json({ error: 'Ya estas subscripto' }, { status: 401 })

        }

        let subsFromAPI = []

        for (const p of plans) {
            let response = await dLocalApi.get(`/subscription/plan/${p.id}/subscription/all`);  
            let data = response.data.data;
            subsFromAPI = [...subsFromAPI, ...data]
          }

        // let subToAdd = subsFromAPI.filter((subFromApi) => subs.findIndex((v) => v.id == subFromApi.id) == -1)
        let subToAdd = subsFromAPI.reduce((max, current) => {
            return current.created_at > max.created_at ? current : max;
        }, subsFromAPI[0]); 

        console.log(subToAdd)

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
        await user.save()

        return NextResponse.json({ success: true, user: user, message: "Subscriptor creado con éxito" }, { status: 200 })


    } else {
        return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Algo salio mal' }, { status: 401 })
}
};
